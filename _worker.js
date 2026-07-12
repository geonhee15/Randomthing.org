// Cloudflare Pages — Advanced Mode entrypoint.
// Serves the static site (via env.ASSETS) and adds one realtime endpoint,
// /api/online, backed by a Durable Object that counts live WebSocket
// connections (i.e. devices/tabs currently on the site).

export class OnlineCounter {
  constructor(state, env) { this.state = state; }

  async fetch(request) {
    if ((request.headers.get('Upgrade') || '').toLowerCase() === 'websocket') {
      const pair = new WebSocketPair();
      // Hibernation API: the DO can sleep between events and still keep sockets.
      this.state.acceptWebSocket(pair[1]);
      this.broadcast();                 // tell everyone (incl. the newcomer) the new count
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    return Response.json({ count: this.state.getWebSockets().length });
  }

  webSocketMessage() { /* presence only — nothing to read from clients */ }
  webSocketClose(ws) { this.broadcast(ws); }
  webSocketError(ws) { this.broadcast(ws); }

  broadcast(excluding) {
    const socks = this.state.getWebSockets().filter(s => s !== excluding);
    const msg = JSON.stringify({ count: socks.length });
    for (const s of socks) { try { s.send(msg); } catch (e) {} }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/online') {
      if (!env.ONLINE) return Response.json({ count: 0 });   // binding missing → fail soft
      const id = env.ONLINE.idFromName('global');
      return env.ONLINE.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);                        // everything else = static files
  }
};
