var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-BnwKt3/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// .wrangler/tmp/pages-NlxGsX/bundledWorker-0.9713372849735997.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
__name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader2.apply(null, argArray)
    ]);
  }
});
var SITE = "https://ramzezindagi.com";
var COOKIE = "ramz_admin";
var SESSION_DAYS = 14;
var PAGE_GHAZALS = 30;
var IG = "https://www.instagram.com/ramz.e.zindagi";
var json = /* @__PURE__ */ __name2((data2, status = 200, extra = {}) => new Response(JSON.stringify(data2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } }), "json");
var html = /* @__PURE__ */ __name2((body, status = 200, cache = "public, max-age=3600, s-maxage=86400") => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": cache } }), "html");
var esc = /* @__PURE__ */ __name2((s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
var today = /* @__PURE__ */ __name2(() => new Date(Date.now() + 5 * 36e5).toISOString().slice(0, 10), "today");
var clean = /* @__PURE__ */ __name2((v, max = 600) => String(v == null ? "" : v).trim().slice(0, max), "clean");
var uid = /* @__PURE__ */ __name2(() => Date.now().toString(36) + Math.random().toString(36).slice(2, 8), "uid");
var enc = new TextEncoder();
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmac, "hmac");
__name2(hmac, "hmac");
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length)
    return false;
  let r = 0;
  for (let i = 0; i < a.length; i++)
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
__name(safeEqual, "safeEqual");
__name2(safeEqual, "safeEqual");
async function makeToken(env) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return `${exp}.${await hmac(env.ADMIN_PASSWORD, "ramz|" + exp)}`;
}
__name(makeToken, "makeToken");
__name2(makeToken, "makeToken");
async function isAdmin(req, env) {
  if (!env.ADMIN_PASSWORD)
    return false;
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!m)
    return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || +exp < Date.now())
    return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, "ramz|" + exp));
}
__name(isAdmin, "isAdmin");
__name2(isAdmin, "isAdmin");
var cookie = /* @__PURE__ */ __name2((v, maxAge) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`, "cookie");
async function ssoOk(url, env) {
  const t = url.searchParams.get("sso");
  if (!t || !env.ADMIN_PASSWORD)
    return false;
  const [exp, sig] = t.split(".");
  const now = Date.now();
  if (!exp || !sig || +exp < now || +exp > now + 12e4)
    return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, "sso|ramz|" + exp));
}
__name(ssoOk, "ssoOk");
__name2(ssoOk, "ssoOk");
async function loadKV(env) {
  if (!env.RAMZ_KV)
    return [];
  const d = await env.RAMZ_KV.get("poems", "json");
  return Array.isArray(d) ? d : [];
}
__name(loadKV, "loadKV");
__name2(loadKV, "loadKV");
var saveKV = /* @__PURE__ */ __name2((env, d) => env.RAMZ_KV.put("poems", JSON.stringify(d)), "saveKV");
var published = /* @__PURE__ */ __name2((list) => list.filter((p) => p.show && p.date <= today()).sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created)), "published");
var publicPoem = /* @__PURE__ */ __name2(({ id, text, poet: poet2, date, note }) => ({ id, text, poet: poet2, date, note }), "publicPoem");
function fmtDate(iso) {
  const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [y, mo, d] = iso.split("-").map(Number);
  return `${d} ${m[mo - 1]} ${y}`;
}
__name(fmtDate, "fmtDate");
__name2(fmtDate, "fmtDate");
var memo = /* @__PURE__ */ new Map();
async function data(env, origin, path) {
  if (memo.has(path))
    return memo.get(path);
  const r = await env.ASSETS.fetch(new Request(origin + "/data/" + path));
  if (!r.ok)
    return null;
  const j = await r.json();
  if (memo.size > 40)
    memo.delete(memo.keys().next().value);
  memo.set(path, j);
  return j;
}
__name(data, "data");
__name2(data, "data");
var poetsOf = /* @__PURE__ */ __name2((env, o) => data(env, o, "poets.json"), "poetsOf");
var catsOf = /* @__PURE__ */ __name2((env, o) => data(env, o, "cats.json"), "catsOf");
var postsOf = /* @__PURE__ */ __name2((env, o) => data(env, o, "posts.json"), "postsOf");
async function poet(env, o, slug) {
  return (await poetsOf(env, o) || []).find((p) => p.slug === slug);
}
__name(poet, "poet");
__name2(poet, "poet");
async function ghazal(env, o, id) {
  const m = /^([a-z-]+?)-(\d+)$/.exec(id || "");
  if (!m)
    return null;
  const shard = await data(env, o, `g/${m[1]}-${Math.floor((+m[2] - 1) / PAGE_GHAZALS)}.json`);
  return shard ? shard.find((g) => g.id === id) : null;
}
__name(ghazal, "ghazal");
__name2(ghazal, "ghazal");
var parseSherId = /* @__PURE__ */ __name2((s) => {
  const m = /^([a-z-]+-\d+)-(\d+)$/.exec(s || "");
  return m ? { gid: m[1], i: +m[2] - 1 } : null;
}, "parseSherId");
var ICONS = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.9 19.5L3 21z"/><path d="M9 10c0 3 2 5 5 5l1.3-1.3-1.8-1-1 .8c-.9-.4-1.6-1.1-2-2l.8-1-1-1.8L9 10z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 16l-5-5-9 9"/></svg>'
};
var acts = /* @__PURE__ */ __name2((id) => `<div class="acts">
<button data-act="like" data-like="${id}" title="Pasand (save)" aria-label="Pasand">${ICONS.heart}</button>
<button data-act="copy" title="Copy" aria-label="Copy">${ICONS.copy}</button>
<button data-act="wa" title="WhatsApp par bhejein" aria-label="WhatsApp">${ICONS.wa}</button>
<button data-act="share" title="Share" aria-label="Share">${ICONS.share}</button>
<button data-act="img" title="Image banayein" aria-label="Image">${ICONS.img}</button></div>`, "acts");
function sherCard({ id, lines, ro, poet: poet2, url, big, tags, cats, poets, extra = "" }) {
  const p = poet2 && typeof poet2 === "object" ? poet2 : (poets || []).find((x) => x.slug === poet2) || { ur: poet2 || "", en: "", slug: "" };
  const lu = `<div class="ur">${url ? `<a href="${url}">` : ""}${lines.map((l) => `<span>${esc(l)}</span>`).join("")}${url ? "</a>" : ""}</div>`;
  const lr = ro && ro.some(Boolean) ? `<div class="ro">${ro.map((l) => `<span>${esc(l)}</span>`).join("")}</div>` : "";
  const tg = tags && tags.length && cats ? `<div class="tags">${tags.map((t) => {
    const c = cats.find((x) => x.slug === t);
    return c ? `<a href="/mauzu/${c.slug}">${esc(c.en)}</a>` : "";
  }).join("")}</div>` : "";
  const who = p.ur ? `<a class="who" href="${p.slug ? `/shayar/${p.slug}` : "#"}">${esc(p.ur)}${p.en ? `<small>${esc(p.en)}</small>` : ""}</a>` : "<span></span>";
  return `<article class="sher${big ? " big" : ""}" data-sher="${id}" data-poet="${esc(p.en || p.ur)}" data-url="${url || ""}">${extra}${lu}${lr}${tg}<div class="meta">${who}${acts(id)}</div></article>`;
}
__name(sherCard, "sherCard");
__name2(sherCard, "sherCard");
function layout({ title, desc, canonical, body, og, type = "website", jsonld, noindex, extra = "", current = "" }) {
  const t = title ? `${title} | Ramz E Zindagi` : "Ramz E Zindagi | \u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC \u2014 Urdu Poetry, Ghazal aur Ashaar";
  const d = desc || "Urdu shayari ka khazana \u2014 Ghalib, Mir, Iqbal aur 20 se zyada shayar ke 22,000+ ashaar. Mauzu ke hisaab se, roz ka sher, aur Ramz E Zindagi ki apni lines.";
  const nav = [["/shayar", "Shayar"], ["/mauzu", "Mauzu"], ["/daily", "Roz ka sher"], ["/ramz", "Ramz"], ["/pasand", "Meri pasand"]];
  return `<!doctype html><html lang="ur" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><meta name="description" content="${esc(d)}">${noindex ? '<meta name="robots" content="noindex,follow">' : ""}
<link rel="canonical" href="${esc(canonical || SITE + "/")}"><meta name="theme-color" content="#0B0F1C">
<meta property="og:site_name" content="Ramz E Zindagi"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${esc(canonical || SITE + "/")}"><meta property="og:image" content="${esc(og || SITE + "/assets/og.jpg")}"><meta property="og:locale" content="ur_PK">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t)}"><meta name="twitter:description" content="${esc(d)}"><meta name="twitter:image" content="${esc(og || SITE + "/assets/og.jpg")}">
<link rel="icon" href="/assets/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=3"><link rel="alternate" type="application/rss+xml" title="Ramz E Zindagi \u2014 Roz ka sher" href="/feed.xml">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}<\/script>` : ""}${extra}</head>
<body><header class="hdr"><div class="wrap"><a class="brand" href="/"><img src="/assets/favicon-192.png" alt="" width="34" height="34"><span><b>\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC</b><small>Ramz E Zindagi</small></span></a>
<nav class="nav" aria-label="Main">${nav.map(([h, l]) => `<a href="${h}"${current === h ? ' aria-current="page"' : ""}>${l}</a>`).join("")}<a class="srch" href="/search">Search</a></nav>
<button class="burger" aria-label="Menu"><span></span></button></div></header>
<main>${body}</main>
<footer><div class="wrap"><div><span class="u">\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC</span><div>Urdu poetry, dil se dil tak.</div></div>
<nav><a href="/shayar">Shayar</a><a href="/mauzu">Mauzu</a><a href="/daily">Roz ka sher</a><a href="/ramz">Ramz ki posts</a><a href="/search">Search</a><a href="${IG}" rel="noopener">Instagram</a><a href="https://www.youtube.com/@ramz.e.zindagi" rel="noopener">YouTube</a><a href="https://www.tiktok.com/@ramz.e.zindagi" rel="noopener">TikTok</a><a href="https://www.facebook.com/profile.php?id=61596536855182" rel="noopener">Facebook</a></nav>
<p>Classical kalaam un shayar ka hai jin ka intiqaal 50 saal se zyada pehle hua (public domain). Ramz E Zindagi ki apni lines \xA9 Ramz E Zindagi. Kisi ghalti ki nishandahi ke liye: ramz.e.zindagi@gmail.com</p></div></footer>
<script src="/assets/site.js?v=3" defer><\/script></body></html>`;
}
__name(layout, "layout");
__name2(layout, "layout");
var crumbs = /* @__PURE__ */ __name2((items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([h, l], i) => (h ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`) + (i < items.length - 1 ? " <span>\u203A</span>" : "")).join(" ")}</nav>`, "crumbs");
var crumbLd = /* @__PURE__ */ __name2((items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: h ? SITE + h : void 0 })) }), "crumbLd");
function pager(base, page, pages) {
  if (pages <= 1)
    return "";
  const sep = base.includes("?") ? "&" : "?";
  const lnk = /* @__PURE__ */ __name2((n, l, cur) => cur ? `<span aria-current="page">${l}</span>` : `<a href="${n === 1 ? base : base + sep + "page=" + n}">${l}</a>`, "lnk");
  const out = [];
  if (page > 1)
    out.push(lnk(page - 1, "\u2039 Pichhla"));
  const set = new Set([1, 2, page - 1, page, page + 1, pages - 1, pages].filter((n) => n >= 1 && n <= pages));
  let last = 0;
  for (const n of [...set].sort((a, b) => a - b)) {
    if (n - last > 1)
      out.push("<span>\u2026</span>");
    out.push(lnk(n, n, n === page));
    last = n;
  }
  if (page < pages)
    out.push(lnk(page + 1, "Agla \u203A"));
  return `<div class="pg">${out.join("")}</div>`;
}
__name(pager, "pager");
__name2(pager, "pager");
var relLinks = /* @__PURE__ */ __name2((base, page, pages) => {
  const sep = base.includes("?") ? "&" : "?";
  let s = "";
  if (page > 1)
    s += `<link rel="prev" href="${SITE}${page - 1 === 1 ? base : base + sep + "page=" + (page - 1)}">`;
  if (page < pages)
    s += `<link rel="next" href="${SITE}${base + sep + "page=" + (page + 1)}">`;
  return s;
}, "relLinks");
var kvCard = /* @__PURE__ */ __name2((p, poets, big) => sherCard({ id: "kv-" + p.id, lines: p.text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean), poet: (poets || []).find((x) => x.en === p.poet || x.ur === p.poet) || { ur: p.poet || "\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC", en: "" }, url: "/daily#" + p.id, big, extra: `<time datetime="${esc(p.date)}">${p.date === today() ? "Aaj ka sher \xB7 " : ""}${esc(fmtDate(p.date))}</time>` + (p.note ? "" : "") }).replace('<div class="meta">', (p.note ? `<p class="note">${esc(p.note)}</p>` : "") + '<div class="meta">'), "kvCard");
async function homePage(env, o) {
  const [poets, cats, posts, kv] = await Promise.all([poetsOf(env, o), catsOf(env, o), postsOf(env, o), loadKV(env)]);
  const total = poets.reduce((s, p) => s + p.shers, 0);
  const daily = published(kv);
  const todays = daily.find((p) => p.date === today());
  const dayN = Math.floor(Date.now() / 864e5);
  const pick = todays ? kvCard(todays, poets, true) : (() => {
    const p = posts[dayN % posts.length];
    return sherCard({ id: "post-" + p.date, lines: p.ur, ro: p.ro, poet: p.poet, poets, url: "/ramz/" + p.slug, big: true, extra: `<time datetime="${today()}">Aaj ka sher \xB7 ${fmtDate(today())}</time>` });
  })();
  const body = `
