// Ramz E Zindagi — ramzezindagi.com (Cloudflare Pages, advanced mode)
// Poetry library (public-domain poets + Ramz's own lines) rendered on the server for SEO.
// Bindings: RAMZ_KV (daily poems), ADMIN_PASSWORD (admin login at /admin).

const SITE = 'https://ramzezindagi.com';
const COOKIE = 'ramz_admin';
const SESSION_DAYS = 14;
const PAGE_GHAZALS = 30; // = one data shard
const IG = 'https://www.instagram.com/ramz.e.zindagi';
const WA_CH = 'https://whatsapp.com/channel/0029Vb8qSo35q08iEvVaBK1j';
const YT_SUB = 'https://www.youtube.com/@ramz.e.zindagi?sub_confirmation=1';

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const html = (body, status = 200, cache = 'public, max-age=3600, s-maxage=86400') =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': cache } });
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10); // Pakistan date
const clean = (v, max = 600) => String(v == null ? '' : v).trim().slice(0, max);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- auth (admin) ---------- */
const enc = new TextEncoder();
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
}
async function makeToken(env) { const exp = Date.now() + SESSION_DAYS * 864e5; return `${exp}.${await hmac(env.ADMIN_PASSWORD, 'ramz|' + exp)}`; }
async function isAdmin(req, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, 'ramz|' + exp));
}
const cookie = (v, maxAge) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
async function ssoOk(url, env) {
  const t = url.searchParams.get('sso');
  if (!t || !env.ADMIN_PASSWORD) return false;
  const [exp, sig] = t.split('.'); const now = Date.now();
  if (!exp || !sig || +exp < now || +exp > now + 120e3) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, 'sso|ramz|' + exp));
}

/* ---------- KV daily poems ---------- */
async function loadKV(env) { if (!env.RAMZ_KV) return []; const d = await env.RAMZ_KV.get('poems', 'json'); return Array.isArray(d) ? d : []; }
const saveKV = (env, d) => env.RAMZ_KV.put('poems', JSON.stringify(d));
const published = (list) => list.filter((p) => p.show && p.date <= today()).sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
const publicPoem = ({ id, text, poet, date, note }) => ({ id, text, poet, date, note });
function fmtDate(iso) {
  const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, mo, d] = iso.split('-').map(Number); return `${d} ${m[mo - 1]} ${y}`;
}

/* ---------- static data (JSON files in /data) ---------- */
const memo = new Map();
async function data(env, origin, path) {
  if (memo.has(path)) return memo.get(path);
  const r = await env.ASSETS.fetch(new Request(origin + '/data/' + path));
  if (!r.ok) return null;
  const j = await r.json();
  if (memo.size > 40) memo.delete(memo.keys().next().value);
  memo.set(path, j);
  return j;
}
const poetsOf = (env, o) => data(env, o, 'poets.json');
const catsOf = (env, o) => data(env, o, 'cats.json');
const postsOf = (env, o) => data(env, o, 'posts.json');
async function poet(env, o, slug) { return (await poetsOf(env, o) || []).find((p) => p.slug === slug); }
async function ghazal(env, o, id) {
  const m = /^([a-z-]+?)-(\d+)$/.exec(id || ''); if (!m) return null;
  const shard = await data(env, o, `g/${m[1]}-${Math.floor((+m[2] - 1) / PAGE_GHAZALS)}.json`);
  return shard ? shard.find((g) => g.id === id) : null;
}
const parseSherId = (s) => { const m = /^([a-z-]+-\d+)-(\d+)$/.exec(s || ''); return m ? { gid: m[1], i: +m[2] - 1 } : null; };

/* ---------- html pieces ---------- */
const ICONS = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.9 19.5L3 21z"/><path d="M9 10c0 3 2 5 5 5l1.3-1.3-1.8-1-1 .8c-.9-.4-1.6-1.1-2-2l.8-1-1-1.8L9 10z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
};
const acts = (id) => `<div class="acts">
<button data-act="like" data-like="${id}" title="Pasand (save)" aria-label="Pasand">${ICONS.heart}</button>
<button data-act="copy" title="Copy" aria-label="Copy">${ICONS.copy}</button>
<button data-act="wa" title="WhatsApp par bhejein" aria-label="WhatsApp">${ICONS.wa}</button>
<button data-act="share" title="Share" aria-label="Share">${ICONS.share}</button>
<button data-act="img" title="Image banayein" aria-label="Image">${ICONS.img}</button></div>`;

