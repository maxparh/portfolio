/**
 * Node.js-сервер для размещения сайта на VPS.
 *
 * Отдаёт собранный frontend из `dist/` (с SPA-fallback на index.html) и
 * обрабатывает `POST /api/contact` тем же кодом, что и Cloudflare Pages Function.
 *
 * Часть файлов импортируется с расширением `.ts`: Node.js запускает их напрямую
 * через type-stripping. Компиляция в JavaScript (`npm run build:server`) заменяет
 * такие импорты на `.js`, поэтому Docker использует уже собранный сервер.
 *
 * Конфигурация — через переменные окружения (файл `.env` в корне проекта):
 *   PORT (по умолчанию 3000), HOST (по умолчанию 0.0.0.0),
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { handleContactRequest, type ContactEnv as Env } from '../api/contact-core.ts'

const ROOT = resolve(process.env.STATIC_DIR ?? 'dist')
const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '0.0.0.0'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

const env: Env = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? '',
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
}

if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.TURNSTILE_SECRET_KEY) {
  // Не выводим значения — только факт отсутствия переменной.
  console.warn('Внимание: не заданы секреты формы. /api/contact будет отвечать 503.')
}

/** Кэш: ассеты Vite содержат хеш в имени, index.html меняется между сборками. */
const cacheControl = (file: string) =>
  file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable'

const sendFile = async (res: import('node:http').ServerResponse, file: string) => {
  const body = await readFile(file)
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': cacheControl(file),
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

    if (url.pathname === '/api/contact') {
      // Request создаётся из fetch-совместимых API: Node 18+ принимает поток
      // входящего запроса как тело (с duplex: 'half').
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
      const init: RequestInit & { duplex?: 'half' } = {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: hasBody ? (req as unknown as ReadableStream) : undefined,
        duplex: 'half',
      }
      const response = await handleContactRequest(new Request(url, init), env)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.end(Buffer.from(await response.arrayBuffer()))
      return
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }

    // Защита от path traversal: итоговый путь обязан остаться внутри корня статики.
    const candidate = resolve(join(ROOT, normalize(decodeURIComponent(url.pathname))))
    const isInside = candidate === ROOT || candidate.startsWith(ROOT + sep)
    if (isInside) {
      const info = await stat(candidate).catch(() => null)
      if (info?.isFile()) {
        await sendFile(res, candidate)
        return
      }
    }

    // SPA-fallback: любой неизвестный путь отдаёт index.html.
    await sendFile(res, join(ROOT, 'index.html'))
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Internal Server Error')
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Сайт доступен на http://${HOST}:${PORT}`)
})