<section class="hero"><picture><source media="(max-width:760px)" srcset="/assets/hero-m.webp"><source srcset="/assets/hero.webp" type="image/webp"><img src="/assets/hero.jpg" alt="Raat ke aasman ke neeche shawl odhe ek shakhs, chaand ko dekhta hua" width="1672" height="941" fetchpriority="high"></picture>
<div class="wrap"><p class="kicker">Urdu poetry \xB7 Ghazal \xB7 Ashaar</p><h1>\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC</h1><p class="tag">\u0631\u0648\u0632 \u0648 \u0634\u0628 \u06A9\u06CC \u062E\u0627\u0645\u0648\u0634\u060C \u0627\u064E\u0646 \u06A9\u06C1\u06CC \u0631\u0641\u0627\u0642\u062A</p>
<p class="en">Ghalib se Iqbal tak \u2014 ${total.toLocaleString("en")} se zyada ashaar, mauzu ke hisaab se. Jo dil kehna chahta hai, woh yahan likha mil jayega.</p>
<form class="sbox" action="/search" role="search"><input name="q" placeholder="Lafz ya sher talaash karein \u2014 \u062F\u0644\u060C \u062A\u0646\u06C1\u0627\u0626\u06CC, yaad\u2026" aria-label="Search" autocomplete="off"><button type="submit">Talaash</button></form>
<div class="stats"><div><b>${total.toLocaleString("en")}+</b>ashaar</div><div><b>${poets.filter((p) => p.shers).length}</b>shayar</div><div><b>${cats.length}</b>mauzu</div></div></div></section>