function sherCard({ id, lines, ro, poet, url, big, tags, cats, poets, extra = '' }) {
  const p = poet && typeof poet === 'object' ? poet : (poets || []).find((x) => x.slug === poet) || { ur: poet || '', en: '', slug: '' };
  const lu = `<div class="ur">${url ? `<a href="${url}">` : ''}${lines.map((l) => `<span>${esc(l)}</span>`).join('')}${url ? '</a>' : ''}</div>`;
  const lr = ro && ro.some(Boolean) ? `<div class="ro">${ro.map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : '';
  const tg = tags && tags.length && cats ? `<div class="tags">${tags.map((t) => { const c = cats.find((x) => x.slug === t); return c ? `<a href="/mauzu/${c.slug}">${esc(c.en)}</a>` : ''; }).join('')}</div>` : '';
  const who = p.ur ? `<a class="who" href="${p.slug ? `/shayar/${p.slug}` : '#'}">${esc(p.ur)}${p.en ? `<small>${esc(p.en)}</small>` : ''}</a>` : '<span></span>';
  return `<article class="sher${big ? ' big' : ''}" data-sher="${id}" data-poet="${esc(p.en || p.ur)}" data-url="${url || ''}">${extra}${lu}${lr}${tg}<div class="meta">${who}${acts(id)}</div></article>`;
}

function layout({ title, desc, canonical, body, og, type = 'website', jsonld, noindex, extra = '', current = '' }) {
  const t = title ? `${title} | Ramz E Zindagi` : 'Ramz E Zindagi | رمزِ زندگی — Urdu Poetry, Ghazal aur Ashaar';
  const d = desc || 'Urdu shayari ka khazana — Ghalib, Mir, Iqbal aur 20 se zyada shayar ke 22,000+ ashaar. Mauzu ke hisaab se, roz ka sher, aur Ramz E Zindagi ki apni lines.';
  const nav = [['/shayar', 'Shayar'], ['/mauzu', 'Mauzu'], ['/daily', 'Roz ka sher'], ['/ramz', 'Ramz'], ['/pasand', 'Meri pasand']];
  return `<!doctype html><html lang="ur" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><meta name="description" content="${esc(d)}">${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<link rel="canonical" href="${esc(canonical || SITE + '/')}"><meta name="theme-color" content="#0B0F1C">
<meta property="og:site_name" content="Ramz E Zindagi"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${esc(canonical || SITE + '/')}"><meta property="og:image" content="${esc(og || SITE + '/assets/og.jpg')}"><meta property="og:locale" content="ur_PK">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t)}"><meta name="twitter:description" content="${esc(d)}"><meta name="twitter:image" content="${esc(og || SITE + '/assets/og.jpg')}">
<link rel="icon" href="/assets/favicon.ico?v=5" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=5"><link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png?v=5"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=5">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=6"><link rel="alternate" type="application/rss+xml" title="Ramz E Zindagi — Roz ka sher" href="/feed.xml">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}${extra}</head>
<body><header class="hdr"><div class="wrap"><a class="brand" href="/"><img src="/assets/favicon-192.png?v=5" alt="" width="34" height="34"><span><b>رمزِ زندگی</b><small>Ramz E Zindagi</small></span></a>
<nav class="nav" aria-label="Main">${nav.map(([h, l]) => `<a href="${h}"${current === h ? ' aria-current="page"' : ''}>${l}</a>`).join('')}<a class="srch" href="/search">Search</a><a class="hcta wa" href="${WA_CH}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24"><path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>WhatsApp channel</a><a class="hcta yt" href="${YT_SUB}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3L10 15z"/></svg>YouTube</a></nav>
<button class="burger" aria-label="Menu"><span></span></button></div></header>
<main>${body}</main>
<section class="chband"><div class="wrap"><div class="chb"><div><div class="u">ایسے اور شعر، روز</div><p>Aise aur sher roz WhatsApp channel pe. Poori ghazlein YouTube pe.</p></div><div class="btns"><a class="btn gold" href="${WA_CH}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24"><path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>WhatsApp channel join karein</a><a class="btn" href="${YT_SUB}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3L10 15z"/></svg>YouTube</a></div></div></div></section>
<footer><div class="wrap"><div><span class="u">رمزِ زندگی</span><div>Urdu poetry, dil se dil tak.</div></div>
<nav><a href="/shayar">Shayar</a><a href="/mauzu">Mauzu</a><a href="/daily">Roz ka sher</a><a href="/ramz">Ramz ki posts</a><a href="/search">Search</a><a href="${WA_CH}" rel="noopener">WhatsApp channel</a><a href="https://www.youtube.com/@ramz.e.zindagi" rel="noopener">YouTube</a><a href="${IG}" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@ramz.e.zindagi" rel="noopener">TikTok</a><a href="https://www.facebook.com/profile.php?id=61596536855182" rel="noopener">Facebook</a></nav>
<p>Classical kalaam un shayar ka hai jin ka intiqaal 50 saal se zyada pehle hua (public domain). Ramz E Zindagi ki apni lines © Ramz E Zindagi. Kisi ghalti ki nishandahi ke liye: ramz.e.zindagi@gmail.com</p></div></footer>
<script src="/assets/site.js?v=5" defer></script></body></html>`;
}
const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([h, l], i) => (h ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`) + (i < items.length - 1 ? ' <span>›</span>' : '')).join(' ')}</nav>`;
const crumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([h, l], i) => ({ '@type': 'ListItem', position: i + 1, name: l, item: h ? SITE + h : undefined })) });
function pager(base, page, pages) {
  if (pages <= 1) return '';
  const sep = base.includes('?') ? '&' : '?';
  const lnk = (n, l, cur) => (cur ? `<span aria-current="page">${l}</span>` : `<a href="${n === 1 ? base : base + sep + 'page=' + n}">${l}</a>`);
  const out = [];
  if (page > 1) out.push(lnk(page - 1, '‹ Pichhla'));
  const set = new Set([1, 2, page - 1, page, page + 1, pages - 1, pages].filter((n) => n >= 1 && n <= pages));
  let last = 0;
  for (const n of [...set].sort((a, b) => a - b)) { if (n - last > 1) out.push('<span>…</span>'); out.push(lnk(n, n, n === page)); last = n; }
  if (page < pages) out.push(lnk(page + 1, 'Agla ›'));
  return `<div class="pg">${out.join('')}</div>`;
}
const relLinks = (base, page, pages) => { const sep = base.includes('?') ? '&' : '?'; let s = ''; if (page > 1) s += `<link rel="prev" href="${SITE}${page - 1 === 1 ? base : base + sep + 'page=' + (page - 1)}">`; if (page < pages) s += `<link rel="next" href="${SITE}${base + sep + 'page=' + (page + 1)}">`; return s; };
const kvCard = (p, poets, big) => sherCard({ id: 'kv-' + p.id, lines: p.text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean), poet: (poets || []).find((x) => x.en === p.poet || x.ur === p.poet) || { ur: p.poet || 'رمزِ زندگی', en: '' }, url: '/daily#' + p.id, big, extra: `<time datetime="${esc(p.date)}">${p.date === today() ? 'Aaj ka sher · ' : ''}${esc(fmtDate(p.date))}</time>` + (p.note ? '' : ''), }).replace('<div class="meta">', (p.note ? `<p class="note">${esc(p.note)}</p>` : '') + '<div class="meta">');

/* ---------- pages ---------- */
async function homePage(env, o) {
  const [poets, cats, posts, kv] = await Promise.all([poetsOf(env, o), catsOf(env, o), postsOf(env, o), loadKV(env)]);
  const total = poets.reduce((s, p) => s + p.shers, 0);
  const daily = published(kv);
  const todays = daily.find((p) => p.date === today());
  // pick of the day: today's KV poem, else a post chosen by date
  const dayN = Math.floor(Date.now() / 864e5);
  const pick = todays ? kvCard(todays, poets, true) : (() => { const p = posts[dayN % posts.length]; return sherCard({ id: 'post-' + p.date, lines: p.ur, ro: p.ro, poet: p.poet, poets, url: '/ramz/' + p.slug, big: true, extra: `<time datetime="${today()}">Aaj ka sher · ${fmtDate(today())}</time>` }); })();
  const body = `
