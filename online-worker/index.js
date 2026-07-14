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

// ---- Stickman Fight matchmaking ----
// One global Durable Object. Players open a WebSocket to /api/sf/queue; the
// first waiting socket is held, the next one pairs with it (first = host), and
// from then on every message is relayed straight to the partner. It is just a
// relay — the host client runs the authoritative game sim.
export class Matchmaker {
  constructor(state, env) { this.state = state; this.waiting = null; this.partner = new Map(); }

  async fetch(request) {
    if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket')
      return new Response('matchmaker', { status: 200 });
    const pair = new WebSocketPair(), client = pair[0], server = pair[1];
    server.accept();
    this.join(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  join(ws) {
    ws.addEventListener('message', e => {
      const p = this.partner.get(ws);
      if (p && p.readyState === 1) { try { p.send(e.data); } catch (_) {} }
    });
    ws.addEventListener('close', () => this.leave(ws));
    ws.addEventListener('error', () => this.leave(ws));

    if (this.waiting && this.waiting !== ws && this.waiting.readyState === 1) {
      const host = this.waiting; this.waiting = null;
      this.partner.set(host, ws); this.partner.set(ws, host);
      try { host.send(JSON.stringify({ t: 'match', host: true })); } catch (_) {}
      try { ws.send(JSON.stringify({ t: 'match', host: false })); } catch (_) {}
    } else {
      this.waiting = ws;
    }
  }

  leave(ws) {
    if (this.waiting === ws) this.waiting = null;
    const p = this.partner.get(ws);
    if (p) { this.partner.delete(ws); this.partner.delete(p); try { p.close(4000, 'peer-left'); } catch (_) {} }
  }
}

// ---- "Take me to a random…" — search a keyword, pick one of the top results ----
const YT_WORDS = ['travel','cats','cooking','lofi','space','history','ocean','robots','guitar','vintage','nature','science','painting','coffee','city walk','mountains','street food','magic','origami','aquarium','thunderstorm','vinyl','pottery','skateboard','jazz','desert','waterfall','arcade','calligraphy','tiny house'];
const IG_TAGS = ['sunset','food','travel','art','nature','architecture','coffee','dog','flowers','streetphotography','ocean','mountains','cityscape','design','vintage','minimal','cat','bakery','skate','film'];
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' };
const noStore = { 'content-type': 'application/json', 'cache-control': 'no-store' };

async function randomYoutube() {
  const q = YT_WORDS[Math.floor(Math.random() * YT_WORDS.length)];
  try {
    const res = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&hl=en&gl=US', { headers: UA });
    const html = await res.text();
    const ids = [...new Set([...html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map(m => m[1]))].slice(0, 8);
    if (!ids.length) return null;
    return 'https://www.youtube.com/watch?v=' + ids[Math.floor(Math.random() * Math.min(5, ids.length))];
  } catch (e) { return null; }
}
async function randomInstagram() {
  const t = IG_TAGS[Math.floor(Math.random() * IG_TAGS.length)];
  try {
    const res = await fetch('https://www.instagram.com/explore/tags/' + t + '/', { headers: UA });
    const html = await res.text();
    const codes = [...new Set([...html.matchAll(/"(?:shortcode|code)":"([A-Za-z0-9_-]{6,})"/g)].map(m => m[1]))].slice(0, 8);
    if (!codes.length) return null;
    return 'https://www.instagram.com/p/' + codes[Math.floor(Math.random() * Math.min(5, codes.length))] + '/';
  } catch (e) { return null; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/online') {
      const id = env.ONLINE.idFromName('global');
      return env.ONLINE.get(id).fetch(request);
    }
    if (url.pathname === '/api/sf/queue') {
      const id = env.MM.idFromName('global');
      return env.MM.get(id).fetch(request);
    }
    if (url.pathname === '/api/random/youtube') {
      return new Response(JSON.stringify({ url: await randomYoutube() }), { headers: noStore });
    }
    if (url.pathname === '/api/random/instagram') {
      return new Response(JSON.stringify({ url: await randomInstagram() }), { headers: noStore });
    }
    return new Response('online-counter worker', { status: 200 });
  }
};
