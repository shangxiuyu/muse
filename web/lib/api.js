export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }), signal: options.signal || AbortSignal.timeout(30000) });
  const payload = await response.json().catch(() => ({ error: '服务响应无法读取，请确认已启动 Muse 后端。' }));
  if (!response.ok) throw new Error(payload.error || '服务暂时不可用。');
  return payload;
}

export function watchRun(id, receive, disconnected) {
  let closed = false, pollTimer, polling = false, delivery, pending;
  const stream = new EventSource(`/api/runs/${encodeURIComponent(id)}/events`);
  const stop = () => { closed = true; pending = undefined; stream.close(); clearInterval(pollTimer); };
  const deliver = snapshot => {
    if (closed) return Promise.resolve();
    // Snapshots contain all text so far: coalesce updates, never discard completion.
    if (!pending || pending.status === 'running') pending = snapshot;
    if (delivery) return delivery;
    delivery = (async () => {
      while (pending && !closed) {
        const next = pending; pending = undefined;
        try {
          await receive(next);
          if (next.status !== 'running') stop();
        } catch { startPolling(); return; }
      }
    })().finally(() => { delivery = undefined; });
    return delivery;
  };
  const startPolling = () => {
    if (closed || pollTimer) return;
    disconnected();
    // Polling reconciles a run even when a proxy interrupts its event stream.
    pollTimer = setInterval(async () => {
      if (closed || polling) return;
      polling = true;
      try { await deliver(await api(`/runs/${id}`)); } catch { disconnected(); }
      finally { polling = false; }
    }, 2500);
  };
  stream.addEventListener('snapshot', event => { try { void deliver(JSON.parse(event.data)); } catch { startPolling(); } });
  stream.onerror = startPolling;
  return stop;
}
