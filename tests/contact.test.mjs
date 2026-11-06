import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { handleContactRequest } from '../api/contact-core.ts'

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })
const secret = 'test-secret'
const valid = { action: 'message', name: '<b>Name</b>', contact: '@example', type: 'Техническая задача', message: 'Hello', token: 'test-token' }
const url = 'https://portfolio.example/api/contact'
const headers = { Origin: 'https://portfolio.example', 'Content-Type': 'application/json' }
const unexpectedEnqueue = () => assert.fail('Must not enqueue')
const invoke = (body = valid, options = {}) => handleContactRequest(new Request(url, {
  method: 'POST',
  headers: { ...headers, ...options.headers },
  body: JSON.stringify(body),
}), options.secret ?? secret, options.enqueue ?? unexpectedEnqueue)
const verify = { success: true, hostname: 'portfolio.example', action: 'message' }

test('rejects cross-origin requests, missing secrets and invalid fields before external calls', async () => {
  globalThis.fetch = () => { throw new Error('Must not fetch') }
  assert.equal((await invoke(valid, { headers: { Origin: 'https://other.example' } })).status, 403)
  assert.equal((await invoke(valid, { secret: '' })).status, 503)
  for (const body of [null, [], {}, { ...valid, token: '' }, { ...valid, message: ' ' }, { ...valid, name: 42 }, { ...valid, message: 'a'.repeat(3001) }, { ...valid, type: 'unknown' }]) {
    assert.equal((await invoke(body)).status, 400)
  }
  assert.equal((await invoke({ ...valid, message: 'a'.repeat(17000) })).status, 413)
})

test('rejects wrong methods, content types and malformed JSON', async () => {
  assert.equal((await handleContactRequest(new Request(url), secret, unexpectedEnqueue)).status, 405)
  assert.equal((await invoke(valid, { headers: { 'Content-Type': 'text/plain' } })).status, 415)
  const request = new Request(url, { method: 'POST', headers, body: '{' })
  assert.equal((await handleContactRequest(request, secret, unexpectedEnqueue)).status, 400)
})

test('requires successful Turnstile with matching hostname and action', async () => {
  for (const result of [{ success: false }, { ...verify, hostname: 'other.example' }, { ...verify, action: 'subscribe' }]) {
    globalThis.fetch = async () => Response.json(result)
    assert.equal((await invoke()).status, 403)
  }
})

test('queues a validated form without the Turnstile token or a Telegram request', async () => {
  const calls = []
  const queued = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, data: JSON.parse(init.body) })
    return Response.json(verify)
  }
  const response = await invoke(valid, { enqueue: (submission) => queued.push(submission) })
  assert.equal(response.status, 202)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(calls, [{
    url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    data: { secret, response: valid.token },
  }])
  const { token, ...submission } = valid
  assert.deepEqual(queued, [submission])
})

test('queues subscription requests', async () => {
  globalThis.fetch = async () => Response.json({ ...verify, action: 'subscribe' })
  const queued = []
  const response = await invoke({ action: 'subscribe', contact: ' @subscriber ', token: 'test-token' },
    { enqueue: (submission) => queued.push(submission) })
  assert.equal(response.status, 202)
  assert.deepEqual(queued, [{ action: 'subscribe', contact: '@subscriber' }])
})

test('does not claim acceptance if validation or storage fails', async () => {
  const fail = () => { throw new Error('private failure') }
  globalThis.fetch = fail
  assert.equal((await invoke()).status, 502)
  globalThis.fetch = async () => Response.json(verify)
  const response = await invoke(valid, { enqueue: fail })
  assert.equal(response.status, 502)
  assert.doesNotMatch(await response.text(), /private failure/)
})
