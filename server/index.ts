import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomBytes } from 'node:crypto'
import { handleContactRequest } from '../api/contact-core.ts'
import { createStore, openDatabase } from './database.ts'
import { handleAdmin } from './admin.ts'

process.umask(0o077)
const path = process.env.DATABASE_PATH ?? 'data/portfolio.db'
const store = createStore(openDatabase(path))
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY ?? ''
const visitorPattern = /^[a-f0-9]{32}$/
const claimPattern = /^[a-f0-9-]{36}$/
const visitorCookie = 'portfolio_visitor'

function readVisitor(req: IncomingMessage) {
  const cookie = req.headers.cookie?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${visitorCookie}=`))
  const id = cookie?.slice(visitorCookie.length + 1)
  return id && visitorPattern.test(id) ? id : undefined
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

const publicApi = createServer(async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
    const url = new URL(req.url ?? '/', `${protocol}://${req.headers.host ?? 'localhost'}`)

    if (url.pathname === '/api/contact' || url.pathname.startsWith('/api/admin/')) {
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
      const init: RequestInit & { duplex?: 'half' } = {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: hasBody ? (req as unknown as ReadableStream) : undefined,
        duplex: 'half',
      }
      const request = new Request(url, init)
      const response = url.pathname === '/api/contact'
        ? await handleContactRequest(request, turnstileSecret, store.enqueue)
        : await handleAdmin(request, store)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.end(Buffer.from(await response.arrayBuffer()))
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      json(res, 200, { ok: true })
      return
    }
    if (req.method === 'GET' && url.pathname === '/api/projects') {
      json(res, 200, store.listProjects())
      return
    }
    if (req.method === 'GET' && url.pathname === '/api/posts') {
      json(res, 200, store.listPosts())
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/visitor') {
      if (!readVisitor(req)) {
        const id = randomBytes(16).toString('hex')
        const secure = protocol === 'https' ? '; Secure' : ''
        res.setHeader('Set-Cookie', `${visitorCookie}=${id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`)
      }
      res.writeHead(204, { 'Cache-Control': 'no-store' }).end()
      return
    }

    const match = /^\/api\/posts\/([1-9]\d{0,8})\/like$/.exec(url.pathname)
    if (match) {
      const visitor = readVisitor(req)
      if (!visitor) {
        json(res, 400, { error: 'Для лайков нужны cookie.' })
        return
      }
      if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
        res.writeHead(405, { Allow: 'GET, PUT, DELETE' }).end()
        return
      }
      if (req.method !== 'GET' && req.headers.origin !== url.origin) {
        json(res, 403, { error: 'Недопустимый источник запроса.' })
        return
      }
      const liked = req.method === 'GET' ? undefined : req.method === 'PUT'
      const result = store.getLikes(Number(match[1]), visitor, liked)
      json(res, result ? 200 : 404, result ?? { error: 'Запись не найдена.' })
      return
    }
    json(res, 404, { error: 'Маршрут не найден.' })
  } catch {
    json(res, 500, { error: 'Сервис временно недоступен.' })
  }
})

function handleWorker(req: IncomingMessage, res: ServerResponse) {
  const path = req.url ?? ''
  if (req.method === 'POST' && path === '/claim') {
    const submission = store.claimSubmission()
    if (submission) json(res, 200, submission)
    else res.writeHead(204).end()
    return
  }

  const match = /^\/(sent|retry)\/([1-9]\d*)$/.exec(path)
  const token = req.headers['x-claim-token']
  if (req.method === 'POST' && match && typeof token === 'string' && claimPattern.test(token)) {
    const id = Number(match[2])
    const updated = Number.isSafeInteger(id) && store.finishSubmission(id, token, match[1] === 'sent')
    res.writeHead(updated ? 204 : 409).end()
    return
  }
  res.writeHead(404).end()
}

const workerApi = createServer((req, res) => {
  try {
    handleWorker(req, res)
  } catch {
    res.writeHead(500).end()
  }
})

publicApi.listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '127.0.0.1')
workerApi.listen(Number(process.env.WORKER_PORT ?? 3001), process.env.WORKER_HOST ?? '127.0.0.1')
