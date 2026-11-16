/* Ramz E Zindagi — site interactions */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = 'https://ramzezindagi.com';

  // nav
  const burger = $('.burger'), nav = $('.nav');
  if (burger) burger.onclick = () => nav.classList.toggle('open');

  // toast
  let tmr;
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(tmr); tmr = setTimeout(() => t.classList.remove('on'), 1800);
  }

  // likes (saved on this device)
  const LK = 'ramz_pasand';
  const likes = () => { try { return JSON.parse(localStorage.getItem(LK) || '[]'); } catch { return []; } };
  const setLikes = (l) => { try { localStorage.setItem(LK, JSON.stringify(l.slice(-300))); } catch {} };
  function paintLikes() {
    const l = new Set(likes());
    $$('[data-like]').forEach((b) => b.classList.toggle('liked', l.has(b.dataset.like)));
    const c = $('#pasandCount'); if (c) c.textContent = l.size;
  }
  paintLikes();

  function sherData(el) {
    const card = el.closest('[data-sher]');
    const ur = $$('.ur span, .ur a span', card).map((s) => s.textContent.trim()).filter(Boolean);
    const ro = $$('.ro span', card).map((s) => s.textContent.trim());
    const poet = (card.dataset.poet || '').trim();
    const url = card.dataset.url ? SITE + card.dataset.url : location.href.split('#')[0];
    return { id: card.dataset.sher, ur, ro, poet, url };
  }
  const textOf = (d) => d.ur.join('\n') + (d.ro.length ? '\n' + d.ro.join('\n') : '') + (d.poet ? '\n— ' + d.poet : '') + '\n' + d.url;

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    e.preventDefault();
    const d = sherData(b), act = b.dataset.act;
    if (act === 'copy') {
      try { await navigator.clipboard.writeText(textOf(d)); toast('Copy ho gaya'); } catch { toast('Copy nahi hua'); }
    } else if (act === 'wa') {
      window.open('https://wa.me/?text=' + encodeURIComponent(textOf(d)), '_blank', 'noopener');
    } else if (act === 'share') {
      if (navigator.share) { try { await navigator.share({ title: 'Ramz E Zindagi', text: d.ur.join('\n') + (d.poet ? '\n— ' + d.poet : ''), url: d.url }); } catch {} }
      else { try { await navigator.clipboard.writeText(d.url); toast('Link copy ho gaya'); } catch {} }
    } else if (act === 'like') {
      let l = likes();
      if (l.includes(d.id)) { l = l.filter((x) => x !== d.id); toast('Pasand se hata diya'); }
      else { l.push(d.id); toast('Meri pasand mein save ho gaya'); }
      setLikes(l); paintLikes();
    } else if (act === 'img') {
      makeImage(d);
    }
  });

  // sher -> image (1080x1350, like the Instagram posts)
  async function makeImage(d) {
    try { await document.fonts.load('700 56px "Noto Nastaliq Urdu"'); await document.fonts.load('italic 400 30px "Spectral"'); } catch {}
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0f1c'); g.addColorStop(1, '#141a2f');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // soft moon glow
    const r = x.createRadialGradient(W * .78, H * .18, 10, W * .78, H * .18, 420); r.addColorStop(0, 'rgba(214,178,108,.16)'); r.addColorStop(1, 'rgba(214,178,108,0)');
    x.fillStyle = r; x.fillRect(0, 0, W, H);
    // stars
    for (let i = 0; i < 90; i++) { x.fillStyle = 'rgba(255,255,255,' + (Math.random() * .5 + .1) + ')'; x.beginPath(); x.arc(Math.random() * W, Math.random() * H * .55, Math.random() * 1.6 + .3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(214,178,108,.45)'; x.lineWidth = 2; x.strokeRect(44, 44, W - 88, H - 88);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#d6b26c'; x.font = '400 26px "Spectral"'; x.letterSpacing = '8px';
    x.fillText('R A M Z   E   Z I N D A G I', W / 2, 120);
    x.letterSpacing = '0px';
    const n = d.ur.length, big = n <= 2;
    const fs = big ? 58 : n <= 4 ? 46 : 38, lh = fs * 2.15;
    const startY = H / 2 - ((n - 1) * lh + (d.ro.length ? n * 34 : 0)) / 2 - 20;
    x.direction = 'rtl';
    d.ur.forEach((l, i) => {
      const y = startY + i * (lh + (d.ro.length ? 34 : 0));
      x.fillStyle = '#eee8da'; x.font = '700 ' + fs + 'px "Noto Nastaliq Urdu"'; x.fillText(l, W / 2, y);
      if (d.ro[i]) { x.direction = 'ltr'; x.fillStyle = '#9aa0b5'; x.font = 'italic 400 28px "Spectral"'; x.fillText(d.ro[i], W / 2, y + lh / 2 + 8); x.direction = 'rtl'; }
    });
    x.direction = 'ltr';
    if (d.poet) { x.fillStyle = '#d6b26c'; x.font = '400 32px "Spectral"'; x.letterSpacing = '4px'; x.fillText('— ' + d.poet.toUpperCase(), W / 2, H - 230); x.letterSpacing = '0px'; }
    x.fillStyle = '#9aa0b5'; x.font = '400 26px "Spectral"'; x.fillText('@ramz.e.zindagi  ·  ramzezindagi.com', W / 2, H - 120);
    let w = $('.imgwrap');
    if (!w) {
      w = document.createElement('div'); w.className = 'imgwrap';
      w.innerHTML = '<button class="x" aria-label="Close">×</button><a class="btn gold dl" download="ramz-e-zindagi.png">Download image</a>';
      w.onclick = (ev) => { if (ev.target === w || ev.target.classList.contains('x')) w.classList.remove('on'); };
      document.body.appendChild(w);
    }
    $$('canvas', w).forEach((o) => o.remove());
    w.insertBefore(c, w.firstChild);
    $('.dl', w).href = c.toDataURL('image/png');
    w.classList.add('on');
  }

  // search page
  const sq = $('#sq'), sres = $('#sres');
  if (sq && sres) {
    const run = async (q) => {
      q = q.trim(); if (!q) return;
      history.replaceState(null, '', '/search?q=' + encodeURIComponent(q));
      sres.innerHTML = '<div class="empty">Talaash jari hai…</div>';
      const r = await fetch('/api/search?q=' + encodeURIComponent(q)).then((r) => r.json()).catch(() => ({ items: [] }));
      if (!r.items || !r.items.length) { sres.innerHTML = '<div class="empty"><p class="u">کچھ نہیں ملا</p><p>Koi sher nahi mila. Koi aur lafz try karein — Urdu ya Roman Urdu dono chalte hain.</p></div>'; return; }
      sres.innerHTML = '<p style="color:var(--smoke);margin-bottom:16px">' + r.total + ' ashaar mile' + (r.total > r.items.length ? ' (pehle ' + r.items.length + ')' : '') + '</p><div class="grid two">' + r.items.map((it) => it.html).join('') + '</div>';
      paintLikes();
    };
    $('#sform').onsubmit = (e) => { e.preventDefault(); run(sq.value); };
    if (sq.value) run(sq.value);
  }

  // pasand page
  const pl = $('#pasandList');
  if (pl) {
    const ids = likes().slice().reverse();
    if (!ids.length) pl.innerHTML = '<div class="empty"><p class="u">ابھی کچھ پسند نہیں کیا</p><p>Kisi bhi sher par dil (♥) dabayein — woh yahan save ho jayega. Sirf is device par.</p></div>';
    else fetch('/api/shers?ids=' + ids.join(',')).then((r) => r.json()).then((r) => { pl.innerHTML = '<div class="grid two">' + r.items.map((i) => i.html).join('') + '</div>'; paintLikes(); });
  }
})();