<section class="hero"><picture><source media="(max-width:760px)" srcset="/assets/hero-m.webp?v=5"><source srcset="/assets/hero.webp?v=5" type="image/webp"><img src="/assets/hero.jpg?v=5" alt="Ramz E Zindagi — shawl odhe ek shakhs ka saya, raat ke rang mein" width="1920" height="1080" fetchpriority="high"></picture>
<div class="wrap"><p class="kicker">Urdu poetry · Ghazal · Ashaar</p><h1>رمزِ زندگی</h1><p class="tag">روز و شب کی خاموش، اَن کہی رفاقت</p>
<p class="en">Ghalib se Iqbal tak — ${total.toLocaleString('en')} se zyada ashaar, mauzu ke hisaab se. Jo dil kehna chahta hai, woh yahan likha mil jayega.</p>
<form class="sbox" action="/search" role="search"><input name="q" placeholder="Lafz ya sher talaash karein — دل، تنہائی, yaad…" aria-label="Search" autocomplete="off"><button type="submit">Talaash</button></form>
<div class="stats"><div><b>${total.toLocaleString('en')}+</b>ashaar</div><div><b>${poets.filter((p) => p.shers).length}</b>shayar</div><div><b>${cats.length}</b>mauzu</div></div></div></section>

<section class="s"><div class="wrap"><div class="sh"><h2>آج کا شعر<small>Aaj ka sher</small></h2><a class="more" href="/daily">Roz ka kalaam →</a></div><div class="ghz">${pick}</div></div></section>

<section class="s alt"><div class="wrap"><div class="sh"><h2>موضوع کے لحاظ سے<small>Mauzu — topic ke hisaab se</small></h2><a class="more" href="/mauzu">Sab mauzu →</a></div>
<div class="chips">${cats.map((c) => `<a class="chip" href="/mauzu/${c.slug}"><span class="u">${esc(c.ur)}</span><span class="e">${esc(c.en)}</span><span class="n">${c.count.toLocaleString('en')}</span></a>`).join('')}</div></div></section>

<section class="s"><div class="wrap"><div class="sh"><h2>مشہور شعرا<small>Shayar</small></h2><a class="more" href="/shayar">Sab shayar →</a></div>
<div class="poets">${poets.filter((p) => p.shers).slice(0, 12).map(poetCard).join('')}</div></div></section>

<section class="s alt"><div class="wrap"><div class="sh"><h2>رمزِ زندگی کی پسند<small>Ramz ki posts — Instagram se</small></h2><a class="more" href="/ramz">Sab posts →</a></div>
<div class="posts">${posts.slice(0, 6).map(postCard).join('')}</div></div></section>

${daily.length ? `<section class="s daily"><div class="wrap"><div class="sh"><h2>روز کا کلام<small>Roz ka sher — Ramz ki taraf se</small></h2><a class="more" href="/daily">Sab dekhein →</a></div><div class="grid two">${daily.slice(0, 4).map((p) => kvCard(p, poets)).join('')}</div></div></section>` : ''}

<section class="s"><div class="wrap"><div class="sh"><h2>ساتھ چلیے<small>Follow Ramz E Zindagi</small></h2></div>${followHtml()}</div></section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Ramz E Zindagi', alternateName: 'رمزِ زندگی', url: SITE + '/', inLanguage: 'ur', potentialAction: { '@type': 'SearchAction', target: SITE + '/search?q={search_term_string}', 'query-input': 'required name=search_term_string' }, sameAs: [IG, 'https://www.youtube.com/@ramz.e.zindagi', 'https://www.tiktok.com/@ramz.e.zindagi'] };
  return html(layout({ body, canonical: SITE + '/', jsonld: ld, current: '/' }), 200, 'public, max-age=300, s-maxage=600');
}
const poetCard = (p) => `<a class="poet" href="/shayar/${p.slug}"><span class="yrs">${p.born ? p.born + '–' + p.died : ''}</span><div class="u">${esc(p.ur)}</div><div class="e">${esc(p.en)}</div><div class="n">${p.shers ? p.shers.toLocaleString('en') + ' ashaar' : 'Ramz ki posts'}</div></a>`;
const postCard = (p) => `<a class="post" href="/ramz/${p.slug}"><img src="/posts/${p.img}" alt="${esc(p.ur.join(' / '))}" loading="lazy" width="900" height="1125"><div class="cap"><b>${esc(p.hook)}</b><time>${esc(fmtDate(p.date))}</time></div></a>`;
function followHtml() {
  const s = [[WA_CH, 'WhatsApp channel', 'Roz ka sher', '<svg viewBox="0 0 24 24"><path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>'], [IG, 'Instagram', '@ramz.e.zindagi', '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'],
    ['https://www.youtube.com/@ramz.e.zindagi?sub_confirmation=1', 'YouTube', 'Lambi ghazlein', '<svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3L10 15z"/></svg>'],
    ['https://www.tiktok.com/@ramz.e.zindagi', 'TikTok', '@ramz.e.zindagi', '<svg viewBox="0 0 24 24"><path d="M16 2c.3 2.4 1.8 4 4 4.2V9a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V2h3z"/></svg>'],
    ['https://www.facebook.com/profile.php?id=61596536855182', 'Facebook', 'Ramz E Zindagi', '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z"/></svg>']];
  return `<div class="follow">${s.map(([h, n, d, i]) => `<a href="${h}" rel="noopener" target="_blank">${i}<div><span>${n}</span><small>${d}</small></div></a>`).join('')}</div>`;
}

async function poetsPage(env, o) {
  const poets = await poetsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Shayar']])}<h1>شعرا<span style="display:block;font-family:var(--en);font-weight:300;font-size:1rem;letter-spacing:.14em;color:var(--smoke);direction:ltr;line-height:1.5">Urdu ke mashhoor shayar</span></h1><p class="sub">Har shayar ka kalaam — ghazlein, nazmein aur chune hue ashaar.</p></div></div>
<section class="s"><div class="wrap"><div class="poets">${poets.map(poetCard).join('')}</div></div></section>`;
  return html(layout({ title: 'Shayar — Ghalib, Mir, Iqbal aur dusre Urdu shayar', desc: 'Urdu ke 20+ classical shayar ka kalaam ek jagah: Mirza Ghalib, Mir Taqi Mir, Allama Iqbal, Dagh, Momin, Jigar, Hasrat aur mazeed.', canonical: SITE + '/shayar', body, jsonld: crumbLd([['/', 'Home'], [null, 'Shayar']]), current: '/shayar' }));
}

async function poetPage(env, o, slug, page) {
  const [p, posts, cats] = await Promise.all([poet(env, o, slug), postsOf(env, o), catsOf(env, o)]);
  if (!p) return null;
  const pages = Math.max(1, p.shards);
  if (page < 1 || page > pages) return null;
  const shard = p.shards ? await data(env, o, `g/${slug}-${page - 1}.json`) : [];
  const myPosts = posts.filter((x) => x.poet === slug);
  const TYPE = { ghazal: 'Ghazal', nazm: 'Nazm', intikhab: 'Intikhab', qita: 'Qita', rubai: 'Rubai', qasida: 'Qasida', masnavi: 'Masnavi' };
  const rows = (shard || []).map((g) => `<a class="row" href="/ghazal/${g.id}${g.slug ? '/' + g.slug : ''}"><div><div class="ur">${esc(g.shers[0][0])}<span>${esc(g.shers[0][1])}</span></div>${g.ro ? `<div class="ro">${esc(g.ro[0][0])}</div>` : ''}</div><div class="t">${TYPE[g.type] || g.type} · ${g.shers.length} sher</div></a>`).join('');
  // famous shers: first sher of first 6 ghazals of page 1
  const famous = page === 1 && shard ? shard.slice(0, 6).map((g) => sherCard({ id: g.id + '-1', lines: g.shers[0], ro: g.ro ? g.ro[0] : null, poet: p, url: `/sher/${g.id}-1`, tags: g.stags[0], cats })).join('') : '';
  const base = `/shayar/${slug}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], ['/shayar', 'Shayar'], [null, p.en]])}<h1>${esc(p.ur)}</h1><h1 class="en" style="font-size:1.4rem;color:var(--ivory)">${esc(p.en)}${p.born ? ` <span style="color:var(--mute);font-size:.9rem">(${p.born}–${p.died})</span>` : ''}</h1><p class="sub">${esc(p.bio)}</p><p class="cnt">${p.ghazals} kalaam · ${p.shers.toLocaleString('en')} ashaar${myPosts.length ? ` · ${myPosts.length} Ramz posts` : ''}</p></div></div>
