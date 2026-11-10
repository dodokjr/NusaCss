#!/usr/bin/env node
/* Ringan CSS — generator CSS utility-first (tanpa dependensi).
 *
 *   node build.js                        → dist/ringan.css + dist/ringan.min.css (lengkap)
 *   node build.js --content "demo.html"  → hanya class yang dipakai (purge, sangat kecil)
 *   opsi: --out <folder>  --name <nama-file>
 */
const fs = require('fs'), path = require('path');
const A = process.argv.slice(2), opt = k => { const i = A.indexOf(k); return i > -1 ? A[i + 1] : null; };
const content = opt('--content');
const outDir = opt('--out') || path.join(__dirname, 'dist');
const name = opt('--name') || (content ? 'ringan.purged' : 'ringan');

/* ---------- Purge: kumpulkan token dari file sumber ---------- */
let tokens = null;
if (content) {
  tokens = new Set();
  const ext = /\.(html?|jsx?|tsx?|vue|svelte|php|md)$/;
  const walk = p => {
    if (!fs.existsSync(p)) return;
    if (fs.statSync(p).isDirectory()) {
      if (/node_modules|dist/.test(p)) return;
      fs.readdirSync(p).forEach(f => walk(path.join(p, f)));
    } else if (ext.test(p)) {
      fs.readFileSync(p, 'utf8').split(/[\s"'`<>=(){},;]+/).forEach(t => t && tokens.add(t));
    }
  };
  content.split(',').forEach(p => walk(p.trim()));
}
const keep = n => !tokens || tokens.has(n);
const esc = s => s.replace(/[^\w-]/g, '\\$&');

/* ---------- Token desain ---------- */
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const PAL = {
  gray:    'f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8 64748b 475569 334155 1e293b 0f172a',
  primary: 'eef2ff e0e7ff c7d2fe a5b4fc 818cf8 6366f1 4f46e5 4338ca 3730a3 312e81',
  green:   'f0fdf4 dcfce7 bbf7d0 86efac 4ade80 22c55e 16a34a 15803d 166534 14532d',
  red:     'fef2f2 fee2e2 fecaca fca5a5 f87171 ef4444 dc2626 b91c1c 991b1b 7f1d1d',
  amber:   'fffbeb fef3c7 fde68a fcd34d fbbf24 f59e0b d97706 b45309 92400e 78350f',
  sky:     'f0f9ff e0f2fe bae6fd 7dd3fc 38bdf8 0ea5e9 0284c7 0369a1 075985 0c4a6e',
};
const BP = { sm: 640, md: 768, lg: 1024, xl: 1280 };

let vars = '';
for (const f in PAL) PAL[f].split(' ').forEach((h, i) => vars += `--${f}-${SHADES[i]}:#${h};`);

const tokensCSS = `:root{${vars}
--radius:.5rem;--sc:15 23 42;
--font-sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
--font-serif:ui-serif,Georgia,Cambria,"Times New Roman",serif;
--font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
--canvas:var(--gray-50);--surface:#fff;--subtle-bg:var(--gray-100);
--fg:var(--gray-900);--muted:var(--gray-600);--subtle:var(--gray-400);
--line:var(--gray-200);--line-strong:var(--gray-300);
--accent:var(--primary-600);--accent-hover:var(--primary-700);--accent-fg:#fff;
--t-primary:var(--primary-600);--t-green:var(--green-700);--t-red:var(--red-600);--t-amber:var(--amber-700);--t-sky:var(--sky-700);
--sh-sm:0 1px 2px 0 rgb(var(--sc)/.06);
--sh:0 1px 3px 0 rgb(var(--sc)/.1),0 1px 2px -1px rgb(var(--sc)/.1);
--sh-md:0 4px 6px -1px rgb(var(--sc)/.1),0 2px 4px -2px rgb(var(--sc)/.1);
--sh-lg:0 10px 15px -3px rgb(var(--sc)/.1),0 4px 6px -4px rgb(var(--sc)/.1);
--sh-xl:0 20px 25px -5px rgb(var(--sc)/.1),0 8px 10px -6px rgb(var(--sc)/.1);
--sh-2xl:0 25px 50px -12px rgb(var(--sc)/.25);
--ease:cubic-bezier(.4,0,.2,1);}
:root[data-style=simple]{--radius:.25rem;--accent:var(--gray-900);--accent-hover:var(--gray-700);--accent-fg:#fff;--canvas:#fff;--subtle-bg:var(--gray-50);--sh-sm:none;--sh:none;--sh-md:0 1px 2px rgb(var(--sc)/.08);--sh-lg:0 2px 8px rgb(var(--sc)/.1);--t-primary:var(--gray-700)}
:root[data-style=modern]{--radius:.75rem;--canvas:#f8fafc;--sh-sm:0 1px 3px 0 rgb(var(--sc)/.08)}
:root[data-style=classic]{--radius:.125rem;--font-sans:var(--font-serif);--canvas:#f9f7f2;--surface:#fffefb;--subtle-bg:#f1eee6;--fg:#1f1b16;--muted:#5a5247;--subtle:#8a8271;--line:#e4dfd2;--line-strong:#d2cbb8;--accent:#1e3a5f;--accent-hover:#16304f;--accent-fg:#fff;--t-primary:#1e3a5f}
:root.dark,:root[data-theme=dark]{color-scheme:dark;--sc:0 0 0;
--canvas:#0b1120;--surface:var(--gray-900);--subtle-bg:var(--gray-800);
--fg:var(--gray-100);--muted:var(--gray-400);--subtle:var(--gray-500);
--line:var(--gray-800);--line-strong:var(--gray-700);
--accent:var(--primary-400);--accent-hover:var(--primary-300);--accent-fg:var(--gray-900);
--t-primary:var(--primary-400);--t-green:var(--green-400);--t-red:var(--red-400);--t-amber:var(--amber-400);--t-sky:var(--sky-400);}
:root.dark[data-style=simple],:root[data-theme=dark][data-style=simple]{--canvas:#0a0a0a;--surface:#111;--subtle-bg:#1a1a1a;--line:#262626;--line-strong:#333;--accent:#fff;--accent-hover:var(--gray-200);--accent-fg:#0a0a0a;--t-primary:var(--gray-300)}
:root.dark[data-style=classic],:root[data-theme=dark][data-style=classic]{--canvas:#17140f;--surface:#201c15;--subtle-bg:#2a251c;--fg:#ece6d8;--muted:#b3a995;--subtle:#8a8271;--line:#332d22;--line-strong:#463e30;--accent:#9db9e0;--accent-hover:#bcd0ec;--accent-fg:#17140f;--t-primary:#9db9e0}
:root.dark[data-style=modern],:root[data-theme=dark][data-style=modern]{--canvas:#0b1120}`;

/* ---------- Reset ringan ---------- */
const reset = `*,::before,::after{box-sizing:border-box;border:0 solid var(--line)}
html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:var(--font-sans);-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--canvas);color:var(--fg)}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
a{color:inherit;text-decoration:inherit}
b,strong{font-weight:600}
code,pre,kbd{font-family:var(--font-mono);font-size:1em}
small{font-size:80%}
blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}
ol,ul,menu{list-style:none;margin:0;padding:0}
table{border-collapse:collapse;border-color:inherit}
button,input,select,textarea{font:inherit;color:inherit;letter-spacing:inherit;margin:0;padding:0;background:transparent}
button,[role=button]{cursor:pointer}
textarea{resize:vertical}
::placeholder{color:var(--subtle);opacity:1}
img,svg,video,canvas,audio,iframe{display:block;vertical-align:middle}
img,video{max-width:100%;height:auto}
[hidden]{display:none!important}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
::selection{background:color-mix(in srgb,var(--accent) 25%,transparent)}
@keyframes r-spin{to{transform:rotate(360deg)}}
@keyframes r-pulse{50%{opacity:.5}}
@keyframes r-fade{from{opacity:0}to{opacity:1}}
@keyframes r-up{from{opacity:0;transform:translateY(.75rem)}to{opacity:1;transform:none}}
@keyframes r-shimmer{to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){*,::before,::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`;

/* ---------- Komponen (opsional, gaya Bootstrap, bisa ditimpa utility) ---------- */
const tone = (n, c) => `.badge-${n}{--tone:var(--t-${c})}.alert-${n}{--tone:var(--t-${c})}`;
const components = `
.container{width:100%;margin-inline:auto;padding-inline:1rem}
@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}
@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1200px}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.5rem 1rem;font:500 .875rem/1.25rem var(--font-sans);color:var(--fg);background:var(--surface);border:1px solid var(--line-strong);border-radius:var(--radius);cursor:pointer;user-select:none;white-space:nowrap;transition:background-color .15s var(--ease),border-color .15s var(--ease),transform .1s var(--ease)}
.btn:hover{background:var(--subtle-bg)}
.btn:active{transform:translateY(1px)}
.btn:disabled,.btn[disabled]{opacity:.5;cursor:not-allowed;pointer-events:none}
.btn-primary{background:var(--accent);color:var(--accent-fg);border-color:transparent}
.btn-primary:hover{background:var(--accent-hover)}
.btn-danger{background:var(--red-600);color:#fff;border-color:transparent}.btn-danger:hover{background:var(--red-700)}
.btn-success{background:var(--green-600);color:#fff;border-color:transparent}.btn-success:hover{background:var(--green-700)}
.btn-outline{background:transparent;color:var(--accent);border-color:var(--accent)}
.btn-outline:hover{background:color-mix(in srgb,var(--accent) 10%,transparent)}
.btn-ghost{background:transparent;border-color:transparent}.btn-ghost:hover{background:var(--subtle-bg)}
.btn-sm{padding:.25rem .75rem;font-size:.8125rem}
.btn-lg{padding:.75rem 1.5rem;font-size:1rem;line-height:1.5rem}
.btn-block{display:flex;width:100%}
.card{background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--radius)*1.5);box-shadow:var(--sh-sm);transition:box-shadow .2s var(--ease)}
.card-hover:hover{box-shadow:var(--sh-md)}
.card-body{padding:1.25rem}
.card-header,.card-footer{padding:.875rem 1.25rem}
.card-header{border-bottom:1px solid var(--line);font-weight:600}
.card-footer{border-top:1px solid var(--line)}
.badge{display:inline-flex;align-items:center;gap:.25rem;padding:.125rem .625rem;font-size:.75rem;font-weight:500;line-height:1.25rem;border-radius:9999px;--tone:var(--muted);color:var(--tone);background:color-mix(in srgb,var(--tone) 12%,transparent)}
.alert{padding:.875rem 1rem;border-radius:var(--radius);--tone:var(--muted);color:var(--fg);background:color-mix(in srgb,var(--tone) 9%,var(--surface));border:1px solid color-mix(in srgb,var(--tone) 30%,transparent);border-left:3px solid var(--tone)}
${tone('primary', 'primary')}${tone('green', 'green')}${tone('red', 'red')}${tone('amber', 'amber')}${tone('sky', 'sky')}
.label{display:block;margin-bottom:.375rem;font-size:.875rem;font-weight:500}
.input,.select,.textarea{display:block;width:100%;padding:.5rem .75rem;font-size:.875rem;line-height:1.25rem;color:var(--fg);background:var(--surface);border:1px solid var(--line-strong);border-radius:var(--radius);transition:border-color .15s,box-shadow .15s}
.input:focus,.select:focus,.textarea:focus{outline:0;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)}
.input:disabled{opacity:.6;cursor:not-allowed;background:var(--subtle-bg)}
.input-error{border-color:var(--red-500)}
.divider{height:1px;background:var(--line);border:0}
.avatar{display:inline-flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;border-radius:9999px;background:var(--subtle-bg);color:var(--muted);font-weight:600;overflow:hidden;flex:none}
.navbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;background:var(--surface);border-bottom:1px solid var(--line)}
.nav-link{padding:.375rem .75rem;border-radius:var(--radius);color:var(--muted);font-size:.875rem;font-weight:500;transition:color .15s,background-color .15s}
.nav-link:hover,.nav-link.active{color:var(--fg);background:var(--subtle-bg)}
.glass{background:color-mix(in srgb,var(--surface) 75%,transparent);backdrop-filter:blur(12px) saturate(1.4);border:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
.skeleton{border-radius:var(--radius);background:linear-gradient(90deg,var(--subtle-bg) 25%,var(--line) 50%,var(--subtle-bg) 75%);background-size:200% 100%;animation:r-shimmer 1.4s linear infinite}
.prose{max-width:65ch;line-height:1.75}
.prose>*+*{margin-top:1.25em}
.prose h1,.prose h2,.prose h3{font-weight:700;line-height:1.25;letter-spacing:-.02em}
.prose h1{font-size:2.25em}.prose h2{font-size:1.5em;margin-top:2em}.prose h3{font-size:1.25em}
.prose a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.prose ul,.prose ol{padding-left:1.5em}.prose ul{list-style:disc}.prose ol{list-style:decimal}
.prose blockquote{border-left:3px solid var(--line-strong);padding-left:1em;color:var(--muted);font-style:italic}
.prose code{font-family:var(--font-mono);font-size:.875em;background:var(--subtle-bg);padding:.15em .4em;border-radius:.25rem}
.prose pre{background:var(--gray-900);color:var(--gray-100);padding:1rem;border-radius:var(--radius);overflow:auto}
.prose pre code{background:none;padding:0}
.navbar{position:relative;flex-wrap:wrap}
.navbar-brand{margin-right:auto;font-weight:700;font-size:1.125rem;letter-spacing:-.01em}
.navbar-end{display:flex;align-items:center;gap:.5rem}
.navbar-toggle{display:inline-flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;margin-left:.25rem;border:1px solid transparent;border-radius:var(--radius);color:var(--fg);background:transparent}
.navbar-toggle:hover{background:var(--subtle-bg)}
.hamburger,.hamburger::before,.hamburger::after{display:block;width:1.25rem;height:2px;background:currentColor;border-radius:2px;transition:transform .25s var(--ease),top .25s var(--ease),background-color .2s}
.hamburger{position:relative}
.hamburger::before,.hamburger::after{content:"";position:absolute;left:0}
.hamburger::before{top:-6px}
.hamburger::after{top:6px}
.navbar-toggle[aria-expanded=true] .hamburger{background:transparent}
.navbar-toggle[aria-expanded=true] .hamburger::before{top:0;transform:rotate(45deg)}
.navbar-toggle[aria-expanded=true] .hamburger::after{top:0;transform:rotate(-45deg)}
.navbar-menu{display:none;flex-direction:column;gap:.25rem;flex-basis:100%;order:3;margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--line)}
.navbar-menu.open{display:flex;animation:r-fade .2s var(--ease)}
.navbar-menu .nav-link{padding:.625rem .75rem}
@media(min-width:768px){.navbar-toggle{display:none}.navbar-menu{display:flex;flex-direction:row;flex-basis:auto;order:0;margin:0;padding:0;border:0}.navbar-menu .nav-link{padding:.375rem .75rem}}
.navbar.scrolled{box-shadow:var(--sh-md)}
.dropdown{position:relative;display:inline-block}
.dropdown-menu{position:absolute;top:calc(100% + .375rem);left:0;z-index:50;display:none;min-width:12rem;padding:.25rem;background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--radius)*1.25);box-shadow:var(--sh-lg)}
.dropdown-end .dropdown-menu{left:auto;right:0}
.dropdown.open>.dropdown-menu{display:block;animation:r-fade .15s var(--ease)}
.dropdown-item{display:block;width:100%;padding:.5rem .75rem;text-align:left;font-size:.875rem;color:var(--fg);border-radius:calc(var(--radius) - 2px)}
.dropdown-item:hover{background:var(--subtle-bg)}
.dropdown-divider{height:1px;margin:.25rem 0;background:var(--line)}
.modal{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;padding:1rem}
.modal.open{display:flex}
.modal-overlay{position:absolute;inset:0;background:rgb(0 0 0/.5);backdrop-filter:blur(2px);animation:r-fade .2s var(--ease)}
.modal-dialog{position:relative;width:100%;max-width:32rem;max-height:90dvh;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--radius)*1.5);box-shadow:var(--sh-2xl);animation:r-up .25s var(--ease)}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--line);font-weight:600}
.modal-body{padding:1.25rem}
.modal-footer{display:flex;justify-content:flex-end;gap:.5rem;padding:.875rem 1.25rem;border-top:1px solid var(--line)}
.btn-close{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;font-size:1.25rem;line-height:1;color:var(--muted);border-radius:var(--radius)}
.btn-close:hover{background:var(--subtle-bg);color:var(--fg)}
.tabs{display:flex;gap:.25rem;overflow-x:auto;border-bottom:1px solid var(--line)}
.tab{margin-bottom:-1px;padding:.5rem 1rem;font-size:.875rem;font-weight:500;white-space:nowrap;color:var(--muted);border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
.tab:hover{color:var(--fg)}
.tab.active,.tab[aria-selected=true]{color:var(--accent);border-color:var(--accent)}
.tab-panel{display:none;padding-top:1rem}
.tab-panel.active{display:block;animation:r-fade .2s var(--ease)}
.accordion{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}
.accordion+.accordion{margin-top:.5rem}
.accordion>summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.875rem 1rem;font-weight:500;cursor:pointer;list-style:none}
.accordion>summary::-webkit-details-marker{display:none}
.accordion>summary::after{content:"+";font-size:1.25rem;line-height:1;color:var(--muted)}
.accordion[open]>summary::after{content:"\\2212"}
.accordion-body{padding:0 1rem 1rem;color:var(--muted);font-size:.875rem}
.toast-container{position:fixed;right:0;bottom:0;z-index:70;display:flex;flex-direction:column;gap:.5rem;max-width:100%;padding:1rem;pointer-events:none}
.toast{display:flex;align-items:flex-start;gap:.75rem;min-width:16rem;max-width:24rem;padding:.75rem 1rem;font-size:.875rem;color:var(--fg);background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--tone,var(--accent));border-radius:var(--radius);box-shadow:var(--sh-lg);pointer-events:auto;animation:r-up .25s var(--ease)}
.toast-success{--tone:var(--t-green)}.toast-error{--tone:var(--t-red)}.toast-warning{--tone:var(--t-amber)}.toast-info{--tone:var(--t-sky)}
.toast.leaving{opacity:0;translate:0 .5rem;transition:opacity .2s,translate .2s}
[data-tip]{position:relative}
[data-tip]:hover::after,[data-tip]:focus-visible::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;translate:-50% 0;z-index:50;padding:.25rem .5rem;font-size:.75rem;font-weight:500;white-space:nowrap;color:var(--surface);background:var(--fg);border-radius:calc(var(--radius) - 2px);pointer-events:none}
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius)}
.table{width:100%;font-size:.875rem;text-align:left}
.table th{padding:.625rem .875rem;font-weight:600;white-space:nowrap;color:var(--muted);border-bottom:1px solid var(--line-strong)}
.table td{padding:.625rem .875rem;border-bottom:1px solid var(--line)}
.table-striped tbody tr:nth-child(even){background:var(--subtle-bg)}
.table-hover tbody tr:hover{background:var(--subtle-bg)}
.breadcrumb{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.875rem;color:var(--muted)}
.breadcrumb li+li::before{content:"/";margin-right:.5rem;color:var(--subtle)}
.breadcrumb a:hover{color:var(--fg)}
.pagination{display:flex;gap:.25rem}
.page-link{display:inline-flex;align-items:center;justify-content:center;min-width:2.25rem;height:2.25rem;padding:0 .5rem;font-size:.875rem;background:var(--surface);border:1px solid var(--line-strong);border-radius:var(--radius)}
.page-link:hover{background:var(--subtle-bg)}
.page-link.active{color:var(--accent-fg);background:var(--accent);border-color:transparent}
.progress{height:.5rem;overflow:hidden;background:var(--subtle-bg);border-radius:9999px}
.progress-bar{width:var(--value,0%);height:100%;background:var(--accent);border-radius:inherit;transition:width .4s var(--ease)}
.spinner{display:inline-block;width:1.25rem;height:1.25rem;border:2px solid var(--line-strong);border-top-color:var(--accent);border-radius:50%;animation:r-spin .7s linear infinite}
.switch{position:relative;display:inline-flex;flex:none;width:2.5rem;height:1.5rem}
.switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.switch span{width:100%;height:100%;background:var(--line-strong);border-radius:9999px;transition:background-color .2s}
.switch span::after{content:"";position:absolute;top:.1875rem;left:.1875rem;width:1.125rem;height:1.125rem;background:#fff;border-radius:50%;box-shadow:var(--sh-sm);transition:translate .2s var(--ease)}
.switch input:checked+span{background:var(--accent)}
.switch input:checked+span::after{translate:1rem 0}
.switch input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}
.check{width:1rem;height:1rem;accent-color:var(--accent)}
.list-group{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}
.list-group-item{padding:.75rem 1rem;border-bottom:1px solid var(--line)}
.list-group-item:last-child{border-bottom:0}
.sidebar{flex:none;width:16rem;padding:1rem;background:var(--surface);border-right:1px solid var(--line)}
.hero{padding:4rem 0}
@media(min-width:768px){.hero{padding:6rem 0}}
.footer{padding:2rem 0;font-size:.875rem;color:var(--muted);border-top:1px solid var(--line)}
`;

/* ---------- Registri utility ---------- */
const R = [];
const add = (c, d, o) => R.push({ c, d, ...o });
const set = (prefix, prop, obj, o) => { for (const k in obj) add(k === 'DEFAULT' ? prefix.slice(0, -1) : prefix + k, `${prop}:${obj[k]}`, o); };
const rep = n => `repeat(${n},minmax(0,1fr))`;

/* Layout */
for (const [c, v] of Object.entries({ block: 'block', 'inline-block': 'inline-block', inline: 'inline', flex: 'flex', 'inline-flex': 'inline-flex', grid: 'grid', 'inline-grid': 'inline-grid', hidden: 'none', contents: 'contents' })) add(c, 'display:' + v, { r: 1 });
['static', 'relative', 'absolute', 'fixed', 'sticky'].forEach(p => add(p, 'position:' + p, { r: 1 }));
add('inset-0', 'inset:0'); add('inset-x-0', 'inset-inline:0'); add('inset-y-0', 'inset-block:0');
['top', 'right', 'bottom', 'left'].forEach(s => { add(`${s}-0`, `${s}:0`); add(`${s}-full`, `${s}:100%`); add(`${s}-1/2`, `${s}:50%`); });
add('translate-center', 'translate:-50% -50%');
set('z-', 'z-index', { 0: 0, 10: 10, 20: 20, 30: 30, 40: 40, 50: 50, auto: 'auto' });
set('overflow-', 'overflow', { hidden: 'hidden', auto: 'auto', scroll: 'scroll', visible: 'visible' });
set('overflow-x-', 'overflow-x', { auto: 'auto', hidden: 'hidden' }); set('overflow-y-', 'overflow-y', { auto: 'auto', hidden: 'hidden' });

/* Flex & Grid */
set('flex-', 'flex-direction', { row: 'row', col: 'column', 'row-reverse': 'row-reverse', 'col-reverse': 'column-reverse' }, { r: 1 });
set('flex-', 'flex-wrap', { wrap: 'wrap', nowrap: 'nowrap' }, { r: 1 });
add('flex-1', 'flex:1 1 0%'); add('flex-auto', 'flex:1 1 auto'); add('flex-none', 'flex:none');
add('grow', 'flex-grow:1'); add('grow-0', 'flex-grow:0'); add('shrink', 'flex-shrink:1'); add('shrink-0', 'flex-shrink:0');
const al = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
set('items-', 'align-items', al, { r: 1 }); set('self-', 'align-self', al);
set('justify-', 'justify-content', { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' }, { r: 1 });
add('place-items-center', 'place-items:center'); add('place-content-center', 'place-content:center');
for (let i = 1; i <= 12; i++) { add(`grid-cols-${i}`, `grid-template-columns:${rep(i)}`, { r: 1 }); add(`col-span-${i}`, `grid-column:span ${i}/span ${i}`, { r: 1 }); }
for (let i = 1; i <= 6; i++) add(`grid-rows-${i}`, `grid-template-rows:${rep(i)}`);
add('col-span-full', 'grid-column:1/-1', { r: 1 }); add('grid-cols-none', 'grid-template-columns:none');
add('grid-auto-fit', 'grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))');
add('grid-auto-fill', 'grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))');

/* Spasi */
const S = ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '12', '14', '16', '20', '24', '32'];
const sv = k => k === '0' ? '0' : k === 'px' ? '1px' : (+k * .25) + 'rem';
const SP = { p: 'padding', px: 'padding-inline', py: 'padding-block', pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
  m: 'margin', mx: 'margin-inline', my: 'margin-block', mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
  gap: 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap' };
const RSP = ['p', 'px', 'py', 'm', 'mx', 'my', 'gap', 'gap-x', 'gap-y'];
for (const k in SP) S.forEach(s => add(`${k}-${s}`, `${SP[k]}:${sv(s)}`, RSP.includes(k) ? { r: 1 } : {}));
['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'].forEach(k => add(`${k}-auto`, `${SP[k]}:auto`, { r: 1 }));
S.slice(2).forEach(s => { add(`space-x-${s}`, `margin-left:${sv(s)}`, { x: '>*+*' }); add(`space-y-${s}`, `margin-top:${sv(s)}`, { x: '>*+*' }); });

/* Ukuran */
const SZ = S.concat(['40', '48', '56', '64', '72', '80', '96']);
const FR = { '1/2': '50%', '1/3': '33.333333%', '2/3': '66.666667%', '1/4': '25%', '3/4': '75%', '1/5': '20%', '2/5': '40%', '3/5': '60%', '4/5': '80%' };
const sizes = { full: '100%', auto: 'auto', min: 'min-content', max: 'max-content', fit: 'fit-content' };
SZ.forEach(s => { add(`w-${s}`, `width:${sv(s)}`); add(`h-${s}`, `height:${sv(s)}`); add(`size-${s}`, `width:${sv(s)};height:${sv(s)}`); });
for (const k in sizes) { add(`w-${k}`, `width:${sizes[k]}`, { r: 1 }); add(`h-${k}`, `height:${sizes[k]}`); }
for (const k in FR) add(`w-${k}`, `width:${FR[k]}`, { r: 1 });
add('w-screen', 'width:100vw'); add('h-screen', 'height:100dvh'); add('min-h-screen', 'min-height:100dvh');
add('min-w-0', 'min-width:0'); add('min-h-0', 'min-height:0'); add('min-w-full', 'min-width:100%'); add('max-h-full', 'max-height:100%'); add('max-h-screen', 'max-height:100dvh');
set('max-w-', 'max-width', { xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem', full: '100%', prose: '65ch', none: 'none' });

/* Tipografi */
const TS = { xs: ['.75rem', '1rem'], sm: ['.875rem', '1.25rem'], base: ['1rem', '1.5rem'], lg: ['1.125rem', '1.75rem'], xl: ['1.25rem', '1.75rem'], '2xl': ['1.5rem', '2rem'], '3xl': ['1.875rem', '2.25rem'], '4xl': ['2.25rem', '2.5rem'], '5xl': ['3rem', '1'], '6xl': ['3.75rem', '1'] };
for (const k in TS) add(`text-${k}`, `font-size:${TS[k][0]};line-height:${TS[k][1]}`, { r: 1 });
set('font-', 'font-weight', { thin: 100, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 });
set('font-', 'font-family', { sans: 'var(--font-sans)', serif: 'var(--font-serif)', mono: 'var(--font-mono)' });
set('leading-', 'line-height', { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 });
set('tracking-', 'letter-spacing', { tighter: '-.05em', tight: '-.025em', normal: '0', wide: '.025em', wider: '.05em', widest: '.1em' });
set('text-', 'text-align', { left: 'left', center: 'center', right: 'right', justify: 'justify' }, { r: 1 });
add('uppercase', 'text-transform:uppercase'); add('lowercase', 'text-transform:lowercase'); add('capitalize', 'text-transform:capitalize'); add('normal-case', 'text-transform:none');
add('italic', 'font-style:italic'); add('not-italic', 'font-style:normal');
add('underline', 'text-decoration-line:underline;text-underline-offset:3px', { v: 1 }); add('no-underline', 'text-decoration-line:none', { v: 1 }); add('line-through', 'text-decoration-line:line-through');
add('truncate', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'); add('break-words', 'overflow-wrap:break-word');
add('whitespace-nowrap', 'white-space:nowrap'); add('whitespace-pre-wrap', 'white-space:pre-wrap'); add('text-balance', 'text-wrap:balance'); add('text-pretty', 'text-wrap:pretty');
add('antialiased', '-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale'); add('tabular-nums', 'font-variant-numeric:tabular-nums');
[1, 2, 3].forEach(n => add(`line-clamp-${n}`, `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${n};overflow:hidden`));
set('list-', 'list-style-type', { none: 'none', disc: 'disc', decimal: 'decimal' });

/* Warna */
const C = [];
for (const f in PAL) SHADES.forEach(s => C.push([`${f}-${s}`, `var(--${f}-${s})`]));
C.push(['white', '#fff'], ['black', '#000'], ['transparent', 'transparent'], ['current', 'currentColor'], ['canvas', 'var(--canvas)'], ['surface', 'var(--surface)'], ['subtle-bg', 'var(--subtle-bg)'],
  ['fg', 'var(--fg)'], ['muted', 'var(--muted)'], ['subtle', 'var(--subtle)'], ['line', 'var(--line)'], ['accent', 'var(--accent)'], ['accent-fg', 'var(--accent-fg)']);
const sh = n => +(n.match(/-(\d+)$/) || [])[1] || 0; // varian (hover/dark/dst) hanya untuk shade yang lazim dipakai
C.forEach(([n, v]) => {
  const s = sh(n), core = !s || [50, 100, 400, 500, 600, 700, 900].includes(s);
  add(`text-${n}`, `color:${v}`, core ? { v: 1 } : {}); add(`bg-${n}`, `background-color:${v}`, core ? { v: 1 } : {});
  add(`border-${n}`, `border-color:${v}`, !s || s === 500 ? { v: 1 } : {});
});
[['white', 'white', [10, 20, 50, 70, 80, 90]], ['black', 'black', [10, 20, 40, 50, 60, 80]], ['surface', 'var(--surface)', [70, 80, 90]], ['canvas', 'var(--canvas)', [80, 90]], ['accent', 'var(--accent)', [10, 15, 25]]]
  .forEach(([n, v, ps]) => ps.forEach(p => add(`bg-${n}/${p}`, `background-color:color-mix(in srgb,${v} ${p}%,transparent)`)));
const GD = { t: 'to top', tr: 'to top right', r: 'to right', br: 'to bottom right', b: 'to bottom', bl: 'to bottom left', l: 'to left', tl: 'to top left' };
for (const k in GD) add(`bg-gradient-to-${k}`, `--gd:${GD[k]};background-image:linear-gradient(var(--gd),var(--gf,transparent),var(--gt,transparent))`);
C.filter(([n]) => /-(100|200|400|500|600|800)$/.test(n) || /^(white|black)$/.test(n)).forEach(([n, v]) => { add(`from-${n}`, `--gf:${v}`); add(`to-${n}`, `--gt:${v}`); });

/* Border, radius, ring, shadow */
add('border', 'border-width:1px;border-style:solid'); add('border-0', 'border-width:0');
add('border-2', 'border-width:2px;border-style:solid'); add('border-4', 'border-width:4px;border-style:solid');
['t', 'r', 'b', 'l'].forEach(s => { const p = { t: 'top', r: 'right', b: 'bottom', l: 'left' }[s]; add(`border-${s}`, `border-${p}-width:1px;border-style:solid`); add(`border-${s}-0`, `border-${p}-width:0`); });
set('border-', 'border-style', { solid: 'solid', dashed: 'dashed', dotted: 'dotted', none: 'none' });
add('divide-y', 'border-top-width:1px', { x: '>*+*' }); add('divide-x', 'border-left-width:1px', { x: '>*+*' });
set('rounded-', 'border-radius', { none: '0', sm: '.125rem', DEFAULT: '.25rem', md: '.375rem', lg: '.5rem', xl: '.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px' });
add('rounded-t-lg', 'border-top-left-radius:.5rem;border-top-right-radius:.5rem'); add('rounded-b-lg', 'border-bottom-left-radius:.5rem;border-bottom-right-radius:.5rem');
add('rounded-t-xl', 'border-top-left-radius:.75rem;border-top-right-radius:.75rem'); add('rounded-b-xl', 'border-bottom-left-radius:.75rem;border-bottom-right-radius:.75rem');
[0, 1, 2, 4].forEach(n => add(`ring-${n}`, n ? `outline:${n}px solid var(--accent);outline-offset:${n > 2 ? 2 : 1}px` : 'outline:0', { v: 1 }));
add('outline-none', 'outline:2px solid transparent;outline-offset:2px');
set('shadow-', 'box-shadow', { none: 'none', sm: 'var(--sh-sm)', DEFAULT: 'var(--sh)', md: 'var(--sh-md)', lg: 'var(--sh-lg)', xl: 'var(--sh-xl)', '2xl': 'var(--sh-2xl)', inner: 'inset 0 2px 4px 0 rgb(var(--sc)/.06)' }, { v: 1 });

/* Efek & interaksi */
[0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].forEach(n => add(`opacity-${n}`, `opacity:${n / 100}`, { v: 1 }));
set('backdrop-blur-', 'backdrop-filter', { sm: 'blur(4px)', md: 'blur(12px)', lg: 'blur(24px)' });
set('blur-', 'filter', { sm: 'blur(4px)', md: 'blur(12px)', lg: 'blur(24px)' }); add('grayscale', 'filter:grayscale(1)');
set('cursor-', 'cursor', { pointer: 'pointer', default: 'default', 'not-allowed': 'not-allowed', wait: 'wait', grab: 'grab' });
add('select-none', 'user-select:none'); add('pointer-events-none', 'pointer-events:none'); add('pointer-events-auto', 'pointer-events:auto');
add('resize-none', 'resize:none'); add('appearance-none', 'appearance:none');
add('transition', 'transition-property:color,background-color,border-color,opacity,box-shadow,transform,translate,scale,rotate;transition-timing-function:var(--ease);transition-duration:.15s');
add('transition-all', 'transition-property:all;transition-timing-function:var(--ease);transition-duration:.15s'); add('transition-none', 'transition-property:none');
[75, 100, 150, 200, 300, 500, 700].forEach(n => add(`duration-${n}`, `transition-duration:${n}ms`));
set('ease-', 'transition-timing-function', { linear: 'linear', in: 'cubic-bezier(.4,0,1,1)', out: 'cubic-bezier(0,0,.2,1)', 'in-out': 'cubic-bezier(.4,0,.2,1)' });
[0, 50, 75, 90, 95, 100, 105, 110, 125, 150].forEach(n => add(`scale-${n}`, `scale:${n / 100}`, { v: 1 }));
[0, 45, 90, 180].forEach(n => { add(`rotate-${n}`, `rotate:${n}deg`, { v: 1 }); if (n) add(`-rotate-${n}`, `rotate:-${n}deg`, { v: 1 }); });
['0.5', '1', '2', '4'].forEach(s => ['x', 'y'].forEach(a => [['', ''], ['-', '-']].forEach(([cn, sg]) =>
  add(`${cn}translate-${a}-${s}`, `--t${a}:${sg}${sv(s)};translate:var(--tx,0) var(--ty,0)`, { v: 1 }))));
add('animate-spin', 'animation:r-spin 1s linear infinite'); add('animate-pulse', 'animation:r-pulse 2s var(--ease) infinite');
add('animate-fade-in', 'animation:r-fade .4s var(--ease) both'); add('animate-slide-up', 'animation:r-up .5s var(--ease) both');
add('aspect-square', 'aspect-ratio:1/1'); add('aspect-video', 'aspect-ratio:16/9');
set('object-', 'object-fit', { cover: 'cover', contain: 'contain', fill: 'fill' });
add('fill-current', 'fill:currentColor'); add('stroke-current', 'stroke:currentColor');
add('sr-only', 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0');
add('scroll-smooth', 'scroll-behavior:smooth'); add('hide-scrollbar', 'scrollbar-width:none');

/* ---------- Emit ---------- */
const sel = (full, r, pre = '', st = '') => `${pre}.${esc(full)}${st}${r.x || ''}`;
const emit = (full, r, pre, st) => keep(full) ? `${sel(full, r, pre, st)}{${r.d}}\n` : '';
let util = R.map(r => emit(r.c, r)).join('');
const V = R.filter(r => r.v);
const DK = ':is(.dark,[data-theme=dark]) ';
util += V.map(r => emit('dark:' + r.c, r, DK)).join('');
util += V.map(r => emit('group-hover:' + r.c, r, '.group:hover ')).join('');
for (const [v, st] of [['hover', ':hover'], ['focus', ':focus'], ['active', ':active']])
  util += V.map(r => emit(`${v}:${r.c}`, r, '', st)).join('');
for (const b in BP) {
  const body = R.filter(r => r.r).map(r => emit(`${b}:${r.c}`, r)).join('');
  if (body) util += `@media(min-width:${BP[b]}px){\n${body}}\n`;
}

const fam = new Set(); if (tokens) tokens.forEach(t => { fam.add(t); fam.add(t.split('-')[0]); });
const compUsed = l => !tokens || [...l.matchAll(/\.([a-zA-Z][\w-]*)/g)].some(m => fam.has(m[1].split('-')[0])) || [...l.matchAll(/\[([\w-]+)/g)].some(m => tokens.has(m[1]));
const compOut = components.split('\n').filter(l => l.trim() && compUsed(l)).join('\n');
const banner = `/*! Ringan CSS v1.1 — utility-first, ringan, bersih | MIT */\n`;
const css = `${banner}@layer reset,components,utilities;\n${tokensCSS}\n@layer reset{\n${reset}\n}\n@layer components{\n${compOut}\n}\n@layer utilities{\n${util}}\n`;
const min = css.replace(/\/\*(?!!)[\s\S]*?\*\//g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').replace(/\n+/g, '').trim() + '\n';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, name + '.css'), css);
fs.writeFileSync(path.join(outDir, name + '.min.css'), min);
const jsSrc = path.join(__dirname, 'ringan.js');
if (fs.existsSync(jsSrc)) fs.copyFileSync(jsSrc, path.join(outDir, 'ringan.js'));
const kb = n => (n / 1024).toFixed(1) + ' KB';
const gz = kb(require('zlib').gzipSync(min).length);
console.log(`${name}.css ${kb(Buffer.byteLength(css))} | min ${kb(Buffer.byteLength(min))} | gzip ${gz} | ${R.length} utility dasar${tokens ? ' (purged)' : ''}`);