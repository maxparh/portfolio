/** Валидация формы и Turnstile перед записью заявки в очередь. */

/** Допустимые значения поля `action`: совпадают с action() виджета Turnstile. */
const ACTIONS = ['message', 'subscribe'] as const
type Action = (typeof ACTIONS)[number]

export type ContactSubmission =
  | { action: 'message'; name: string; contact: string; type: string; message: string }
  | { action: 'subscribe'; contact: string }

/** Типы заявок формы — должны совпадать с селектом на странице контактов. */
export const MESSAGE_TYPES = ['Техническая задача', 'Backend-модуль', 'Консультация'] as const

const MAX_BODY_BYTES = 16384

const reply = (status: number, error?: string) =>
  Response.json(error ? { ok: false, error } : { ok: true }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

const isField = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0)

const isAction = (value: unknown): value is Action =>
  typeof value === 'string' && (ACTIONS as readonly string[]).includes(value)

/** Читает тело запроса с ограничением размера (в том числе без Content-Length). */
export const readBody = async (request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> => {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('empty-body')

  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new Error('too-large')
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }

  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid-json')
  return parsed
}

interface TurnstileResult {
  success?: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

/** Обрабатывает POST /api/contact и возвращает готовый Response. */
export const handleContactRequest = async (
  request: Request,
  turnstileSecret: string,
  enqueue: (submission: ContactSubmission) => void,
): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply(403, 'Недопустимый источник запроса.')
  }
  if (request.headers.get('Content-Type')?.split(';')[0]?.trim() !== 'application/json') {
    return reply(415, 'Ожидается JSON.')
  }
  if (!turnstileSecret) {
    return reply(503, 'Отправка временно недоступна.')
  }

  let data: Record<string, unknown>
  try {
    data = (await readBody(request)) as Record<string, unknown>
  } catch (error) {
    if (error instanceof Error && error.message === 'too-large') return reply(413, 'Запрос слишком большой.')
    if (error instanceof Error && error.message === 'empty-body') return reply(400, 'Пустой запрос.')
    return reply(400, 'Некорректный JSON.')
  }

  if (!isField(data.token, 2048, true)) return reply(400, 'Пройдите проверку Turnstile.')
  if (!isAction(data.action)) return reply(400, 'Некорректный запрос.')
  const action = data.action

  let submission: ContactSubmission
  if (action === 'message') {
    if (
      !isField(data.name, 100) ||
      !isField(data.contact, 200) ||
      !isField(data.message, 3000, true) ||
      typeof data.type !== 'string' ||
      !(MESSAGE_TYPES as readonly string[]).includes(data.type)
    ) {
      return reply(400, 'Проверьте поля формы.')
    }
    submission = {
      action, name: data.name.trim(), contact: data.contact.trim(),
      type: data.type, message: data.message.trim(),
    }
  } else {
    if (!isField(data.contact, 200, true)) return reply(400, 'Проверьте поля формы.')
    submission = { action, contact: data.contact.trim() }
  }

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: data.token }),
      signal: AbortSignal.timeout(10000),
    })

    // Тело ответа читаем в любом случае: Turnstile отдаёт 400 с описанием причины,
    // и только так можно отличить неверный secret (наша конфигурация) от
    // отклонённого пользователя. Наружу эти детали не отдаются.
    const result = (await verification.json().catch(() => ({}))) as TurnstileResult
    if (!verification.ok) {
      if (result['error-codes']?.includes('invalid-input-secret')) {
        console.error('Turnstile: TURNSTILE_SECRET_KEY отклонён провайдером. Проверьте secret key.')
      }
      return reply(502, 'Проверка временно недоступна.')
    }

    const hostname = new URL(request.url).hostname
    if (result.success !== true || result.hostname !== hostname || result.action !== action) {
      return reply(403, 'Проверка не пройдена. Попробуйте ещё раз.')
    }

    enqueue(submission)
    return reply(202)
  } catch {
    return reply(502, 'Сервис временно недоступен. Попробуйте позже.')
  }
}