<section class="s"><div class="wrap">
${famous ? `<div class="sh"><h2>چند اشعار<small>${esc(p.en)} ke chune hue sher</small></h2></div><div class="grid two" style="margin-bottom:48px">${famous}</div>` : ''}
${myPosts.length ? `<div class="sh"><h2>رمزِ زندگی کی پوسٹس<small>${esc(p.en)} — Ramz ki posts</small></h2></div><div class="posts" style="margin-bottom:48px">${myPosts.map(postCard).join('')}</div>` : ''}
${rows ? `<div class="sh"><h2>تمام کلام<small>Sab kalaam${pages > 1 ? ` · safha ${page}/${pages}` : ''}</small></h2></div><div class="rows">${rows}</div>${pager(base, page, pages)}` : ''}
</div></section>`;
  const ld = [crumbLd([['/', 'Home'], ['/shayar', 'Shayar'], [null, p.en]]), { '@context': 'https://schema.org', '@type': 'Person', name: p.en, alternateName: p.ur, birthDate: p.born ? String(p.born) : undefined, deathDate: p.died ? String(p.died) : undefined, description: p.bio, url: SITE + base, jobTitle: 'Poet' }];
  return html(layout({ title: `${p.en} Shayari — ${p.ur} ke ${p.shers.toLocaleString('en')} ashaar` + (page > 1 ? ` (safha ${page})` : ''), desc: `${p.en} (${p.ur}) ki ghazlein, nazmein aur mashhoor ashaar Urdu aur Roman Urdu mein. ${p.bio}`, canonical: SITE + base + (page > 1 ? '?page=' + page : ''), body, jsonld: ld, extra: relLinks(base, page, pages), current: '/shayar' }));
}

async function ghazalPage(env, o, id) {
  const g = await ghazal(env, o, id); if (!g) return null;
  const [p, cats, poets] = await Promise.all([poet(env, o, id.replace(/-\d+$/, '')), catsOf(env, o), poetsOf(env, o)]);
  const TYPE = { ghazal: 'Ghazal', nazm: 'Nazm', intikhab: 'Intikhab-e-kalaam', qita: 'Qita', rubai: 'Rubai', qasida: 'Qasida', masnavi: 'Masnavi' };
  const items = g.shers.map((sh, i) => `<div class="sh-item" id="s${i + 1}" data-sher="${g.id}-${i + 1}" data-poet="${esc(p.en)}" data-url="/sher/${g.id}-${i + 1}"><div class="ur"><a class="lnk" href="/sher/${g.id}-${i + 1}">${sh.map((l) => `<span>${esc(l)}</span>`).join('')}</a></div>${g.ro && g.ro[i] ? `<div class="ro">${g.ro[i].map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : ''}${acts(g.id + '-' + (i + 1))}</div>`).join('');
  const tg = g.tags.map((t) => cats.find((c) => c.slug === t)).filter(Boolean);
  const canonical = `${SITE}/ghazal/${g.id}${g.slug ? '/' + g.slug : ''}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], ['/shayar', 'Shayar'], [`/shayar/${p.slug}`, p.en], [null, TYPE[g.type] || g.type]])}<h1>${esc(g.title)}</h1><p class="sub">${TYPE[g.type] || g.type} · <a href="/shayar/${p.slug}" style="color:var(--moon)">${esc(p.en)} · <span dir="rtl">${esc(p.ur)}</span></a> · ${g.shers.length} sher${g.ro ? ` · Roman Urdu ke saath` : ''}</p>${tg.length ? `<div class="chips" style="margin-top:14px">${tg.map((c) => `<a class="chip" href="/mauzu/${c.slug}"><span class="u">${esc(c.ur)}</span><span class="e">${esc(c.en)}</span></a>`).join('')}</div>` : ''}</div></div>
<section class="s"><div class="wrap"><div class="ghz">${items}</div>
<div class="btns" style="justify-content:center;margin-top:34px"><a class="btn" href="/shayar/${p.slug}">${esc(p.en)} ka aur kalaam</a><a class="btn" href="/random">Koi aur sher</a></div></div></section>`;
  const ld = [crumbLd([['/', 'Home'], ['/shayar', 'Shayar'], [`/shayar/${p.slug}`, p.en], [null, g.title]]), { '@context': 'https://schema.org', '@type': 'CreativeWork', '@id': canonical, name: g.title, headline: g.title, author: { '@type': 'Person', name: p.en, url: SITE + '/shayar/' + p.slug }, inLanguage: 'ur', genre: TYPE[g.type] || g.type, isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Ramz E Zindagi', url: SITE }, text: g.shers.map((s) => s.join(' / ')).join('\n') }];
  const desc = `${p.en} ki ${TYPE[g.type] || g.type}: "${g.shers[0][0]} / ${g.shers[0][1]}" — poore ${g.shers.length} sher Urdu${g.ro ? ' aur Roman Urdu' : ''} mein, Ramz E Zindagi par.`;
  return html(layout({ title: `${g.title} — ${p.en}`, desc, canonical, body, jsonld: ld, type: 'article', current: '/shayar' }));
}

async function sherPage(env, o, sid) {
  const ps = parseSherId(sid); if (!ps) return null;
  const g = await ghazal(env, o, ps.gid); if (!g || !g.shers[ps.i]) return null;
  const [p, cats, poets] = await Promise.all([poet(env, o, ps.gid.replace(/-\d+$/, '')), catsOf(env, o), poetsOf(env, o)]);
  const sh = g.shers[ps.i], ro = g.ro ? g.ro[ps.i] : null, tags = g.stags[ps.i] || [];
  const url = `/sher/${sid}`;
  const main = sherCard({ id: sid, lines: sh, ro, poet: p, big: true, tags, cats });
  const more = g.shers.map((s, i) => i !== ps.i ? sherCard({ id: `${g.id}-${i + 1}`, lines: s, ro: g.ro ? g.ro[i] : null, poet: p, url: `/sher/${g.id}-${i + 1}` }) : '').filter(Boolean).slice(0, 4).join('');
  // related by first tag
  let rel = '';
  if (tags[0]) { const c = cats.find((x) => x.slug === tags[0]); const pg = await data(env, o, `cat/${tags[0]}/${1 + (ps.i * 7 + g.shers.length) % Math.max(1, c.pages)}.json`); if (pg) rel = pg.filter((it) => it.id !== g.id).slice(0, 4).map((it) => sherCard({ id: `${it.id}-${it.i + 1}`, lines: it.l, ro: it.ro, poet: it.poet, poets, url: `/sher/${it.id}-${it.i + 1}` })).join(''); }
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], ['/shayar', 'Shayar'], [`/shayar/${p.slug}`, p.en], [`/ghazal/${g.id}${g.slug ? '/' + g.slug : ''}`, g.title.slice(0, 40)], [null, 'Sher']])}<h1 style="font-size:1.4rem;color:var(--smoke);font-weight:400">${esc(p.ur)} کا شعر</h1></div></div>
<section class="s"><div class="wrap"><div class="ghz">${main}
<div class="btns" style="justify-content:center;margin-top:26px"><a class="btn gold" href="/ghazal/${g.id}${g.slug ? '/' + g.slug : ''}">Poori ${g.type === 'ghazal' ? 'ghazal' : 'nazm'} parhein</a><a class="btn" href="/shayar/${p.slug}">${esc(p.en)} ka kalaam</a><a class="btn" href="/random">Koi aur sher</a></div></div>
${more ? `<div class="sh" style="margin-top:56px"><h2>اسی غزل سے<small>Isi kalaam ke aur sher</small></h2></div><div class="grid two">${more}</div>` : ''}
${rel ? `<div class="sh" style="margin-top:56px"><h2>ملتے جلتے اشعار<small>Is mauzu par aur sher</small></h2></div><div class="grid two">${rel}</div>` : ''}
</div></section>`;
  const title = `${sh[0]} — ${p.en}`;
  const desc = `${sh[0]} / ${sh[1]}${ro ? ` (${ro[0]} / ${ro[1]})` : ''} — ${p.en} ka sher, Ramz E Zindagi par. Copy karein, WhatsApp par bhejein ya image banayein.`;
  const ld = [crumbLd([['/', 'Home'], ['/shayar', 'Shayar'], [`/shayar/${p.slug}`, p.en], [null, sh[0]]]), { '@context': 'https://schema.org', '@type': 'Quotation', '@id': SITE + url, text: sh.join('\n'), creator: { '@type': 'Person', name: p.en }, isPartOf: { '@type': 'CreativeWork', name: g.title, url: `${SITE}/ghazal/${g.id}` }, inLanguage: 'ur', keywords: tags.map((t) => (cats.find((c) => c.slug === t) || {}).en).filter(Boolean).join(', ') }];
  return html(layout({ title, desc, canonical: SITE + url, body, jsonld: ld, type: 'article', current: '/shayar' }));
}

async function catsPage(env, o) {
  const cats = await catsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Mauzu']])}<h1>موضوعات</h1><p class="sub">Jis mood mein ho, usi mauzu ka sher — ishq, gham, tanhai, umeed, zindagi…</p></div></div>
<section class="s"><div class="wrap"><div class="poets">${cats.map((c) => `<a class="poet" href="/mauzu/${c.slug}"><div class="u">${esc(c.ur)}</div><div class="e">${esc(c.en)}</div><div class="n">${esc(c.desc)} · ${c.count.toLocaleString('en')} sher</div></a>`).join('')}</div></div></section>`;
  return html(layout({ title: 'Mauzu — Ishq, Gham, Tanhai, Umeed, Zindagi shayari', desc: 'Urdu shayari mauzu ke hisaab se: ishq shayari, gham, judai, yaad, tanhai, umeed, zindagi, dosti, wafa, khudi aur mazeed — 22,000+ ashaar.', canonical: SITE + '/mauzu', body, jsonld: crumbLd([['/', 'Home'], [null, 'Mauzu']]), current: '/mauzu' }));
}

