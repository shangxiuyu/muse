import test from 'node:test';
import assert from 'node:assert/strict';
import { watchRun } from '../web/lib/api.js';

test('a terminal event retries when loading the saved project temporarily fails', async t => {
  let source, poll, attempts = 0, interruptions = 0, timerCleared = false;
  class EventSourceStub {
    constructor() { source = this; this.listeners = {}; this.closed = false; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    close() { this.closed = true; }
  }
  t.mock.method(globalThis, 'setInterval', callback => { poll = callback; return 1; });
  t.mock.method(globalThis, 'clearInterval', () => { timerCleared = true; });
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ id: 'run-1', status: 'completed' }), { headers: { 'Content-Type': 'application/json' } }));
  const original = globalThis.EventSource;
  globalThis.EventSource = EventSourceStub;
  t.after(() => { if (original === undefined) delete globalThis.EventSource; else globalThis.EventSource = original; });
  const stop = watchRun('run-1', async () => { if (++attempts === 1) throw new Error('temporary project fetch failure'); }, () => interruptions++);
  source.listeners.snapshot({ data: JSON.stringify({ id: 'run-1', status: 'completed' }) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(source.closed, false, 'failed reconciliation must not end recovery');
  assert.equal(interruptions, 1);
  await poll();
  assert.equal(attempts, 2);
  assert.equal(source.closed, true);
  assert.equal(timerCleared, true);
  stop();
});

test('streaming snapshots coalesce during a slow render without losing terminal state', async t => {
  let source, release;
  class EventSourceStub {
    constructor() { source = this; this.listeners = {}; this.closed = false; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    close() { this.closed = true; }
  }
  const original = globalThis.EventSource;
  globalThis.EventSource = EventSourceStub;
  t.after(() => { if (original === undefined) delete globalThis.EventSource; else globalThis.EventSource = original; });
  const received = [];
  const stop = watchRun('stream', async snapshot => {
    received.push(snapshot);
    if (received.length === 1) await new Promise(resolve => { release = resolve; });
  }, () => assert.fail('a burst must not disconnect'));
  const send = snapshot => source.listeners.snapshot({ data: JSON.stringify(snapshot) });
  send({ status: 'running', text: '第' });
  send({ status: 'running', text: '第一' });
  send({ status: 'running', text: '第一句' });
  send({ status: 'completed', text: '', outcome: 'message' });
  send({ status: 'running', text: '过期快照' });
  release();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(received.map(s => s.status), ['running', 'completed']);
  assert.equal(received[0].text, '第');
  assert.equal(source.closed, true);
  stop();
});
