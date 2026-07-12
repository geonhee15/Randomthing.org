/* Randomthing.org — friendly local-storage consent banner.
   Shows once until the visitor chooses; the choice lives in localStorage. */
(function () {
  var KEY = 'rt_cookie_choice';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }

  var css = ''
    + '.rt-cc{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;'
    + 'padding:16px;pointer-events:none;font-family:"Inter",system-ui,-apple-system,sans-serif;}'
    + '.rt-cc-card{pointer-events:auto;display:flex;align-items:center;gap:16px;max-width:620px;width:100%;'
    + 'background:#ffffff;color:#1b1b20;border:1px solid rgba(0,0,0,.06);border-radius:18px;padding:16px 18px;'
    + 'box-shadow:0 20px 50px rgba(20,18,12,.28);transform:translateY(140%);opacity:0;'
    + 'transition:transform .4s cubic-bezier(.2,.9,.25,1),opacity .4s ease;}'
    + '.rt-cc-in .rt-cc-card{transform:none;opacity:1;}'
    + '.rt-cc-ic{flex:0 0 auto;width:44px;height:44px;border-radius:12px;background:#f2efe6;'
    + 'display:flex;align-items:center;justify-content:center;}'
    + '.rt-cc-tx{flex:1;min-width:0;}'
    + '.rt-cc-tx h4{margin:0 0 3px;font-size:14.5px;font-weight:800;letter-spacing:-.01em;}'
    + '.rt-cc-tx p{margin:0;font-size:12.5px;line-height:1.5;color:#6a6a72;}'
    + '.rt-cc-tx a{color:#6366f1;text-decoration:none;font-weight:600;}'
    + '.rt-cc-btns{flex:0 0 auto;display:flex;gap:8px;}'
    + '.rt-cc-btns button{border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;'
    + 'border-radius:11px;padding:11px 16px;transition:background .14s,transform .1s;}'
    + '.rt-cc-btns button:active{transform:translateY(1px);}'
    + '.rt-cc-acc{background:#6366f1;color:#fff;box-shadow:0 6px 16px rgba(99,102,241,.35);}'
    + '.rt-cc-acc:hover{background:#4f46e5;}'
    + '.rt-cc-dec{background:#f0f0f2;color:#3a3a40;}'
    + '.rt-cc-dec:hover{background:#e7e7ea;}'
    + '@media (max-width:560px){.rt-cc-card{flex-wrap:wrap;}.rt-cc-btns{width:100%;}.rt-cc-btns button{flex:1;}.rt-cc-ic{display:none;}}';

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'rt-cc';
    bar.innerHTML =
      '<div class="rt-cc-card" role="dialog" aria-label="Cookie notice">' +
        '<div class="rt-cc-ic">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">' +
            '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 2 2 0 0 0-2-2z" fill="#c8a96a"/>' +
            '<circle cx="9" cy="10" r="1.3" fill="#7a5f2c"/><circle cx="13.5" cy="14.5" r="1.3" fill="#7a5f2c"/>' +
            '<circle cx="15" cy="9" r="1" fill="#7a5f2c"/><circle cx="8.5" cy="15" r="1" fill="#7a5f2c"/>' +
          '</svg>' +
        '</div>' +
        '<div class="rt-cc-tx">' +
          '<h4>Cookies &amp; local storage</h4>' +
          '<p>We keep a few things on your device — like your playlists and best scores — to make these toys work. No tracking, no third parties.</p>' +
        '</div>' +
        '<div class="rt-cc-btns">' +
          '<button class="rt-cc-dec" type="button">Decline</button>' +
          '<button class="rt-cc-acc" type="button">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('rt-cc-in'); }); });

    function choose(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      bar.classList.remove('rt-cc-in');
      setTimeout(function () { bar.remove(); }, 400);
    }
    bar.querySelector('.rt-cc-acc').addEventListener('click', function () { choose('accepted'); });
    bar.querySelector('.rt-cc-dec').addEventListener('click', function () { choose('declined'); });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