async function catPage(env, o, slug, page) {
  const [cats, poets] = await Promise.all([catsOf(env, o), poetsOf(env, o)]);
  const c = cats.find((x) => x.slug === slug); if (!c) return null;
  if (page < 1 || page > c.pages) return null;
  const items = await data(env, o, `cat/${slug}/${page}.json`); if (!items) return null;
  const base = `/mauzu/${slug}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], ['/mauzu', 'Mauzu'], [null, c.en]])}<h1>${esc(c.ur)} شاعری</h1><h1 class="en" style="font-size:1.3rem;color:var(--ivory)">${esc(c.en)} shayari</h1><p class="sub">${esc(c.desc)} — ${c.count.toLocaleString('en')} ashaar${c.pages > 1 ? ` · safha ${page}/${c.pages}` : ''}</p>
<div class="chips" style="margin-top:16px">${cats.map((x) => `<a class="chip" href="/mauzu/${x.slug}"${x.slug === slug ? ' aria-current="page"' : ''}><span class="u">${esc(x.ur)}</span></a>`).join('')}</div></div></div>
<section class="s"><div class="wrap"><div class="grid two">${items.map((it) => sherCard({ id: `${it.id}-${it.i + 1}`, lines: it.l, ro: it.ro, poet: it.poet, poets, url: `/sher/${it.id}-${it.i + 1}` })).join('')}</div>${pager(base, page, c.pages)}</div></section>`;
  return html(layout({ title: `${c.en} Shayari — ${c.ur} par ${c.count.toLocaleString('en')} ashaar` + (page > 1 ? ` (safha ${page})` : ''), desc: `${c.en} (${c.ur}) shayari: Ghalib, Mir, Iqbal aur dusre shayar ke ${c.desc.toLowerCase()} par behtareen ashaar, Urdu aur Roman Urdu mein.`, canonical: SITE + base + (page > 1 ? '?page=' + page : ''), body, jsonld: crumbLd([['/', 'Home'], ['/mauzu', 'Mauzu'], [null, c.en]]), extra: relLinks(base, page, c.pages), current: '/mauzu' }));
}

