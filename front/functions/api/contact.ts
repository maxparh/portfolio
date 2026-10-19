interface Env {
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
  TURNSTILE_SECRET_KEY: string
}

const reply = (status: number, error?: string) => Response.json(
  error ? { ok: false, error } : { ok: true },
  { status, headers: { 'Cache-Control': 'no-store' } },
)

const field = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0)

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply(403, 'Недопустимый источник запроса.')
  }
  if (request.headers.get('Content-Type')?.split(';')[0]?.trim() !== 'application/json') {
    return reply(415, 'Ожидается JSON.')
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.TURNSTILE_SECRET_KEY) {
    return reply(503, 'Отправка временно недоступна.')
  }

  // Bound the actual streamed body, including requests without Content-Length.
  const reader = request.body?.getReader()
  if (!reader) return reply(400, 'Пустой запрос.')
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 16384) {
        await reader.cancel()
        return reply(413, 'Запрос слишком большой.')
      }
      chunks.push(value)
    }
  } catch {
    return reply(400, 'Не удалось прочитать запрос.')
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  let data: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    data = parsed as Record<string, unknown>
  } catch {
    return reply(400, 'Некорректный JSON.')
  }

  if (!field(data.token, 2048, true)) return reply(400, 'Пройдите проверку Turnstile.')
  let text: string
  if (data.action === 'message') {
    if (!field(data.name, 100) || !field(data.contact, 200) || !field(data.message, 3000, true)
      || typeof data.type !== 'string'
      || !['Техническая задача', 'Backend-модуль', 'Консультация'].includes(data.type)) {
      return reply(400, 'Проверьте поля формы.')
    }
    text = `Новая заявка!\nОт: ${data.name.trim() || 'Аноним'}\nСвязь: ${data.contact.trim() || 'Не указана'}\nТип: ${data.type}\nСообщение:\n${data.message.trim()}`
  } else if (data.action === 'subscribe' && field(data.contact, 200, true)) {
    text = `Запрос на подписку!\nКонтакт: ${data.contact.trim()}\nПользователь хочет получать обновления.`
  } else {
    return reply(400, 'Некорректный запрос.')
  }

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token }),
      signal: AbortSignal.timeout(10000),
    })
    if (!verification.ok) return reply(502, 'Проверка временно недоступна.')
    const result = await verification.json() as { success?: boolean; hostname?: string; action?: string }
    if (result.success !== true || result.hostname !== new URL(request.url).hostname || result.action !== data.action) {
      return reply(403, 'Проверка не пройдена. Попробуйте ещё раз.')
    }
    const telegram = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Plain text prevents user input from injecting Telegram HTML or links.
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(10000),
    })
    const resultTelegram = await telegram.json() as { ok?: boolean }
    if (!telegram.ok || resultTelegram.ok !== true) return reply(502, 'Не удалось отправить. Попробуйте позже.')
    return reply(200)
  } catch {
    // Never expose provider errors or URLs containing credentials.
    return reply(502, 'Сервис временно недоступен. Попробуйте позже.')
  }
}
