// Standalone Cloudflare Worker: a realtime "online devices" counter.
// It is bound to the route randomthing.org/api/online (see wrangler.toml), so
// the static Pages site can talk to it same-origin. Each open tab holds one
// hibernatable WebSocket; a single global Durable Object counts live
// connections and broadcasts the number on every join/leave.

export class OnlineCounter {
  constructor(state, env) { this.state = state; }

  async fetch(request) {
    if ((request.headers.get('Upgrade') || '').toLowerCase() === 'websocket') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);   // hibernation API
      this.broadcast();                       // tell everyone (incl. the newcomer)
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    return Response.json({ count: this.state.getWebSockets().length });
  }

  webSocketMessage() { /* presence only */ }
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
      const id = env.ONLINE.idFromName('global');
      return env.ONLINE.get(id).fetch(request);
    }
    return new Response('online-counter worker', { status: 200 });
  }
};