async function ramzPage(env, o) {
  const posts = await postsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Ramz ki posts']])}<h1>رمزِ زندگی کی پوسٹس</h1><p class="sub">Instagram aur Facebook par share ki hui posts — har sher ke saath hook, Roman Urdu aur shayar ka naam.</p></div></div>
<section class="s"><div class="wrap"><div class="posts">${posts.map(postCard).join('')}</div><div class="btns" style="justify-content:center;margin-top:34px"><a class="btn gold" href="${IG}" rel="noopener" target="_blank">Instagram par follow karein</a></div></div></section>`;
  return html(layout({ title: 'Ramz E Zindagi ki posts — Urdu poetry images', desc: 'Ramz E Zindagi ki Instagram aur Facebook posts: Ghalib, Mir, Momin aur dusre shayar ke ashaar khoobsurat images mein, hook aur Roman Urdu ke saath.', canonical: SITE + '/ramz', body, jsonld: crumbLd([['/', 'Home'], [null, 'Ramz ki posts']]), current: '/ramz' }));
}
async function postPage(env, o, slug) {
  const [posts, poets, cats] = await Promise.all([postsOf(env, o), poetsOf(env, o), catsOf(env, o)]);
  const p = posts.find((x) => x.slug === slug); if (!p) return null;
  const po = poets.find((x) => x.slug === p.poet) || { ur: p.poet, en: p.poet, slug: '' };
  const i = posts.indexOf(p); const prev = posts[i + 1], next = posts[i - 1];
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], ['/ramz', 'Ramz ki posts'], [null, p.hook]])}<h1 class="en" style="font-size:1.5rem">${esc(p.hook)}</h1><p class="cnt">${esc(fmtDate(p.date))} · Instagram post</p></div></div>
<section class="s"><div class="wrap post-big"><img src="/posts/${p.img}" alt="${esc(p.ur.join(' / '))}" width="900" height="1125"><div>${sherCard({ id: 'post-' + p.date, lines: p.ur, ro: p.ro, poet: po, big: true, tags: p.tags, cats })}
<div class="btns" style="justify-content:center;margin-top:22px">${po.slug ? `<a class="btn" href="/shayar/${po.slug}">${esc(po.en)} ka aur kalaam</a>` : ''}<a class="btn" href="${IG}" rel="noopener" target="_blank">Instagram par dekhein</a></div>
<div class="btns" style="justify-content:space-between;margin-top:30px">${prev ? `<a class="btn" href="/ramz/${prev.slug}">‹ Pichhli post</a>` : '<span></span>'}${next ? `<a class="btn" href="/ramz/${next.slug}">Agli post ›</a>` : ''}</div></div></div></section>`;
  const ld = [crumbLd([['/', 'Home'], ['/ramz', 'Ramz ki posts'], [null, p.hook]]), { '@context': 'https://schema.org', '@type': 'ImageObject', contentUrl: `${SITE}/posts/${p.img}`, name: p.hook, caption: p.ur.join(' / ') + ' — ' + po.en, datePublished: p.date, creator: { '@type': 'Organization', name: 'Ramz E Zindagi' } }];
  return html(layout({ title: `${p.hook} — ${po.en}`, desc: `${p.ur.join(' / ')} (${p.ro.join(' / ')}) — ${po.en}. Ramz E Zindagi ki ${fmtDate(p.date)} ki post.`, canonical: `${SITE}/ramz/${slug}`, og: `${SITE}/posts/${p.img}`, body, jsonld: ld, type: 'article', current: '/ramz' }));
}

async function dailyPage(env, o) {
  const [kv, poets] = await Promise.all([loadKV(env), poetsOf(env, o)]);
  const list = published(kv);
  const body = `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Roz ka sher']])}<h1>روز کا کلام</h1><p class="sub">Har din ek naya sher — Ramz E Zindagi ki taraf se. Pehle yahan, phir Instagram par.</p></div></div>
<section class="s daily"><div class="wrap">${list.length ? `<div class="grid two">${list.map((p, i) => kvCard(p, poets, i === 0).replace('<article', `<article id="${esc(p.id)}"`)).join('')}</div>` : '<div class="empty"><p class="u">آج کا شعر جلد آئے گا</p></div>'}</div></section>`;
  return html(layout({ title: 'Roz ka sher — har din naya Urdu sher', desc: 'Ramz E Zindagi ka roz ka sher: har din ek naya Urdu sher, Instagram se pehle yahan.', canonical: SITE + '/daily', body, jsonld: crumbLd([['/', 'Home'], [null, 'Roz ka sher']]), current: '/daily' }), 200, 'public, max-age=120');
}
const searchPage = (q) => html(layout({ title: q ? `"${q}" ki talaash` : 'Sher talaash karein', desc: 'Urdu ya Roman Urdu mein lafz likhein — 22,000+ ashaar mein talaash.', canonical: SITE + '/search', noindex: true, body: `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Search']])}<h1>تلاش</h1><form class="sbox" id="sform" role="search" style="margin-top:14px"><input id="sq" name="q" value="${esc(q)}" placeholder="Lafz likhein — Urdu ya Roman: دل, tanhai, yaad…" aria-label="Search" autofocus autocomplete="off"><button type="submit">Talaash</button></form><p class="cnt">Tip: ek ya do lafz behtar kaam karte hain.</p></div></div><section class="s"><div class="wrap sres" id="sres">${q ? '' : '<div class="empty"><p class="u">کیا ڈھونڈ رہے ہیں؟</p><p>Koi bhi lafz likhein — jaise "dil", "yaad", "تنہائی".</p></div>'}</div></section>`, current: '/search' }), 200, 'no-store');
const pasandPage = () => html(layout({ title: 'Meri pasand', desc: 'Aap ke pasand kiye hue ashaar.', canonical: SITE + '/pasand', noindex: true, body: `<div class="ph"><div class="wrap">${crumbs([['/', 'Home'], [null, 'Meri pasand']])}<h1>میری پسند</h1><p class="sub">Jo sher aap ne dil (♥) se save kiye — sirf is device par mehfooz rehte hain.</p></div></div><section class="s"><div class="wrap" id="pasandList"><div class="skel" style="width:60%"></div></div></section>`, current: '/pasand' }), 200, 'no-store');

