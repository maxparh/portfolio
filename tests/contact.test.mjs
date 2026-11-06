import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { onRequest } from '../functions/api/contact.ts'

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })
const env = { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-chat', TURNSTILE_SECRET_KEY: 'test-secret' }
const valid = { action: 'message', name: '<b>Name</b>', contact: '@example', type: 'Техническая задача', message: 'Hello', token: 'test-token' }
const invoke = (body = valid, options = {}) => onRequest({
  request: new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://portfolio.example', 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
  }), env: options.env ?? env,
})
const verify = { success: true, hostname: 'portfolio.example', action: 'message' }

test('rejects cross-origin requests, missing secrets and invalid fields before external calls', async () => {
  globalThis.fetch = () => { throw new Error('Must not fetch') }
  assert.equal((await invoke(valid, { headers: { Origin: 'https://other.example' } })).status, 403)
  assert.equal((await invoke(valid, { env: {} })).status, 503)
  for (const body of [null, [], {}, { ...valid, token: '' }, { ...valid, message: ' ' }, { ...valid, name: 42 }, { ...valid, message: 'a'.repeat(3001) }, { ...valid, type: 'unknown' }]) {
    assert.equal((await invoke(body)).status, 400)
  }
  assert.equal((await invoke({ ...valid, message: 'a'.repeat(17000) })).status, 413)
})

test('rejects wrong methods, content types and malformed JSON', async () => {
  assert.equal((await onRequest({ request: new Request('https://portfolio.example/api/contact'), env })).status, 405)
  assert.equal((await invoke(valid, { headers: { 'Content-Type': 'text/plain' } })).status, 415)
  const request = new Request('https://portfolio.example/api/contact', { method: 'POST', headers: { Origin: 'https://portfolio.example', 'Content-Type': 'application/json' }, body: '{' })
  assert.equal((await onRequest({ request, env })).status, 400)
})

test('requires successful Turnstile with matching hostname and action', async () => {
  for (const result of [{ success: false }, { ...verify, hostname: 'other.example' }, { ...verify, action: 'subscribe' }]) {
    let calls = 0
    globalThis.fetch = async () => { calls++; return Response.json(result) }
    assert.equal((await invoke()).status, 403)
    assert.equal(calls, 1)
  }
})

test('sends validated text using server credentials without HTML parsing', async () => {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, data: JSON.parse(init.body) })
    return Response.json(calls.length === 1 ? verify : { ok: true })
  }
  const response = await invoke()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(calls[0].data.secret, env.TURNSTILE_SECRET_KEY)
  assert.equal(calls[1].data.chat_id, env.TELEGRAM_CHAT_ID)
  assert.ok(calls[1].data.text.includes('<b>Name</b>'))
  assert.equal(calls[1].data.parse_mode, undefined)
})

test('supports subscription requests', async () => {
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls++
    if (calls === 1) return Response.json({ ...verify, action: 'subscribe' })
    assert.match(JSON.parse(init.body).text, /@subscriber/)
    return Response.json({ ok: true })
  }
  assert.equal((await invoke({ action: 'subscribe', contact: '@subscriber', token: 'test-token' })).status, 200)
})

test('handles Telegram errors and network failures without leaking credentials', async () => {
  for (const status of [200, 429, 500]) {
    let calls = 0
    globalThis.fetch = async () => ++calls === 1 ? Response.json(verify) : Response.json({ ok: false, description: 'private upstream error' }, { status })
    const response = await invoke()
    assert.equal(response.status, 502)
    assert.doesNotMatch(await response.text(), /test-only|private upstream/)
  }
  globalThis.fetch = async () => { throw new Error('private upstream error') }
  assert.equal((await invoke()).status, 502)
})