<section class="s"><div class="wrap"><div class="sh"><h2>\u0622\u062C \u06A9\u0627 \u0634\u0639\u0631<small>Aaj ka sher</small></h2><a class="more" href="/daily">Roz ka kalaam \u2192</a></div><div class="ghz">${pick}</div></div></section>

<section class="s alt"><div class="wrap"><div class="sh"><h2>\u0645\u0648\u0636\u0648\u0639 \u06A9\u06D2 \u0644\u062D\u0627\u0638 \u0633\u06D2<small>Mauzu \u2014 topic ke hisaab se</small></h2><a class="more" href="/mauzu">Sab mauzu \u2192</a></div>
<div class="chips">${cats.map((c) => `<a class="chip" href="/mauzu/${c.slug}"><span class="u">${esc(c.ur)}</span><span class="e">${esc(c.en)}</span><span class="n">${c.count.toLocaleString("en")}</span></a>`).join("")}</div></div></section>

<section class="s"><div class="wrap"><div class="sh"><h2>\u0645\u0634\u06C1\u0648\u0631 \u0634\u0639\u0631\u0627<small>Shayar</small></h2><a class="more" href="/shayar">Sab shayar \u2192</a></div>
<div class="poets">${poets.filter((p) => p.shers).slice(0, 12).map(poetCard).join("")}</div></div></section>

<section class="s alt"><div class="wrap"><div class="sh"><h2>\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06CC \u067E\u0633\u0646\u062F<small>Ramz ki posts \u2014 Instagram se</small></h2><a class="more" href="/ramz">Sab posts \u2192</a></div>
<div class="posts">${posts.slice(0, 6).map(postCard).join("")}</div></div></section>

${daily.length ? `<section class="s daily"><div class="wrap"><div class="sh"><h2>\u0631\u0648\u0632 \u06A9\u0627 \u06A9\u0644\u0627\u0645<small>Roz ka sher \u2014 Ramz ki taraf se</small></h2><a class="more" href="/daily">Sab dekhein \u2192</a></div><div class="grid two">${daily.slice(0, 4).map((p) => kvCard(p, poets)).join("")}</div></div></section>` : ""}