/* ---------- search api ---------- */
const normQ = (s) => s.normalize('NFC').toLowerCase().replace(/[ً-ْٰـؔؒؓؑ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[āáà]/g, 'a').replace(/[īí]/g, 'i').replace(/[ūú]/g, 'u').replace(/ñ/g, 'n');
function crc32(str) { const b = enc.encode(str); let c = -1; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (c ^ -1) >>> 0; }
async function searchApi(env, o, q) {
  const words = normQ(q).split(/[^؀-ۿa-z]+/).filter((w) => w.length >= 2).slice(0, 4);
  if (!words.length) return json({ items: [], total: 0 });
  const lists = await Promise.all(words.map(async (w) => { const b = await data(env, o, `idx/${crc32(w) % 64}.json`); if (!b) return []; if (b[w]) return b[w]; // prefix fallback
    const out = []; for (const k in b) if (k.startsWith(w)) { out.push(...b[k]); if (out.length > 3000) break; } return out; }));
  let hits = lists[0];
  for (const l of lists.slice(1)) { const s = new Set(l); hits = hits.filter((h) => s.has(h)); }
  const total = hits.length;
  const [poets] = await Promise.all([poetsOf(env, o)]);
  const items = [];
  const seenShard = new Map();
  for (const h of hits.slice(0, 24)) {
    const [gid, i] = h.split(':'); const m = /^([a-z-]+?)-(\d+)$/.exec(gid);
    const sp = `g/${m[1]}-${Math.floor((+m[2] - 1) / PAGE_GHAZALS)}.json`;
    if (!seenShard.has(sp)) { if (seenShard.size >= 8) continue; seenShard.set(sp, await data(env, o, sp)); }
    const g = (seenShard.get(sp) || []).find((x) => x.id === gid); if (!g) continue;
    items.push({ id: `${gid}-${+i + 1}`, html: sherCard({ id: `${gid}-${+i + 1}`, lines: g.shers[+i], ro: g.ro ? g.ro[+i] : null, poet: m[1], poets, url: `/sher/${gid}-${+i + 1}` }) });
  }
  return json({ total, items }, 200, { 'cache-control': 'public, max-age=3600' });
}
async function shersApi(env, o, ids) {
  const poets = await poetsOf(env, o), posts = await postsOf(env, o), kv = await loadKV(env);
  const items = [];
  for (const sid of ids.slice(0, 60)) {
    if (sid.startsWith('post-')) { const p = posts.find((x) => 'post-' + x.date === sid); if (p) items.push({ id: sid, html: sherCard({ id: sid, lines: p.ur, ro: p.ro, poet: p.poet, poets, url: '/ramz/' + p.slug }) }); continue; }
    if (sid.startsWith('kv-')) { const p = kv.find((x) => 'kv-' + x.id === sid); if (p) items.push({ id: sid, html: kvCard(p, poets) }); continue; }
    const ps = parseSherId(sid); if (!ps) continue;
    const g = await ghazal(env, o, ps.gid); if (!g || !g.shers[ps.i]) continue;
    items.push({ id: sid, html: sherCard({ id: sid, lines: g.shers[ps.i], ro: g.ro ? g.ro[ps.i] : null, poet: ps.gid.replace(/-\d+$/, ''), poets, url: '/sher/' + sid }) });
  }
  return json({ items }, 200, { 'cache-control': 'public, max-age=600' });
}

/* ---------- sitemaps / feeds ---------- */
async function sitemapIndex(env, o) {
  const sm = await data(env, o, 'sitemap.json');
  const urls = ['pages', ...Object.keys(sm)].map((k) => `<sitemap><loc>${SITE}/sitemap-${k}.xml</loc></sitemap>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</sitemapindex>`, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=86400' } });
}
async function sitemapFor(env, o, key) {
  const u = (loc, pr = '0.5', cf = 'monthly') => `<url><loc>${SITE}${loc}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`;
  let out = '';
  if (key === 'pages') {
    const [poets, cats, posts] = await Promise.all([poetsOf(env, o), catsOf(env, o), postsOf(env, o)]);
    out += u('/', '1.0', 'daily') + u('/shayar', '0.8', 'weekly') + u('/mauzu', '0.8', 'weekly') + u('/daily', '0.7', 'daily') + u('/ramz', '0.7', 'weekly');
    for (const p of poets) { out += u('/shayar/' + p.slug, '0.8'); for (let n = 2; n <= p.shards; n++) out += u(`/shayar/${p.slug}?page=${n}`, '0.4'); }
    for (const c of cats) { out += u('/mauzu/' + c.slug, '0.8', 'weekly'); for (let n = 2; n <= c.pages; n++) out += u(`/mauzu/${c.slug}?page=${n}`, '0.4'); }
    for (const p of posts) out += u('/ramz/' + p.slug, '0.6');
  } else {
    const sm = await data(env, o, 'sitemap.json'); if (!sm || !sm[key]) return null;
    for (const id of sm[key]) { const n = +id.split('-').pop(); const sh = Math.floor((n - 1) / PAGE_GHAZALS); out += u('/ghazal/' + id, '0.6'); }
    // sher urls: load shards
    const p = (await poetsOf(env, o)).find((x) => x.slug === key);
    for (let s = 0; s < (p ? p.shards : 0); s++) { const shard = await data(env, o, `g/${key}-${s}.json`); for (const g of shard || []) for (let i = 1; i <= g.shers.length; i++) out += u(`/sher/${g.id}-${i}`, '0.4'); }
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${out}</urlset>`, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=86400' } });
}
async function feed(env) {
  const list = published(await loadKV(env)).slice(0, 30);
  const items = list.map((p) => `<item><title>${esc(p.text.split('\n')[0])}</title><link>${SITE}/daily#${esc(p.id)}</link><guid>${SITE}/daily#${esc(p.id)}</guid><pubDate>${new Date(p.date + 'T04:00:00Z').toUTCString()}</pubDate><description>${esc(p.text + (p.poet ? '\n— ' + p.poet : ''))}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ramz E Zindagi — Roz ka sher</title><link>${SITE}/daily</link><description>Har din ek naya Urdu sher</description><language>ur</language>${items}</channel></rss>`, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
}
async function randomSher(env, o) {
  const poets = (await poetsOf(env, o)).filter((p) => p.shers);
  const w = poets.reduce((s, p) => s + p.ghazals, 0); let r = Math.random() * w, p = poets[0];
  for (const x of poets) { r -= x.ghazals; if (r <= 0) { p = x; break; } }
  const n = 1 + Math.floor(Math.random() * p.ghazals); const g = await ghazal(env, o, `${p.slug}-${n}`);
  const i = g ? 1 + Math.floor(Math.random() * g.shers.length) : 1;
  return new Response(null, { status: 302, headers: { Location: `/sher/${p.slug}-${n}-${i}`, 'cache-control': 'no-store' } });
}
const notFound = () => html(layout({ title: 'Nahi mila', noindex: true, body: `<section class="s"><div class="wrap empty"><p class="u">یہ صفحہ نہیں ملا</p><p>Shayad link ghalat hai. <a href="/" style="color:var(--moon)">Home par jayein</a> ya <a href="/random" style="color:var(--moon)">koi sher parhein</a>.</p></div></section>` }), 404, 'no-store');

/* ---------- admin api ---------- */
async function api(req, env, path, url) {
  const method = req.method; const o = url.origin;
  if (path === '/api/search') return searchApi(env, o, (url.searchParams.get('q') || '').slice(0, 80));
  if (path === '/api/shers') return shersApi(env, o, (url.searchParams.get('ids') || '').split(',').filter(Boolean));
  if (path === '/api/poems' && method === 'GET') return json({ poems: published(await loadKV(env)).slice(0, 60).map(publicPoem) }, 200, { 'cache-control': 'public, max-age=60' });
  if (path === '/api/admin/status') return json({ ready: !!(env.RAMZ_KV && env.ADMIN_PASSWORD), kv: !!env.RAMZ_KV, password: !!env.ADMIN_PASSWORD, admin: await isAdmin(req, env), today: today() });
  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: 'The admin password is not set yet in Cloudflare.' }, 503);
    const body = await req.json().catch(() => ({}));
    if (!safeEqual(String(body.password || ''), env.ADMIN_PASSWORD)) { await new Promise((r) => setTimeout(r, 800)); return json({ error: 'Wrong password.' }, 401); }
    return json({ ok: true }, 200, { 'set-cookie': cookie(await makeToken(env), SESSION_DAYS * 86400) });
  }
  if (path === '/api/admin/logout') return json({ ok: true }, 200, { 'set-cookie': cookie('', 0) });
  if (!path.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404);
  if (!env.RAMZ_KV) return json({ error: 'Storage (RAMZ_KV) is not connected yet.' }, 503);
  if (!(await isAdmin(req, env))) return json({ error: 'Please log in.' }, 401);
  const list = await loadKV(env);
  if (path === '/api/admin/poems' && method === 'GET') return json({ poems: list, today: today() });
  if (path === '/api/admin/poem' && method === 'POST') {
    const b = await req.json().catch(() => ({}));
    const id = clean(b.id, 40); let p = id ? list.find((x) => x.id === id) : null;
    if (id && !p) return json({ error: 'Poem not found.' }, 404);
    const text = clean(b.text, 3000); if (!text) return json({ error: 'Please write the poetry.' }, 400);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : today();
    if (!p) { p = { id: uid(), created: new Date().toISOString() }; list.push(p); }
    Object.assign(p, { text, poet: clean(b.poet, 80), note: clean(b.note, 300), date, show: b.show !== false, updated: new Date().toISOString() });
    await saveKV(env, list); return json({ ok: true, poem: p });
  }
  if (path === '/api/admin/action' && method === 'POST') {
    const b = await req.json().catch(() => ({}));
    const i = list.findIndex((x) => x.id === b.id); if (i < 0) return json({ error: 'Not found.' }, 404);
    if (b.op === 'delete') list.splice(i, 1); else if (b.op === 'toggle') list[i].show = !list[i].show; else return json({ error: 'Bad action.' }, 400);
    await saveKV(env, list); return json({ ok: true });
  }
  return json({ error: 'Not found' }, 404);
}

