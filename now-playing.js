/* Shared "Now Playing" chip.
 *
 * Include this on every panel EXCEPT the Audio Player itself:
 *   <script defer src="/now-playing.js"></script>
 *
 * When the Audio Player is playing and you leave it, it stores `ap_now` in
 * localStorage ({name, id, time, playing, at}) and the track blob lives in the
 * IndexedDB `ap_playlist`/`tracks` store. This script reads that, drops a small
 * chip in the corner, and keeps the song going from where it left off on every
 * page you visit. It rewrites `ap_now.time` about once a second (and right
 * before the page unloads) so the next page resumes seamlessly. It only stops
 * when you hit the chip's ✕ (or stop it back in the Audio Player) — navigating
 * around, and whatever you do inside a panel, never interrupts it.
 */
(function () {
  // The Audio Player runs its own transport — don't double up there.
  if (/\/Audio-Player\//i.test(location.pathname)) return;

  var np;
  try { np = JSON.parse(localStorage.getItem('ap_now') || 'null'); } catch (e) { np = null; }
  if (!np || np.id == null) return;

  var PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---- styles (self-contained, prefixed to avoid clashes) ----
  var css = ''
    + '.rtnp{position:fixed;z-index:2147483000;display:flex;align-items:center;gap:10px;'
    + 'left:max(14px,env(safe-area-inset-left));bottom:max(14px,calc(env(safe-area-inset-bottom) + 14px));'
    + 'background:#fff;color:#1d1d1f;border:1px solid rgba(0,0,0,.08);box-shadow:0 10px 30px rgba(0,0,0,.18);'
    + 'border-radius:14px;padding:9px 10px 9px 11px;max-width:min(320px,78vw);'
    + 'font-family:"Inter",system-ui,-apple-system,sans-serif;-webkit-user-select:none;user-select:none;}'
    + '.rtnp .np-toggle{flex:0 0 auto;width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;'
    + 'background:#1d1d1f;color:#fff;display:flex;align-items:center;justify-content:center;padding:0;}'
    + '.rtnp .np-toggle svg{width:16px;height:16px;}'
    + '.rtnp .np-txt{display:flex;flex-direction:column;min-width:0;}'
    + '.rtnp .np-k{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a9aa2;}'
    + '.rtnp .np-name{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.rtnp .np-x{flex:0 0 auto;width:28px;height:28px;border-radius:9px;border:none;cursor:pointer;'
    + 'background:rgba(0,0,0,.06);color:#6a6a72;display:flex;align-items:center;justify-content:center;padding:0;}'
    + '.rtnp .np-x svg{width:14px;height:14px;}'
    + '.rtnp .np-x:hover{background:rgba(226,59,46,.16);color:#d33;}'
    + '@media (max-width:380px){.rtnp{max-width:min(280px,86vw);}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---- chip ----
  var el = document.createElement('div'); el.className = 'rtnp';
  el.innerHTML =
    '<button class="np-toggle" type="button" aria-label="Play or pause"></button>' +
    '<div class="np-txt"><span class="np-k">Now Playing</span><span class="np-name"></span></div>' +
    '<button class="np-x" type="button" aria-label="Stop">' + CLOSE + '</button>';
  (document.body || document.documentElement).appendChild(el);

  var nameEl = el.querySelector('.np-name'),
      tg = el.querySelector('.np-toggle'),
      xb = el.querySelector('.np-x');
  nameEl.textContent = np.name || 'Track';

  var audio = new Audio(); audio.preload = 'auto';
  var url = null, playing = !!np.playing, ready = false, saver = 0;
  function icon() { tg.innerHTML = playing ? PAUSE : PLAY; }
  icon();

  function save() {
    try {
      localStorage.setItem('ap_now', JSON.stringify({
        name: np.name, id: np.id,
        time: (audio.currentTime || np.time || 0),
        playing: playing, at: Date.now()
      }));
    } catch (e) {}
  }
  function stop() {
    try { audio.pause(); } catch (e) {}
    if (url) { try { URL.revokeObjectURL(url); } catch (e) {} url = null; }
    try { localStorage.removeItem('ap_now'); } catch (e) {}
    if (saver) clearInterval(saver);
    el.remove();
  }

  // resume playback once the user touches the page, in case autoplay was blocked
  var armed = false;
  function armResume() {
    if (armed) return; armed = true;
    var h = function () { armed = false; if (playing && audio.paused) audio.play().catch(function () {}); };
    document.addEventListener('pointerdown', h, { once: true });
    document.addEventListener('keydown', h, { once: true });
  }
  function tryPlay() {
    audio.play().then(function () { playing = true; icon(); save(); })
      .catch(function () { armResume(); });   // keep intent = playing; wait for a gesture
  }

  // load the blob from IndexedDB
  try {
    var rq = indexedDB.open('ap_playlist', 1);
    rq.onsuccess = function (e) {
      var dbc = e.target.result;
      try {
        var g = dbc.transaction('tracks', 'readonly').objectStore('tracks').get(np.id);
        g.onsuccess = function () {
          var rec = g.result;
          if (!rec || !rec.blob) { el.remove(); return; }
          url = URL.createObjectURL(rec.blob); audio.src = url;
          audio.addEventListener('loadedmetadata', function () {
            try { audio.currentTime = Math.min(np.time || 0, (audio.duration || 1e9) - 0.2); } catch (_) {}
            ready = true;
            if (playing) tryPlay();
          });
          audio.addEventListener('ended', function () { playing = false; icon(); save(); });
        };
        g.onerror = function () { el.remove(); };
      } catch (_) { el.remove(); }
    };
    rq.onerror = function () { el.remove(); };
  } catch (e) { el.remove(); }

  tg.addEventListener('click', function () {
    if (playing) { try { audio.pause(); } catch (e) {} playing = false; icon(); save(); }
    else { playing = true; icon(); if (ready) audio.play().catch(function () {}); save(); }
  });
  xb.addEventListener('click', stop);

  saver = setInterval(function () { if (playing && !audio.paused) save(); }, 1000);
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
})();
