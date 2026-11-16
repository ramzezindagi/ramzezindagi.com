// Ramz E Zindagi: daily poetry backend (Cloudflare Pages advanced mode).
// Bindings on the Pages project:
//   RAMZ_KV         Workers KV namespace (stores the poems)
//   ADMIN_PASSWORD  secret used to log in at /admin
// The home page gets the latest poems written into its HTML (good for Google),
// and /api/poems serves the same list as JSON.

const COOKIE = 'ramz_admin';
const SESSION_DAYS = 14;
const HOME_COUNT = 7; // poems shown on the home page

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

const enc = new TextEncoder();
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function makeToken(env) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return `${exp}.${await hmac(env.ADMIN_PASSWORD, 'ramz|' + exp)}`;
}
async function isAdmin(req, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, 'ramz|' + exp));
}
const cookie = (v, maxAge) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clean = (v, max = 600) => String(v == null ? '' : v).trim().slice(0, max);
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10); // Pakistan date

async function load(env) {
  const d = await env.RAMZ_KV.get('poems', 'json');
  return Array.isArray(d) ? d : [];
}
const save = (env, d) => env.RAMZ_KV.put('poems', JSON.stringify(d));

// newest first; poems dated in the future stay hidden until their day
const published = (list) =>
  list.filter((p) => p.show && p.date <= today()).sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
const publicPoem = ({ id, text, poet, date, note }) => ({ id, text, poet, date, note });

function fmtDate(iso) {
  const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, mo, d] = iso.split('-').map(Number);
  return `${d} ${m[mo - 1]} ${y}`;
}
function poemHtml(p, featured) {
  const lines = p.text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return `<article class="daily-poem${featured ? ' featured' : ''}">
  <time datetime="${esc(p.date)}">${featured ? (p.date === today() ? 'Aaj ka sher · ' : 'Naya sher · ') : ''}${esc(fmtDate(p.date))}</time>
  <blockquote>${lines.map((l) => `<span>${esc(l)}</span>`).join('')}</blockquote>
  ${p.poet ? `<cite>${esc(p.poet)}</cite>` : ''}
  ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
</article>`;
}

async function api(req, env, path) {
  const method = req.method;

  if (path === '/api/poems' && method === 'GET') {
    if (!env.RAMZ_KV) return json({ poems: [] });
    return json({ poems: published(await load(env)).slice(0, 60).map(publicPoem) }, 200, { 'cache-control': 'public, max-age=60' });
  }

  if (path === '/api/admin/status') {
    return json({ ready: !!(env.RAMZ_KV && env.ADMIN_PASSWORD), kv: !!env.RAMZ_KV, password: !!env.ADMIN_PASSWORD, admin: await isAdmin(req, env), today: today() });
  }

  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: 'The admin password is not set yet in Cloudflare.' }, 503);
    const body = await req.json().catch(() => ({}));
    if (!safeEqual(String(body.password || ''), env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 800));
      return json({ error: 'Wrong password.' }, 401);
    }
    return json({ ok: true }, 200, { 'set-cookie': cookie(await makeToken(env), SESSION_DAYS * 86400) });
  }

  if (path === '/api/admin/logout') return json({ ok: true }, 200, { 'set-cookie': cookie('', 0) });

  if (!path.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404);
  if (!env.RAMZ_KV) return json({ error: 'Storage (RAMZ_KV) is not connected yet.' }, 503);
  if (!(await isAdmin(req, env))) return json({ error: 'Please log in.' }, 401);

  const list = await load(env);

  if (path === '/api/admin/poems' && method === 'GET') return json({ poems: list, today: today() });

  if (path === '/api/admin/poem' && method === 'POST') {
    const b = await req.json().catch(() => ({}));
    const id = clean(b.id, 40);
    let p = id ? list.find((x) => x.id === id) : null;
    if (id && !p) return json({ error: 'Poem not found.' }, 404);
    const text = clean(b.text, 3000);
    if (!text) return json({ error: 'Please write the poetry.' }, 400);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : today();
    if (!p) { p = { id: uid(), created: new Date().toISOString() }; list.push(p); }
    Object.assign(p, { text, poet: clean(b.poet, 80), note: clean(b.note, 300), date, show: b.show !== false, updated: new Date().toISOString() });
    await save(env, list);
    return json({ ok: true, poem: p });
  }

  if (path === '/api/admin/action' && method === 'POST') {
    const b = await req.json().catch(() => ({}));
    const i = list.findIndex((x) => x.id === b.id);
    if (i < 0) return json({ error: 'Not found.' }, 404);
    if (b.op === 'delete') list.splice(i, 1);
    else if (b.op === 'toggle') list[i].show = !list[i].show;
    else return json({ error: 'Bad action.' }, 400);
    await save(env, list);
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}

// write the latest poems into the home page HTML
async function home(req, env) {
  const res = await env.ASSETS.fetch(req);
  if (!env.RAMZ_KV || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const poems = published(await load(env)).slice(0, HOME_COUNT);
  if (!poems.length) return res;
  const html = poems.map((p, i) => poemHtml(p, i === 0)).join('\n');
  const out = new HTMLRewriter()
    .on('#daily', { element(el) { el.removeAttribute('hidden'); } })
    .on('#dailyList', { element(el) { el.setInnerContent(html, { html: true }); } })
    .transform(res);
  const h = new Headers(out.headers);
  h.set('cache-control', 'public, max-age=60');
  return new Response(out.body, { status: out.status, headers: h });
}

// Single sign-on from the main admin (bot.navifexpro.com/admin). Works when both
// projects use the same ADMIN_PASSWORD. The link is valid for 60 seconds.
async function ssoOk(url, env) {
  const t = url.searchParams.get('sso');
  if (!t || !env.ADMIN_PASSWORD) return false;
  const [exp, sig] = t.split('.');
  const now = Date.now();
  if (!exp || !sig || +exp < now || +exp > now + 120e3) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, 'sso|ramz|' + exp));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      if (path.startsWith('/api/')) return await api(req, env, path);
      if (path === '/admin' || path === '/admin/') {
        if (url.searchParams.has('sso')) {
          const ok = await ssoOk(url, env);
          return new Response(null, { status: 302, headers: { Location: '/admin', 'Cache-Control': 'no-store', ...(ok ? { 'Set-Cookie': cookie(await makeToken(env), SESSION_DAYS * 86400) } : {}) } });
        }
        const r = await env.ASSETS.fetch(new Request(new URL('/admin', url), req));
        const h = new Headers(r.headers);
        h.set('x-robots-tag', 'noindex, nofollow');
        h.set('cache-control', 'no-store');
        return new Response(r.body, { status: r.status, headers: h });
      }
      if ((path === '/' || path === '/index.html') && req.method === 'GET') return await home(req, env);
      return env.ASSETS.fetch(req);
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