/* ---------- router ---------- */
export default {
  async fetch(req, env) {
    const url = new URL(req.url); const path = url.pathname.replace(/\/+$/, '') || '/'; const o = url.origin;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    try {
      if (path.startsWith('/api/')) return await api(req, env, path, url);
      if (path === '/admin') {
        if (url.searchParams.has('sso')) { const ok = await ssoOk(url, env); return new Response(null, { status: 302, headers: { Location: '/admin', 'Cache-Control': 'no-store', ...(ok ? { 'Set-Cookie': cookie(await makeToken(env), SESSION_DAYS * 86400) } : {}) } }); }
        const r = await env.ASSETS.fetch(new Request(new URL('/admin', url), req)); const h = new Headers(r.headers); h.set('x-robots-tag', 'noindex, nofollow'); h.set('cache-control', 'no-store');
        return new Response(r.body, { status: r.status, headers: h });
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return json({ error: 'Method not allowed' }, 405);
      // www -> apex
      if (url.hostname === 'www.ramzezindagi.com') return Response.redirect(SITE + url.pathname + url.search, 301);
      let m;
      if (path === '/' || path === '/index.html') return await homePage(env, o);
      if (path === '/shayar') return await poetsPage(env, o);
      if ((m = /^\/shayar\/([a-z-]+)$/.exec(path))) return (await poetPage(env, o, m[1], page)) || notFound();
      if ((m = /^\/ghazal\/([a-z-]+-\d+)(?:\/[^/]*)?$/.exec(path))) return (await ghazalPage(env, o, m[1])) || notFound();
      if ((m = /^\/sher\/([a-z-]+-\d+-\d+)$/.exec(path))) return (await sherPage(env, o, m[1])) || notFound();
      if (path === '/mauzu') return await catsPage(env, o);
      if ((m = /^\/mauzu\/([a-z]+)$/.exec(path))) return (await catPage(env, o, m[1], page)) || notFound();
      if (path === '/ramz') return await ramzPage(env, o);
      if ((m = /^\/ramz\/([a-z0-9-]+)$/.exec(path))) return (await postPage(env, o, m[1])) || notFound();
      if (path === '/daily') return await dailyPage(env, o);
      if (path === '/search') return searchPage((url.searchParams.get('q') || '').slice(0, 80));
      if (path === '/pasand') return pasandPage();
      if (path === '/random') return await randomSher(env, o);
      if (path === '/feed.xml') return await feed(env);
      if (path === '/sitemap.xml') return await sitemapIndex(env, o);
      if ((m = /^\/sitemap-([a-z-]+)\.xml$/.exec(path))) return (await sitemapFor(env, o, m[1])) || notFound();
      if (path === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /search\nDisallow: /pasand\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=86400' } });
      const r = await env.ASSETS.fetch(req);
      if (r.status === 404) return notFound();
      return r;
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