<section class="s"><div class="wrap"><div class="sh"><h2>\u0633\u0627\u062A\u06BE \u0686\u0644\u06CC\u06D2<small>Follow Ramz E Zindagi</small></h2></div>${followHtml()}</div></section>`;
  const ld = { "@context": "https://schema.org", "@type": "WebSite", name: "Ramz E Zindagi", alternateName: "\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC", url: SITE + "/", inLanguage: "ur", potentialAction: { "@type": "SearchAction", target: SITE + "/search?q={search_term_string}", "query-input": "required name=search_term_string" }, sameAs: [IG, "https://www.youtube.com/@ramz.e.zindagi", "https://www.tiktok.com/@ramz.e.zindagi"] };
  return html(layout({ body, canonical: SITE + "/", jsonld: ld, current: "/" }), 200, "public, max-age=300, s-maxage=600");
}
__name(homePage, "homePage");
__name2(homePage, "homePage");
var poetCard = /* @__PURE__ */ __name2((p) => `<a class="poet" href="/shayar/${p.slug}"><span class="yrs">${p.born ? p.born + "\u2013" + p.died : ""}</span><div class="u">${esc(p.ur)}</div><div class="e">${esc(p.en)}</div><div class="n">${p.shers ? p.shers.toLocaleString("en") + " ashaar" : "Ramz ki posts"}</div></a>`, "poetCard");
var postCard = /* @__PURE__ */ __name2((p) => `<a class="post" href="/ramz/${p.slug}"><img src="/posts/${p.img}" alt="${esc(p.ur.join(" / "))}" loading="lazy" width="900" height="1125"><div class="cap"><b>${esc(p.hook)}</b><time>${esc(fmtDate(p.date))}</time></div></a>`, "postCard");
function followHtml() {
  const s = [
    [IG, "Instagram", "@ramz.e.zindagi", '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'],
    ["https://www.youtube.com/@ramz.e.zindagi?sub_confirmation=1", "YouTube", "Lambi ghazlein", '<svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3L10 15z"/></svg>'],
    ["https://www.tiktok.com/@ramz.e.zindagi", "TikTok", "@ramz.e.zindagi", '<svg viewBox="0 0 24 24"><path d="M16 2c.3 2.4 1.8 4 4 4.2V9a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V2h3z"/></svg>'],
    ["https://www.facebook.com/profile.php?id=61596536855182", "Facebook", "Ramz E Zindagi", '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z"/></svg>']
  ];
  return `<div class="follow">${s.map(([h, n, d, i]) => `<a href="${h}" rel="noopener" target="_blank">${i}<div><span>${n}</span><small>${d}</small></div></a>`).join("")}</div>`;
}
__name(followHtml, "followHtml");
__name2(followHtml, "followHtml");
async function poetsPage(env, o) {
  const poets = await poetsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Shayar"]])}<h1>\u0634\u0639\u0631\u0627<span style="display:block;font-family:var(--en);font-weight:300;font-size:1rem;letter-spacing:.14em;color:var(--smoke);direction:ltr;line-height:1.5">Urdu ke mashhoor shayar</span></h1><p class="sub">Har shayar ka kalaam \u2014 ghazlein, nazmein aur chune hue ashaar.</p></div></div>
<section class="s"><div class="wrap"><div class="poets">${poets.map(poetCard).join("")}</div></div></section>`;
  return html(layout({ title: "Shayar \u2014 Ghalib, Mir, Iqbal aur dusre Urdu shayar", desc: "Urdu ke 20+ classical shayar ka kalaam ek jagah: Mirza Ghalib, Mir Taqi Mir, Allama Iqbal, Dagh, Momin, Jigar, Hasrat aur mazeed.", canonical: SITE + "/shayar", body, jsonld: crumbLd([["/", "Home"], [null, "Shayar"]]), current: "/shayar" }));
}
__name(poetsPage, "poetsPage");
__name2(poetsPage, "poetsPage");
async function poetPage(env, o, slug, page) {
  const [p, posts, cats] = await Promise.all([poet(env, o, slug), postsOf(env, o), catsOf(env, o)]);
  if (!p)
    return null;
  const pages = Math.max(1, p.shards);
  if (page < 1 || page > pages)
    return null;
  const shard = p.shards ? await data(env, o, `g/${slug}-${page - 1}.json`) : [];
  const myPosts = posts.filter((x) => x.poet === slug);
  const TYPE = { ghazal: "Ghazal", nazm: "Nazm", intikhab: "Intikhab", qita: "Qita", rubai: "Rubai", qasida: "Qasida", masnavi: "Masnavi" };
  const rows = (shard || []).map((g) => `<a class="row" href="/ghazal/${g.id}${g.slug ? "/" + g.slug : ""}"><div><div class="ur">${esc(g.shers[0][0])}<span>${esc(g.shers[0][1])}</span></div>${g.ro ? `<div class="ro">${esc(g.ro[0][0])}</div>` : ""}</div><div class="t">${TYPE[g.type] || g.type} \xB7 ${g.shers.length} sher</div></a>`).join("");
  const famous = page === 1 && shard ? shard.slice(0, 6).map((g) => sherCard({ id: g.id + "-1", lines: g.shers[0], ro: g.ro ? g.ro[0] : null, poet: p, url: `/sher/${g.id}-1`, tags: g.stags[0], cats })).join("") : "";
  const base = `/shayar/${slug}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], ["/shayar", "Shayar"], [null, p.en]])}<h1>${esc(p.ur)}</h1><h1 class="en" style="font-size:1.4rem;color:var(--ivory)">${esc(p.en)}${p.born ? ` <span style="color:var(--mute);font-size:.9rem">(${p.born}\u2013${p.died})</span>` : ""}</h1><p class="sub">${esc(p.bio)}</p><p class="cnt">${p.ghazals} kalaam \xB7 ${p.shers.toLocaleString("en")} ashaar${myPosts.length ? ` \xB7 ${myPosts.length} Ramz posts` : ""}</p></div></div>
<section class="s"><div class="wrap">
${famous ? `<div class="sh"><h2>\u0686\u0646\u062F \u0627\u0634\u0639\u0627\u0631<small>${esc(p.en)} ke chune hue sher</small></h2></div><div class="grid two" style="margin-bottom:48px">${famous}</div>` : ""}
${myPosts.length ? `<div class="sh"><h2>\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06CC \u067E\u0648\u0633\u0679\u0633<small>${esc(p.en)} \u2014 Ramz ki posts</small></h2></div><div class="posts" style="margin-bottom:48px">${myPosts.map(postCard).join("")}</div>` : ""}
${rows ? `<div class="sh"><h2>\u062A\u0645\u0627\u0645 \u06A9\u0644\u0627\u0645<small>Sab kalaam${pages > 1 ? ` \xB7 safha ${page}/${pages}` : ""}</small></h2></div><div class="rows">${rows}</div>${pager(base, page, pages)}` : ""}
</div></section>`;
  const ld = [crumbLd([["/", "Home"], ["/shayar", "Shayar"], [null, p.en]]), { "@context": "https://schema.org", "@type": "Person", name: p.en, alternateName: p.ur, birthDate: p.born ? String(p.born) : void 0, deathDate: p.died ? String(p.died) : void 0, description: p.bio, url: SITE + base, jobTitle: "Poet" }];
  return html(layout({ title: `${p.en} Shayari \u2014 ${p.ur} ke ${p.shers.toLocaleString("en")} ashaar` + (page > 1 ? ` (safha ${page})` : ""), desc: `${p.en} (${p.ur}) ki ghazlein, nazmein aur mashhoor ashaar Urdu aur Roman Urdu mein. ${p.bio}`, canonical: SITE + base + (page > 1 ? "?page=" + page : ""), body, jsonld: ld, extra: relLinks(base, page, pages), current: "/shayar" }));
}
__name(poetPage, "poetPage");
__name2(poetPage, "poetPage");
async function ghazalPage(env, o, id) {
  const g = await ghazal(env, o, id);
  if (!g)
    return null;
  const [p, cats, poets] = await Promise.all([poet(env, o, id.replace(/-\d+$/, "")), catsOf(env, o), poetsOf(env, o)]);
  const TYPE = { ghazal: "Ghazal", nazm: "Nazm", intikhab: "Intikhab-e-kalaam", qita: "Qita", rubai: "Rubai", qasida: "Qasida", masnavi: "Masnavi" };
  const items = g.shers.map((sh, i) => `<div class="sh-item" id="s${i + 1}" data-sher="${g.id}-${i + 1}" data-poet="${esc(p.en)}" data-url="/sher/${g.id}-${i + 1}"><div class="ur"><a class="lnk" href="/sher/${g.id}-${i + 1}">${sh.map((l) => `<span>${esc(l)}</span>`).join("")}</a></div>${g.ro && g.ro[i] ? `<div class="ro">${g.ro[i].map((l) => `<span>${esc(l)}</span>`).join("")}</div>` : ""}${acts(g.id + "-" + (i + 1))}</div>`).join("");
  const tg = g.tags.map((t) => cats.find((c) => c.slug === t)).filter(Boolean);
  const canonical = `${SITE}/ghazal/${g.id}${g.slug ? "/" + g.slug : ""}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], ["/shayar", "Shayar"], [`/shayar/${p.slug}`, p.en], [null, TYPE[g.type] || g.type]])}<h1>${esc(g.title)}</h1><p class="sub">${TYPE[g.type] || g.type} \xB7 <a href="/shayar/${p.slug}" style="color:var(--moon)">${esc(p.en)} \xB7 <span dir="rtl">${esc(p.ur)}</span></a> \xB7 ${g.shers.length} sher${g.ro ? ` \xB7 Roman Urdu ke saath` : ""}</p>${tg.length ? `<div class="chips" style="margin-top:14px">${tg.map((c) => `<a class="chip" href="/mauzu/${c.slug}"><span class="u">${esc(c.ur)}</span><span class="e">${esc(c.en)}</span></a>`).join("")}</div>` : ""}</div></div>
<section class="s"><div class="wrap"><div class="ghz">${items}</div>
<div class="btns" style="justify-content:center;margin-top:34px"><a class="btn" href="/shayar/${p.slug}">${esc(p.en)} ka aur kalaam</a><a class="btn" href="/random">Koi aur sher</a></div></div></section>`;
  const ld = [crumbLd([["/", "Home"], ["/shayar", "Shayar"], [`/shayar/${p.slug}`, p.en], [null, g.title]]), { "@context": "https://schema.org", "@type": "CreativeWork", "@id": canonical, name: g.title, headline: g.title, author: { "@type": "Person", name: p.en, url: SITE + "/shayar/" + p.slug }, inLanguage: "ur", genre: TYPE[g.type] || g.type, isAccessibleForFree: true, publisher: { "@type": "Organization", name: "Ramz E Zindagi", url: SITE }, text: g.shers.map((s) => s.join(" / ")).join("\n") }];
  const desc = `${p.en} ki ${TYPE[g.type] || g.type}: "${g.shers[0][0]} / ${g.shers[0][1]}" \u2014 poore ${g.shers.length} sher Urdu${g.ro ? " aur Roman Urdu" : ""} mein, Ramz E Zindagi par.`;
  return html(layout({ title: `${g.title} \u2014 ${p.en}`, desc, canonical, body, jsonld: ld, type: "article", current: "/shayar" }));
}
__name(ghazalPage, "ghazalPage");
__name2(ghazalPage, "ghazalPage");
async function sherPage(env, o, sid) {
  const ps = parseSherId(sid);
  if (!ps)
    return null;
  const g = await ghazal(env, o, ps.gid);
  if (!g || !g.shers[ps.i])
    return null;
  const [p, cats, poets] = await Promise.all([poet(env, o, ps.gid.replace(/-\d+$/, "")), catsOf(env, o), poetsOf(env, o)]);
  const sh = g.shers[ps.i], ro = g.ro ? g.ro[ps.i] : null, tags = g.stags[ps.i] || [];
  const url = `/sher/${sid}`;
  const main = sherCard({ id: sid, lines: sh, ro, poet: p, big: true, tags, cats });
  const more = g.shers.map((s, i) => i !== ps.i ? sherCard({ id: `${g.id}-${i + 1}`, lines: s, ro: g.ro ? g.ro[i] : null, poet: p, url: `/sher/${g.id}-${i + 1}` }) : "").filter(Boolean).slice(0, 4).join("");
  let rel = "";
  if (tags[0]) {
    const c = cats.find((x) => x.slug === tags[0]);
    const pg = await data(env, o, `cat/${tags[0]}/${1 + (ps.i * 7 + g.shers.length) % Math.max(1, c.pages)}.json`);
    if (pg)
      rel = pg.filter((it) => it.id !== g.id).slice(0, 4).map((it) => sherCard({ id: `${it.id}-${it.i + 1}`, lines: it.l, ro: it.ro, poet: it.poet, poets, url: `/sher/${it.id}-${it.i + 1}` })).join("");
  }
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], ["/shayar", "Shayar"], [`/shayar/${p.slug}`, p.en], [`/ghazal/${g.id}${g.slug ? "/" + g.slug : ""}`, g.title.slice(0, 40)], [null, "Sher"]])}<h1 style="font-size:1.4rem;color:var(--smoke);font-weight:400">${esc(p.ur)} \u06A9\u0627 \u0634\u0639\u0631</h1></div></div>
<section class="s"><div class="wrap"><div class="ghz">${main}
<div class="btns" style="justify-content:center;margin-top:26px"><a class="btn gold" href="/ghazal/${g.id}${g.slug ? "/" + g.slug : ""}">Poori ${g.type === "ghazal" ? "ghazal" : "nazm"} parhein</a><a class="btn" href="/shayar/${p.slug}">${esc(p.en)} ka kalaam</a><a class="btn" href="/random">Koi aur sher</a></div></div>
${more ? `<div class="sh" style="margin-top:56px"><h2>\u0627\u0633\u06CC \u063A\u0632\u0644 \u0633\u06D2<small>Isi kalaam ke aur sher</small></h2></div><div class="grid two">${more}</div>` : ""}
${rel ? `<div class="sh" style="margin-top:56px"><h2>\u0645\u0644\u062A\u06D2 \u062C\u0644\u062A\u06D2 \u0627\u0634\u0639\u0627\u0631<small>Is mauzu par aur sher</small></h2></div><div class="grid two">${rel}</div>` : ""}
</div></section>`;
  const title = `${sh[0]} \u2014 ${p.en}`;
  const desc = `${sh[0]} / ${sh[1]}${ro ? ` (${ro[0]} / ${ro[1]})` : ""} \u2014 ${p.en} ka sher, Ramz E Zindagi par. Copy karein, WhatsApp par bhejein ya image banayein.`;
  const ld = [crumbLd([["/", "Home"], ["/shayar", "Shayar"], [`/shayar/${p.slug}`, p.en], [null, sh[0]]]), { "@context": "https://schema.org", "@type": "Quotation", "@id": SITE + url, text: sh.join("\n"), creator: { "@type": "Person", name: p.en }, isPartOf: { "@type": "CreativeWork", name: g.title, url: `${SITE}/ghazal/${g.id}` }, inLanguage: "ur", keywords: tags.map((t) => (cats.find((c) => c.slug === t) || {}).en).filter(Boolean).join(", ") }];
  return html(layout({ title, desc, canonical: SITE + url, body, jsonld: ld, type: "article", current: "/shayar" }));
}
__name(sherPage, "sherPage");
__name2(sherPage, "sherPage");
async function catsPage(env, o) {
  const cats = await catsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Mauzu"]])}<h1>\u0645\u0648\u0636\u0648\u0639\u0627\u062A</h1><p class="sub">Jis mood mein ho, usi mauzu ka sher \u2014 ishq, gham, tanhai, umeed, zindagi\u2026</p></div></div>
<section class="s"><div class="wrap"><div class="poets">${cats.map((c) => `<a class="poet" href="/mauzu/${c.slug}"><div class="u">${esc(c.ur)}</div><div class="e">${esc(c.en)}</div><div class="n">${esc(c.desc)} \xB7 ${c.count.toLocaleString("en")} sher</div></a>`).join("")}</div></div></section>`;
  return html(layout({ title: "Mauzu \u2014 Ishq, Gham, Tanhai, Umeed, Zindagi shayari", desc: "Urdu shayari mauzu ke hisaab se: ishq shayari, gham, judai, yaad, tanhai, umeed, zindagi, dosti, wafa, khudi aur mazeed \u2014 22,000+ ashaar.", canonical: SITE + "/mauzu", body, jsonld: crumbLd([["/", "Home"], [null, "Mauzu"]]), current: "/mauzu" }));
}
__name(catsPage, "catsPage");
__name2(catsPage, "catsPage");
async function catPage(env, o, slug, page) {
  const [cats, poets] = await Promise.all([catsOf(env, o), poetsOf(env, o)]);
  const c = cats.find((x) => x.slug === slug);
  if (!c)
    return null;
  if (page < 1 || page > c.pages)
    return null;
  const items = await data(env, o, `cat/${slug}/${page}.json`);
  if (!items)
    return null;
  const base = `/mauzu/${slug}`;
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], ["/mauzu", "Mauzu"], [null, c.en]])}<h1>${esc(c.ur)} \u0634\u0627\u0639\u0631\u06CC</h1><h1 class="en" style="font-size:1.3rem;color:var(--ivory)">${esc(c.en)} shayari</h1><p class="sub">${esc(c.desc)} \u2014 ${c.count.toLocaleString("en")} ashaar${c.pages > 1 ? ` \xB7 safha ${page}/${c.pages}` : ""}</p>
<div class="chips" style="margin-top:16px">${cats.map((x) => `<a class="chip" href="/mauzu/${x.slug}"${x.slug === slug ? ' aria-current="page"' : ""}><span class="u">${esc(x.ur)}</span></a>`).join("")}</div></div></div>
<section class="s"><div class="wrap"><div class="grid two">${items.map((it) => sherCard({ id: `${it.id}-${it.i + 1}`, lines: it.l, ro: it.ro, poet: it.poet, poets, url: `/sher/${it.id}-${it.i + 1}` })).join("")}</div>${pager(base, page, c.pages)}</div></section>`;
  return html(layout({ title: `${c.en} Shayari \u2014 ${c.ur} par ${c.count.toLocaleString("en")} ashaar` + (page > 1 ? ` (safha ${page})` : ""), desc: `${c.en} (${c.ur}) shayari: Ghalib, Mir, Iqbal aur dusre shayar ke ${c.desc.toLowerCase()} par behtareen ashaar, Urdu aur Roman Urdu mein.`, canonical: SITE + base + (page > 1 ? "?page=" + page : ""), body, jsonld: crumbLd([["/", "Home"], ["/mauzu", "Mauzu"], [null, c.en]]), extra: relLinks(base, page, c.pages), current: "/mauzu" }));
}
__name(catPage, "catPage");
__name2(catPage, "catPage");
async function ramzPage(env, o) {
  const posts = await postsOf(env, o);
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Ramz ki posts"]])}<h1>\u0631\u0645\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u06CC \u067E\u0648\u0633\u0679\u0633</h1><p class="sub">Instagram aur Facebook par share ki hui posts \u2014 har sher ke saath hook, Roman Urdu aur shayar ka naam.</p></div></div>
<section class="s"><div class="wrap"><div class="posts">${posts.map(postCard).join("")}</div><div class="btns" style="justify-content:center;margin-top:34px"><a class="btn gold" href="${IG}" rel="noopener" target="_blank">Instagram par follow karein</a></div></div></section>`;
  return html(layout({ title: "Ramz E Zindagi ki posts \u2014 Urdu poetry images", desc: "Ramz E Zindagi ki Instagram aur Facebook posts: Ghalib, Mir, Momin aur dusre shayar ke ashaar khoobsurat images mein, hook aur Roman Urdu ke saath.", canonical: SITE + "/ramz", body, jsonld: crumbLd([["/", "Home"], [null, "Ramz ki posts"]]), current: "/ramz" }));
}
__name(ramzPage, "ramzPage");
__name2(ramzPage, "ramzPage");
async function postPage(env, o, slug) {
  const [posts, poets, cats] = await Promise.all([postsOf(env, o), poetsOf(env, o), catsOf(env, o)]);
  const p = posts.find((x) => x.slug === slug);
  if (!p)
    return null;
  const po = poets.find((x) => x.slug === p.poet) || { ur: p.poet, en: p.poet, slug: "" };
  const i = posts.indexOf(p);
  const prev = posts[i + 1], next = posts[i - 1];
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], ["/ramz", "Ramz ki posts"], [null, p.hook]])}<h1 class="en" style="font-size:1.5rem">${esc(p.hook)}</h1><p class="cnt">${esc(fmtDate(p.date))} \xB7 Instagram post</p></div></div>
<section class="s"><div class="wrap post-big"><img src="/posts/${p.img}" alt="${esc(p.ur.join(" / "))}" width="900" height="1125"><div>${sherCard({ id: "post-" + p.date, lines: p.ur, ro: p.ro, poet: po, big: true, tags: p.tags, cats })}
<div class="btns" style="justify-content:center;margin-top:22px">${po.slug ? `<a class="btn" href="/shayar/${po.slug}">${esc(po.en)} ka aur kalaam</a>` : ""}<a class="btn" href="${IG}" rel="noopener" target="_blank">Instagram par dekhein</a></div>
<div class="btns" style="justify-content:space-between;margin-top:30px">${prev ? `<a class="btn" href="/ramz/${prev.slug}">\u2039 Pichhli post</a>` : "<span></span>"}${next ? `<a class="btn" href="/ramz/${next.slug}">Agli post \u203A</a>` : ""}</div></div></div></section>`;
  const ld = [crumbLd([["/", "Home"], ["/ramz", "Ramz ki posts"], [null, p.hook]]), { "@context": "https://schema.org", "@type": "ImageObject", contentUrl: `${SITE}/posts/${p.img}`, name: p.hook, caption: p.ur.join(" / ") + " \u2014 " + po.en, datePublished: p.date, creator: { "@type": "Organization", name: "Ramz E Zindagi" } }];
  return html(layout({ title: `${p.hook} \u2014 ${po.en}`, desc: `${p.ur.join(" / ")} (${p.ro.join(" / ")}) \u2014 ${po.en}. Ramz E Zindagi ki ${fmtDate(p.date)} ki post.`, canonical: `${SITE}/ramz/${slug}`, og: `${SITE}/posts/${p.img}`, body, jsonld: ld, type: "article", current: "/ramz" }));
}
__name(postPage, "postPage");
__name2(postPage, "postPage");
async function dailyPage(env, o) {
  const [kv, poets] = await Promise.all([loadKV(env), poetsOf(env, o)]);
  const list = published(kv);
  const body = `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Roz ka sher"]])}<h1>\u0631\u0648\u0632 \u06A9\u0627 \u06A9\u0644\u0627\u0645</h1><p class="sub">Har din ek naya sher \u2014 Ramz E Zindagi ki taraf se. Pehle yahan, phir Instagram par.</p></div></div>
<section class="s daily"><div class="wrap">${list.length ? `<div class="grid two">${list.map((p, i) => kvCard(p, poets, i === 0).replace("<article", `<article id="${esc(p.id)}"`)).join("")}</div>` : '<div class="empty"><p class="u">\u0622\u062C \u06A9\u0627 \u0634\u0639\u0631 \u062C\u0644\u062F \u0622\u0626\u06D2 \u06AF\u0627</p></div>'}</div></section>`;
  return html(layout({ title: "Roz ka sher \u2014 har din naya Urdu sher", desc: "Ramz E Zindagi ka roz ka sher: har din ek naya Urdu sher, Instagram se pehle yahan.", canonical: SITE + "/daily", body, jsonld: crumbLd([["/", "Home"], [null, "Roz ka sher"]]), current: "/daily" }), 200, "public, max-age=120");
}
__name(dailyPage, "dailyPage");
__name2(dailyPage, "dailyPage");
var searchPage = /* @__PURE__ */ __name2((q) => html(layout({ title: q ? `"${q}" ki talaash` : "Sher talaash karein", desc: "Urdu ya Roman Urdu mein lafz likhein \u2014 22,000+ ashaar mein talaash.", canonical: SITE + "/search", noindex: true, body: `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Search"]])}<h1>\u062A\u0644\u0627\u0634</h1><form class="sbox" id="sform" role="search" style="margin-top:14px"><input id="sq" name="q" value="${esc(q)}" placeholder="Lafz likhein \u2014 Urdu ya Roman: \u062F\u0644, tanhai, yaad\u2026" aria-label="Search" autofocus autocomplete="off"><button type="submit">Talaash</button></form><p class="cnt">Tip: ek ya do lafz behtar kaam karte hain.</p></div></div><section class="s"><div class="wrap sres" id="sres">${q ? "" : '<div class="empty"><p class="u">\u06A9\u06CC\u0627 \u0688\u06BE\u0648\u0646\u0688 \u0631\u06C1\u06D2 \u06C1\u06CC\u06BA\u061F</p><p>Koi bhi lafz likhein \u2014 jaise "dil", "yaad", "\u062A\u0646\u06C1\u0627\u0626\u06CC".</p></div>'}</div></section>`, current: "/search" }), 200, "no-store"), "searchPage");
var pasandPage = /* @__PURE__ */ __name2(() => html(layout({ title: "Meri pasand", desc: "Aap ke pasand kiye hue ashaar.", canonical: SITE + "/pasand", noindex: true, body: `<div class="ph"><div class="wrap">${crumbs([["/", "Home"], [null, "Meri pasand"]])}<h1>\u0645\u06CC\u0631\u06CC \u067E\u0633\u0646\u062F</h1><p class="sub">Jo sher aap ne dil (\u2665) se save kiye \u2014 sirf is device par mehfooz rehte hain.</p></div></div><section class="s"><div class="wrap" id="pasandList"><div class="skel" style="width:60%"></div></div></section>`, current: "/pasand" }), 200, "no-store"), "pasandPage");
var normQ = /* @__PURE__ */ __name2((s) => s.normalize("NFC").toLowerCase().replace(/[ً-ْٰـؔؒؓؑ]/g, "").replace(/ي/g, "\u06CC").replace(/ك/g, "\u06A9").replace(/[āáà]/g, "a").replace(/[īí]/g, "i").replace(/[ūú]/g, "u").replace(/ñ/g, "n"), "normQ");
function crc32(str) {
  const b = enc.encode(str);
  let c = -1;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++)
      c = c >>> 1 ^ 3988292384 & -(c & 1);
  }
  return (c ^ -1) >>> 0;
}
__name(crc32, "crc32");
__name2(crc32, "crc32");
async function searchApi(env, o, q) {
  const words = normQ(q).split(/[^؀-ۿa-z]+/).filter((w) => w.length >= 2).slice(0, 4);
  if (!words.length)
    return json({ items: [], total: 0 });
  const lists = await Promise.all(words.map(async (w) => {
    const b = await data(env, o, `idx/${crc32(w) % 64}.json`);
    if (!b)
      return [];
    if (b[w])
      return b[w];
    const out = [];
    for (const k in b)
      if (k.startsWith(w)) {
        out.push(...b[k]);
        if (out.length > 3e3)
          break;
      }
    return out;
  }));
  let hits = lists[0];
  for (const l of lists.slice(1)) {
    const s = new Set(l);
    hits = hits.filter((h) => s.has(h));
  }
  const total = hits.length;
  const [poets] = await Promise.all([poetsOf(env, o)]);
  const items = [];
  const seenShard = /* @__PURE__ */ new Map();
  for (const h of hits.slice(0, 24)) {
    const [gid, i] = h.split(":");
    const m = /^([a-z-]+?)-(\d+)$/.exec(gid);
    const sp = `g/${m[1]}-${Math.floor((+m[2] - 1) / PAGE_GHAZALS)}.json`;
    if (!seenShard.has(sp)) {
      if (seenShard.size >= 8)
        continue;
      seenShard.set(sp, await data(env, o, sp));
    }
    const g = (seenShard.get(sp) || []).find((x) => x.id === gid);
    if (!g)
      continue;
    items.push({ id: `${gid}-${+i + 1}`, html: sherCard({ id: `${gid}-${+i + 1}`, lines: g.shers[+i], ro: g.ro ? g.ro[+i] : null, poet: m[1], poets, url: `/sher/${gid}-${+i + 1}` }) });
  }
  return json({ total, items }, 200, { "cache-control": "public, max-age=3600" });
}
__name(searchApi, "searchApi");
__name2(searchApi, "searchApi");
async function shersApi(env, o, ids) {
  const poets = await poetsOf(env, o), posts = await postsOf(env, o), kv = await loadKV(env);
  const items = [];
  for (const sid of ids.slice(0, 60)) {
    if (sid.startsWith("post-")) {
      const p = posts.find((x) => "post-" + x.date === sid);
      if (p)
        items.push({ id: sid, html: sherCard({ id: sid, lines: p.ur, ro: p.ro, poet: p.poet, poets, url: "/ramz/" + p.slug }) });
      continue;
    }
    if (sid.startsWith("kv-")) {
      const p = kv.find((x) => "kv-" + x.id === sid);
      if (p)
        items.push({ id: sid, html: kvCard(p, poets) });
      continue;
    }
    const ps = parseSherId(sid);
    if (!ps)
      continue;
    const g = await ghazal(env, o, ps.gid);
    if (!g || !g.shers[ps.i])
      continue;
    items.push({ id: sid, html: sherCard({ id: sid, lines: g.shers[ps.i], ro: g.ro ? g.ro[ps.i] : null, poet: ps.gid.replace(/-\d+$/, ""), poets, url: "/sher/" + sid }) });
  }
  return json({ items }, 200, { "cache-control": "public, max-age=600" });
}
__name(shersApi, "shersApi");
__name2(shersApi, "shersApi");
async function sitemapIndex(env, o) {
  const sm = await data(env, o, "sitemap.json");
  const urls = ["pages", ...Object.keys(sm)].map((k) => `<sitemap><loc>${SITE}/sitemap-${k}.xml</loc></sitemap>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</sitemapindex>`, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=86400" } });
}
__name(sitemapIndex, "sitemapIndex");
__name2(sitemapIndex, "sitemapIndex");
async function sitemapFor(env, o, key) {
  const u = /* @__PURE__ */ __name2((loc, pr = "0.5", cf = "monthly") => `<url><loc>${SITE}${loc}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`, "u");
  let out = "";
  if (key === "pages") {
    const [poets, cats, posts] = await Promise.all([poetsOf(env, o), catsOf(env, o), postsOf(env, o)]);
    out += u("/", "1.0", "daily") + u("/shayar", "0.8", "weekly") + u("/mauzu", "0.8", "weekly") + u("/daily", "0.7", "daily") + u("/ramz", "0.7", "weekly");
    for (const p of poets) {
      out += u("/shayar/" + p.slug, "0.8");
      for (let n = 2; n <= p.shards; n++)
        out += u(`/shayar/${p.slug}?page=${n}`, "0.4");
    }
    for (const c of cats) {
      out += u("/mauzu/" + c.slug, "0.8", "weekly");
      for (let n = 2; n <= c.pages; n++)
        out += u(`/mauzu/${c.slug}?page=${n}`, "0.4");
    }
    for (const p of posts)
      out += u("/ramz/" + p.slug, "0.6");
  } else {
    const sm = await data(env, o, "sitemap.json");
    if (!sm || !sm[key])
      return null;
    for (const id of sm[key]) {
      const n = +id.split("-").pop();
      const sh = Math.floor((n - 1) / PAGE_GHAZALS);
      out += u("/ghazal/" + id, "0.6");
    }
    const p = (await poetsOf(env, o)).find((x) => x.slug === key);
    for (let s = 0; s < (p ? p.shards : 0); s++) {
      const shard = await data(env, o, `g/${key}-${s}.json`);
      for (const g of shard || [])
        for (let i = 1; i <= g.shers.length; i++)
          out += u(`/sher/${g.id}-${i}`, "0.4");
    }
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${out}</urlset>`, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=86400" } });
}
__name(sitemapFor, "sitemapFor");
__name2(sitemapFor, "sitemapFor");
async function feed(env) {
  const list = published(await loadKV(env)).slice(0, 30);
  const items = list.map((p) => `<item><title>${esc(p.text.split("\n")[0])}</title><link>${SITE}/daily#${esc(p.id)}</link><guid>${SITE}/daily#${esc(p.id)}</guid><pubDate>${(/* @__PURE__ */ new Date(p.date + "T04:00:00Z")).toUTCString()}</pubDate><description>${esc(p.text + (p.poet ? "\n\u2014 " + p.poet : ""))}</description></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ramz E Zindagi \u2014 Roz ka sher</title><link>${SITE}/daily</link><description>Har din ek naya Urdu sher</description><language>ur</language>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
__name(feed, "feed");
__name2(feed, "feed");
async function randomSher(env, o) {
  const poets = (await poetsOf(env, o)).filter((p2) => p2.shers);
  const w = poets.reduce((s, p2) => s + p2.ghazals, 0);
  let r = Math.random() * w, p = poets[0];
  for (const x of poets) {
    r -= x.ghazals;
    if (r <= 0) {
      p = x;
      break;
    }
  }
  const n = 1 + Math.floor(Math.random() * p.ghazals);
  const g = await ghazal(env, o, `${p.slug}-${n}`);
  const i = g ? 1 + Math.floor(Math.random() * g.shers.length) : 1;
  return new Response(null, { status: 302, headers: { Location: `/sher/${p.slug}-${n}-${i}`, "cache-control": "no-store" } });
}
__name(randomSher, "randomSher");
__name2(randomSher, "randomSher");
var notFound = /* @__PURE__ */ __name2(() => html(layout({ title: "Nahi mila", noindex: true, body: `<section class="s"><div class="wrap empty"><p class="u">\u06CC\u06C1 \u0635\u0641\u062D\u06C1 \u0646\u06C1\u06CC\u06BA \u0645\u0644\u0627</p><p>Shayad link ghalat hai. <a href="/" style="color:var(--moon)">Home par jayein</a> ya <a href="/random" style="color:var(--moon)">koi sher parhein</a>.</p></div></section>` }), 404, "no-store"), "notFound");
async function api(req, env, path, url) {
  const method = req.method;
  const o = url.origin;
  if (path === "/api/search")
    return searchApi(env, o, (url.searchParams.get("q") || "").slice(0, 80));
  if (path === "/api/shers")
    return shersApi(env, o, (url.searchParams.get("ids") || "").split(",").filter(Boolean));
  if (path === "/api/poems" && method === "GET")
    return json({ poems: published(await loadKV(env)).slice(0, 60).map(publicPoem) }, 200, { "cache-control": "public, max-age=60" });
  if (path === "/api/admin/status")
    return json({ ready: !!(env.RAMZ_KV && env.ADMIN_PASSWORD), kv: !!env.RAMZ_KV, password: !!env.ADMIN_PASSWORD, admin: await isAdmin(req, env), today: today() });
  if (path === "/api/admin/login" && method === "POST") {
    if (!env.ADMIN_PASSWORD)
      return json({ error: "The admin password is not set yet in Cloudflare." }, 503);
    const body = await req.json().catch(() => ({}));
    if (!safeEqual(String(body.password || ""), env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 800));
      return json({ error: "Wrong password." }, 401);
    }
    return json({ ok: true }, 200, { "set-cookie": cookie(await makeToken(env), SESSION_DAYS * 86400) });
  }
  if (path === "/api/admin/logout")
    return json({ ok: true }, 200, { "set-cookie": cookie("", 0) });
  if (!path.startsWith("/api/admin/"))
    return json({ error: "Not found" }, 404);
  if (!env.RAMZ_KV)
    return json({ error: "Storage (RAMZ_KV) is not connected yet." }, 503);
  if (!await isAdmin(req, env))
    return json({ error: "Please log in." }, 401);
  const list = await loadKV(env);
  if (path === "/api/admin/poems" && method === "GET")
    return json({ poems: list, today: today() });
  if (path === "/api/admin/poem" && method === "POST") {
    const b = await req.json().catch(() => ({}));
    const id = clean(b.id, 40);
    let p = id ? list.find((x) => x.id === id) : null;
    if (id && !p)
      return json({ error: "Poem not found." }, 404);
    const text = clean(b.text, 3e3);
    if (!text)
      return json({ error: "Please write the poetry." }, 400);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || "") ? b.date : today();
    if (!p) {
      p = { id: uid(), created: (/* @__PURE__ */ new Date()).toISOString() };
      list.push(p);
    }
    Object.assign(p, { text, poet: clean(b.poet, 80), note: clean(b.note, 300), date, show: b.show !== false, updated: (/* @__PURE__ */ new Date()).toISOString() });
    await saveKV(env, list);
    return json({ ok: true, poem: p });
  }
  if (path === "/api/admin/action" && method === "POST") {
    const b = await req.json().catch(() => ({}));
    const i = list.findIndex((x) => x.id === b.id);
    if (i < 0)
      return json({ error: "Not found." }, 404);
    if (b.op === "delete")
      list.splice(i, 1);
    else if (b.op === "toggle")
      list[i].show = !list[i].show;
    else
      return json({ error: "Bad action." }, 400);
    await saveKV(env, list);
    return json({ ok: true });
  }
  return json({ error: "Not found" }, 404);
}
__name(api, "api");
__name2(api, "api");
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const o = url.origin;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    try {
      if (path.startsWith("/api/"))
        return await api(req, env, path, url);
      if (path === "/admin") {
        if (url.searchParams.has("sso")) {
          const ok = await ssoOk(url, env);
          return new Response(null, { status: 302, headers: { Location: "/admin", "Cache-Control": "no-store", ...ok ? { "Set-Cookie": cookie(await makeToken(env), SESSION_DAYS * 86400) } : {} } });
        }
        const r2 = await env.ASSETS.fetch(new Request(new URL("/admin", url), req));
        const h = new Headers(r2.headers);
        h.set("x-robots-tag", "noindex, nofollow");
        h.set("cache-control", "no-store");
        return new Response(r2.body, { status: r2.status, headers: h });
      }
      if (req.method !== "GET" && req.method !== "HEAD")
        return json({ error: "Method not allowed" }, 405);
      if (url.hostname === "www.ramzezindagi.com")
        return Response.redirect(SITE + url.pathname + url.search, 301);
      let m;
      if (path === "/" || path === "/index.html")
        return await homePage(env, o);
      if (path === "/shayar")
        return await poetsPage(env, o);
      if (m = /^\/shayar\/([a-z-]+)$/.exec(path))
        return await poetPage(env, o, m[1], page) || notFound();
      if (m = /^\/ghazal\/([a-z-]+-\d+)(?:\/[^/]*)?$/.exec(path))
        return await ghazalPage(env, o, m[1]) || notFound();
      if (m = /^\/sher\/([a-z-]+-\d+-\d+)$/.exec(path))
        return await sherPage(env, o, m[1]) || notFound();
      if (path === "/mauzu")
        return await catsPage(env, o);
      if (m = /^\/mauzu\/([a-z]+)$/.exec(path))
        return await catPage(env, o, m[1], page) || notFound();
      if (path === "/ramz")
        return await ramzPage(env, o);
      if (m = /^\/ramz\/([a-z0-9-]+)$/.exec(path))
        return await postPage(env, o, m[1]) || notFound();
      if (path === "/daily")
        return await dailyPage(env, o);
      if (path === "/search")
        return searchPage((url.searchParams.get("q") || "").slice(0, 80));
      if (path === "/pasand")
        return pasandPage();
      if (path === "/random")
        return await randomSher(env, o);
      if (path === "/feed.xml")
        return await feed(env);
      if (path === "/sitemap.xml")
        return await sitemapIndex(env, o);
      if (m = /^\/sitemap-([a-z-]+)\.xml$/.exec(path))
        return await sitemapFor(env, o, m[1]) || notFound();
      if (path === "/robots.txt")
        return new Response(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /search
Disallow: /pasand
Sitemap: ${SITE}/sitemap.xml
`, { headers: { "content-type": "text/plain", "cache-control": "public, max-age=86400" } });
      const r = await env.ASSETS.fetch(req);
      if (r.status === 404)
        return notFound();
      return r;
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500);
    }
  }
};
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../tmp/wtest/node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-NlxGsX/a4l76pobrr7.js
var define_ROUTES_default = { version: 1, include: ["/*"], exclude: ["/assets/*", "/posts/*", "/data/*", "/admin.html", "/CNAME"] };
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = middleware_loader_entry_default;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// ../../../tmp/wtest/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../tmp/wtest/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-BnwKt3/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = pages_dev_pipeline_default;

// ../../../tmp/wtest/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-BnwKt3/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=a4l76pobrr7.js.map
