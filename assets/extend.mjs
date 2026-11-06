#!/usr/bin/env node
/* Nusa CSS v1.3 → v1.4
 * Membaca src/nusa.v13.css, menambah utilitas + komponen baru (tanpa menduplikasi class yang sudah ada),
 * lalu menulis assets/nusa.css dan assets/nusa.min.css.   Jalankan: node extend.mjs */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dir = path.dirname(new URL(import.meta.url).pathname);
const base = fs.readFileSync(path.join(dir, 'src/nusa.v13.css'), 'utf8');

/* ---------- class yang sudah ada (agar tidak dobel) ---------- */
const have = new Set();
for (const m of base.matchAll(/\.((?:\\.|[\w-])+)/g)) have.add(m[1].replace(/\\(.)/g, '$1'));

const esc = s => s.replace(/[^\w-]/g, '\\$&');
const BP = { sm: 640, md: 768, lg: 1024, xl: 1280 };
const R = [];
const add = (c, d, o = {}) => R.push({ c, d, ...o });
const set = (pre, prop, obj, o) => { for (const k in obj) add(k === '_' ? pre.slice(0, -1) : pre + k, `${prop}:${obj[k]}`, o); };
const rep = n => `repeat(${n},minmax(0,1fr))`;

/* ========== SKALA ========== */
const S = [0, 'px', .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
const sv = k => k === 0 ? '0' : k === 'px' ? '1px' : (k * .25) + 'rem';
const pct = (n, d) => +(n / d * 100).toFixed(6) + '%';
const FR = {};
[2, 3, 4, 5, 6, 12].forEach(d => { for (let n = 1; n < d; n++) FR[`${n}/${d}`] = pct(n, d); });
const NAMED = { xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem', '8xl': '90rem' };

/* ========== SPASI: padding, margin, gap, space ========== */
const SP = { p: 'padding', px: 'padding-inline', py: 'padding-block', pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
  m: 'margin', mx: 'margin-inline', my: 'margin-block', mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
  gap: 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap' };
const RSP = ['p', 'px', 'py', 'm', 'mx', 'my', 'gap', 'gap-x', 'gap-y'];
const SMALL = s => s === 'px' || s <= 16;
for (const k in SP) S.forEach(s => add(`${k}-${s}`, `${SP[k]}:${sv(s)}`, RSP.includes(k) && SMALL(s) ? { r: 1 } : {}));
['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'].forEach(k => add(`${k}-auto`, `${SP[k]}:auto`, { r: 1 }));
['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'].forEach(k => S.slice(2, 18).forEach(s => add(`-${k}-${s}`, `${SP[k]}:-${sv(s)}`)));
S.slice(2).forEach(s => { add(`space-x-${s}`, `margin-left:${sv(s)}`, { x: '>*+*' }); add(`space-y-${s}`, `margin-top:${sv(s)}`, { x: '>*+*' }); });
['x', 'y'].forEach(a => {
  const b = a === 'x' ? 'border-left-width' : 'border-top-width';
  add(`divide-${a}`, `${b}:1px;border-style:solid;border-color:var(--line)`, { x: '>*+*' });
});

/* ========== UKURAN: width, min/max, height, size ========== */
S.forEach(s => {
  add(`w-${s}`, `width:${sv(s)}`, s !== 'px' && s >= 16 ? { r: 1 } : {}); add(`h-${s}`, `height:${sv(s)}`);
  add(`size-${s}`, `width:${sv(s)};height:${sv(s)}`);
  if (SMALL(s) || s >= 24) { add(`min-w-${s}`, `min-width:${sv(s)}`); add(`min-h-${s}`, `min-height:${sv(s)}`); add(`max-h-${s}`, `max-height:${sv(s)}`); }
});
const SZK = { full: '100%', auto: 'auto', min: 'min-content', max: 'max-content', fit: 'fit-content', screen: '100vw' };
for (const k in SZK) {
  add(`w-${k}`, `width:${SZK[k]}`, { r: 1 });
  add(`min-w-${k}`, `min-width:${SZK[k]}`);
  if (k !== 'screen') { add(`h-${k}`, `height:${SZK[k]}`); add(`size-${k}`, `width:${SZK[k]};height:${SZK[k]}`); }
}
add('h-screen', 'height:100vh'); add('h-dvh', 'height:100dvh'); add('h-svh', 'height:100svh'); add('w-dvw', 'width:100dvw');
add('min-h-dvh', 'min-height:100dvh'); add('min-h-svh', 'min-height:100svh'); add('min-h-full', 'min-height:100%');
add('max-h-full', 'max-height:100%'); add('max-h-screen', 'max-height:100vh'); add('max-h-none', 'max-height:none'); add('max-h-dvh', 'max-height:100dvh');
for (const k in FR) { add(`w-${k}`, `width:${FR[k]}`, { r: 1 }); add(`h-${k}`, `height:${FR[k]}`); add(`basis-${k}`, `flex-basis:${FR[k]}`, { r: 1 }); }
for (const k in NAMED) { add(`max-w-${k}`, `max-width:${NAMED[k]}`, { r: 1 }); add(`min-w-${k}`, `min-width:${NAMED[k]}`); add(`w-${k}`, `width:${NAMED[k]}`); }
set('max-w-', 'max-width', { prose: '65ch', none: 'none', min: 'min-content', max: 'max-content', fit: 'fit-content', 'screen-sm': '640px', 'screen-md': '768px', 'screen-lg': '1024px', 'screen-xl': '1280px', '0': '0' });
S.filter(SMALL).forEach(s => add(`basis-${s}`, `flex-basis:${sv(s)}`));
['auto', 'full'].forEach(k => add(`basis-${k}`, `flex-basis:${k === 'full' ? '100%' : 'auto'}`));

/* ========== FLEX, GRID, ORDER ========== */
set('flex-', 'flex-direction', { row: 'row', col: 'column', 'row-reverse': 'row-reverse', 'col-reverse': 'column-reverse' }, { r: 1 });
set('flex-', 'flex-wrap', { wrap: 'wrap', nowrap: 'nowrap', 'wrap-reverse': 'wrap-reverse' }, { r: 1 });
add('flex-1', 'flex:1 1 0%'); add('flex-auto', 'flex:1 1 auto'); add('flex-initial', 'flex:0 1 auto'); add('flex-none', 'flex:none');
add('grow', 'flex-grow:1', { r: 1 }); add('grow-0', 'flex-grow:0'); add('shrink', 'flex-shrink:1'); add('shrink-0', 'flex-shrink:0');
const al = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
set('items-', 'align-items', al, { r: 1 }); set('self-', 'align-self', { ...al, auto: 'auto' }, { r: 1 });
set('justify-', 'justify-content', { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly', stretch: 'stretch' }, { r: 1 });
set('content-', 'align-content', { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly', stretch: 'stretch' });
set('justify-items-', 'justify-items', { start: 'start', center: 'center', end: 'end', stretch: 'stretch' });
set('justify-self-', 'justify-self', { start: 'start', center: 'center', end: 'end', auto: 'auto', stretch: 'stretch' });
set('place-items-', 'place-items', { start: 'start', center: 'center', end: 'end', stretch: 'stretch' }, { r: 1 });
set('place-content-', 'place-content', { start: 'start', center: 'center', end: 'end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' });
set('place-self-', 'place-self', { start: 'start', center: 'center', end: 'end', auto: 'auto' });
for (let i = 1; i <= 12; i++) {
  add(`grid-cols-${i}`, `grid-template-columns:${rep(i)}`, { r: 1 }); add(`col-span-${i}`, `grid-column:span ${i}/span ${i}`, { r: 1 });
  add(`order-${i}`, `order:${i}`, { r: 1 }); add(`col-start-${i}`, `grid-column-start:${i}`, { r: 1 }); add(`col-end-${i}`, `grid-column-end:${i}`);
}
add('col-start-13', 'grid-column-start:13'); add('col-end-13', 'grid-column-end:13');
for (let i = 1; i <= 6; i++) { add(`grid-rows-${i}`, `grid-template-rows:${rep(i)}`, { r: 1 }); add(`row-span-${i}`, `grid-row:span ${i}/span ${i}`, { r: 1 }); add(`row-start-${i}`, `grid-row-start:${i}`); }
add('order-first', 'order:-9999', { r: 1 }); add('order-last', 'order:9999', { r: 1 }); add('order-none', 'order:0', { r: 1 });
add('col-span-full', 'grid-column:1/-1', { r: 1 }); add('row-span-full', 'grid-row:1/-1');
add('grid-cols-none', 'grid-template-columns:none', { r: 1 }); add('grid-rows-none', 'grid-template-rows:none');
add('grid-cols-subgrid', 'grid-template-columns:subgrid'); add('grid-cols-12-auto', 'grid-template-columns:repeat(12,1fr)');
set('grid-flow-', 'grid-auto-flow', { row: 'row', col: 'column', dense: 'dense', 'row-dense': 'row dense', 'col-dense': 'column dense' });
set('auto-rows-', 'grid-auto-rows', { auto: 'auto', min: 'min-content', max: 'max-content', fr: 'minmax(0,1fr)' });
set('auto-cols-', 'grid-auto-columns', { auto: 'auto', min: 'min-content', max: 'max-content', fr: 'minmax(0,1fr)' });
[['xs', '8rem'], ['sm', '11rem'], ['md', '16rem'], ['lg', '22rem'], ['xl', '28rem']].forEach(([k, v]) => {
  add(`grid-fit-${k}`, `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,${v}),1fr))`);
  add(`grid-fill-${k}`, `display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,${v}),1fr))`);
});
for (let i = 1; i <= 6; i++) add(`columns-${i}`, `columns:${i}`, { r: 1 });
add('break-inside-avoid', 'break-inside:avoid'); add('break-after-column', 'break-after:column');

/* ========== DISPLAY, POSISI, Z-INDEX, OVERFLOW ========== */
for (const [c, v] of Object.entries({ block: 'block', 'inline-block': 'inline-block', inline: 'inline', flex: 'flex', 'inline-flex': 'inline-flex', grid: 'grid', 'inline-grid': 'inline-grid', hidden: 'none', contents: 'contents', 'flow-root': 'flow-root', table: 'table', 'table-cell': 'table-cell', 'table-row': 'table-row' })) add(c, 'display:' + v, { r: 1 });
['static', 'relative', 'absolute', 'fixed', 'sticky'].forEach(p => add(p, 'position:' + p, { r: 1 }));
add('visible', 'visibility:visible'); add('invisible', 'visibility:hidden'); add('collapse', 'visibility:collapse');
add('not-sr-only', 'position:static;width:auto;height:auto;overflow:visible;clip:auto;white-space:normal');
add('inset-0', 'inset:0'); add('inset-x-0', 'inset-inline:0'); add('inset-y-0', 'inset-block:0'); add('inset-auto', 'inset:auto');
[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40].forEach(n => ["top", "right", "bottom", "left"].forEach(s => { add(`${s}-${n}`, `${s}:${sv(n)}`); if (n) add(`-${s}-${n}`, `${s}:-${sv(n)}`); }));
['top', 'right', 'bottom', 'left'].forEach(s => { add(`${s}-full`, `${s}:100%`); add(`${s}-1/2`, `${s}:50%`); add(`${s}-auto`, `${s}:auto`); });
add('translate-center', 'translate:-50% -50%'); add('translate-x-center', 'translate:-50% 0'); add('translate-y-center', 'translate:0 -50%');
add('center-abs', 'position:absolute;top:50%;left:50%;translate:-50% -50%');
[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(n => add(`z-${n}`, `z-index:${n}`));
add('z-auto', 'z-index:auto'); add('-z-10', 'z-index:-10'); add('z-max', 'z-index:2147483647'); add('isolate', 'isolation:isolate');
set('overflow-', 'overflow', { hidden: 'hidden', auto: 'auto', scroll: 'scroll', visible: 'visible', clip: 'clip' });
set('overflow-x-', 'overflow-x', { auto: 'auto', hidden: 'hidden', scroll: 'scroll', visible: 'visible' });
set('overflow-y-', 'overflow-y', { auto: 'auto', hidden: 'hidden', scroll: 'scroll', visible: 'visible' });
set('overscroll-', 'overscroll-behavior', { auto: 'auto', contain: 'contain', none: 'none' });
add('float-left', 'float:left'); add('float-right', 'float:right'); add('float-none', 'float:none'); add('clear-both', 'clear:both');
add('box-border', 'box-sizing:border-box'); add('box-content', 'box-sizing:content-box');

/* ========== TIPOGRAFI ========== */
const TS = { '2xs': ['.65rem', '1rem'], xs: ['.75rem', '1rem'], sm: ['.875rem', '1.25rem'], base: ['1rem', '1.5rem'], lg: ['1.125rem', '1.75rem'], xl: ['1.25rem', '1.75rem'], '2xl': ['1.5rem', '2rem'], '3xl': ['1.875rem', '2.25rem'], '4xl': ['2.25rem', '2.5rem'], '5xl': ['3rem', '1'], '6xl': ['3.75rem', '1'], '7xl': ['4.5rem', '1'], '8xl': ['6rem', '1'], '9xl': ['8rem', '1'] };
for (const k in TS) add(`text-${k}`, `font-size:${TS[k][0]};line-height:${TS[k][1]}`, { r: 1 });
const FL = { sm: 'clamp(.9rem,1.4vw,1rem)', md: 'clamp(1.1rem,2vw,1.35rem)', lg: 'clamp(1.5rem,3.5vw,2.25rem)', xl: 'clamp(2rem,5vw,3.5rem)', '2xl': 'clamp(2.5rem,7vw,5rem)', '3xl': 'clamp(3rem,10vw,8rem)' };
for (const k in FL) add(`text-fluid-${k}`, `font-size:${FL[k]};line-height:1.1`);
set('font-', 'font-weight', { thin: 100, extralight: 200, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 });
set('font-', 'font-family', {
  sans: 'var(--font)', serif: 'Georgia,"Times New Roman",serif', mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
  display: '"Playfair Display","Iowan Old Style",Georgia,serif', rounded: 'ui-rounded,"SF Pro Rounded",Nunito,system-ui,sans-serif',
  hand: '"Segoe Script","Bradley Hand","Comic Sans MS",cursive', system: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', theme: 'var(--font)'
});
[3, 4, 5, 6, 7, 8, 9, 10].forEach(n => add(`leading-${n}`, `line-height:${n * .25}rem`));
set('leading-', 'line-height', { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 });
set('tracking-', 'letter-spacing', { tighter: '-.05em', tight: '-.025em', normal: '0', wide: '.025em', wider: '.05em', widest: '.1em' });
set('text-', 'text-align', { left: 'left', center: 'center', right: 'right', justify: 'justify', start: 'start', end: 'end' }, { r: 1 });
set('align-', 'vertical-align', { baseline: 'baseline', top: 'top', middle: 'middle', bottom: 'bottom', 'text-top': 'text-top', 'text-bottom': 'text-bottom' });
add('uppercase', 'text-transform:uppercase'); add('lowercase', 'text-transform:lowercase'); add('capitalize', 'text-transform:capitalize'); add('normal-case', 'text-transform:none');
add('italic', 'font-style:italic'); add('not-italic', 'font-style:normal');
add('underline', 'text-decoration-line:underline', { v: 1 }); add('overline', 'text-decoration-line:overline'); add('line-through', 'text-decoration-line:line-through'); add('no-underline', 'text-decoration-line:none', { v: 1 });
set('decoration-', 'text-decoration-style', { solid: 'solid', dotted: 'dotted', dashed: 'dashed', wavy: 'wavy', double: 'double' });
[1, 2, 4, 8].forEach(n => { add(`underline-offset-${n}`, `text-underline-offset:${n}px`); add(`decoration-${n}`, `text-decoration-thickness:${n}px`); });
set('whitespace-', 'white-space', { normal: 'normal', nowrap: 'nowrap', pre: 'pre', 'pre-line': 'pre-line', 'pre-wrap': 'pre-wrap', 'break-spaces': 'break-spaces' });
add('break-normal', 'overflow-wrap:normal;word-break:normal'); add('break-words', 'overflow-wrap:break-word'); add('break-all', 'word-break:break-all'); add('hyphens-auto', 'hyphens:auto');
add('truncate', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'); add('text-ellipsis', 'text-overflow:ellipsis'); add('text-clip', 'text-overflow:clip');
[1, 2, 3, 4, 5].forEach(n => add(`line-clamp-${n}`, `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${n};overflow:hidden`));
add('line-clamp-none', '-webkit-line-clamp:unset');
add('text-wrap', 'text-wrap:wrap'); add('text-nowrap', 'text-wrap:nowrap'); add('text-balance', 'text-wrap:balance'); add('text-pretty', 'text-wrap:pretty');
add('antialiased', '-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale'); add('subpixel-antialiased', '-webkit-font-smoothing:auto');
add('tabular-nums', 'font-variant-numeric:tabular-nums'); add('oldstyle-nums', 'font-variant-numeric:oldstyle-nums'); add('slashed-zero', 'font-variant-numeric:slashed-zero'); add('small-caps', 'font-variant:small-caps');
[2, 4, 6, 8, 10, 12].forEach(n => add(`indent-${n}`, `text-indent:${n * .25}rem`));
set('list-', 'list-style-type', { none: 'none', disc: 'disc', decimal: 'decimal', square: 'square', 'lower-alpha': 'lower-alpha', 'upper-roman': 'upper-roman' });
set('list-', 'list-style-position', { inside: 'inside', outside: 'outside' });
add('text-shadow-sm', 'text-shadow:0 1px 2px #0003'); add('text-shadow', 'text-shadow:0 2px 6px #0004'); add('text-shadow-lg', 'text-shadow:0 6px 20px #0005'); add('text-shadow-none', 'text-shadow:none');
[1, 2, 3].forEach(n => add(`text-stroke-${n}`, `-webkit-text-stroke:${n}px currentColor`));
add('select-none', 'user-select:none'); add('select-text', 'user-select:text'); add('select-all', 'user-select:all'); add('select-auto', 'user-select:auto');

/* ========== WARNA: teks, background, border, ring ========== */
const COL = {
  brand: 'var(--brand)', 'brand-fg': 'var(--brand-fg)', muted: 'var(--muted)', text: 'var(--text)', bg: 'var(--bg)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)', line: 'var(--line)',
  success: 'var(--ok)', danger: 'var(--bad)', warning: 'var(--warn)', info: 'var(--inf)', white: '#fff', black: '#000', transparent: 'transparent', current: 'currentColor'
};
for (const n in COL) {
  const o = { v: 1, dk: 0 };
  add(`text-${n}`, `color:${COL[n]}`, o); add(`bg-${n}`, `background-color:${COL[n]}`, o); add(`border-${n}`, `border-color:${COL[n]}`, o);
  add(`decoration-${n}`, `text-decoration-color:${COL[n]}`); add(`fill-${n}`, `fill:${COL[n]}`); add(`stroke-${n}`, `stroke:${COL[n]}`);
  add(`accent-${n}`, `accent-color:${COL[n]}`); add(`ring-${n}`, `--ring:${COL[n]}`); add(`caret-${n}`, `caret-color:${COL[n]}`); add(`outline-${n}`, `outline-color:${COL[n]}`);
  add(`placeholder-${n}`, `color:${COL[n]}`, { x: '::placeholder' });
  add(`from-${n}`, `--nu-from:${COL[n]}`); add(`to-${n}`, `--nu-to:${COL[n]}`);
}
for (const n of ['brand', 'success', 'danger', 'warning', 'info']) {
  add(`bg-${n}-soft`, `background:color-mix(in oklch,${COL[n]} 14%,transparent)`, { v: 1 });
  add(`border-${n}-soft`, `border-color:color-mix(in oklch,${COL[n]} 35%,transparent)`);
}
const AL = { brand: 'var(--brand)', surface: 'var(--surface)', bg: 'var(--bg)', text: 'var(--text)', white: '#fff', black: '#000', line: 'var(--line)', muted: 'var(--muted)' };
[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].forEach(p => { for (const n in AL) { const v = `color-mix(in oklch,${AL[n]} ${p}%,transparent)`; add(`bg-${n}/${p}`, `background:${v}`); add(`border-${n}/${p}`, `border-color:${v}`); add(`text-${n}/${p}`, `color:${v}`); } });
const GD = { t: 'to top', tr: 'to top right', r: 'to right', br: 'to bottom right', b: 'to bottom', bl: 'to bottom left', l: 'to left', tl: 'to top left' };
for (const k in GD) add(`bg-gradient-to-${k}`, `background-image:linear-gradient(${GD[k]},var(--nu-from,transparent),var(--nu-to,transparent))`);
add('bg-radial', 'background-image:radial-gradient(circle,var(--nu-from,transparent),var(--nu-to,transparent))');
add('bg-conic', 'background-image:conic-gradient(from 0deg,var(--nu-from,transparent),var(--nu-to,transparent),var(--nu-from,transparent))');
const GP = { sunset: ['amber-400', 'pink-500'], ocean: ['sky-400', 'indigo-500'], forest: ['green-400', 'teal-600'], royal: ['violet-500', 'indigo-700'], rose: ['pink-400', 'red-500'], mint: ['teal-300', 'lime-400'], fire: ['amber-400', 'red-600'], night: ['gray-800', 'indigo-900'], peach: ['orange-300', 'pink-300'], sky: ['sky-300', 'blue-500'] };
for (const k in GP) add(`bg-grad-${k}`, `background-image:linear-gradient(135deg,var(--c-${GP[k][0]}),var(--c-${GP[k][1]}))`);
add('bg-dots', 'background-image:radial-gradient(color-mix(in oklch,var(--text) 20%,transparent) 1px,transparent 1px);background-size:18px 18px');
add('bg-grid', 'background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:32px 32px');
add('bg-stripes', 'background-image:repeating-linear-gradient(45deg,var(--surface-2) 0 10px,transparent 10px 20px)');
add('bg-checker', 'background:conic-gradient(var(--surface-2) 25%,transparent 0 50%,var(--surface-2) 0 75%,transparent 0) 0 0/24px 24px');
add('bg-mesh', 'background-image:radial-gradient(at 15% 20%,color-mix(in oklch,var(--brand) 35%,transparent) 0,transparent 50%),radial-gradient(at 85% 15%,color-mix(in oklch,var(--c-pink-500) 30%,transparent) 0,transparent 50%),radial-gradient(at 50% 90%,color-mix(in oklch,var(--c-sky-500) 28%,transparent) 0,transparent 55%)');
set('bg-', 'background-size', { cover: 'cover', contain: 'contain', auto: 'auto' });
set('bg-', 'background-position', { center: 'center', top: 'top', bottom: 'bottom', left: 'left', right: 'right' });
set('bg-', 'background-repeat', { repeat: 'repeat', 'no-repeat': 'no-repeat', 'repeat-x': 'repeat-x', 'repeat-y': 'repeat-y' });
set('bg-', 'background-attachment', { fixed: 'fixed', local: 'local', scroll: 'scroll' });
add('bg-clip-text', '-webkit-background-clip:text;background-clip:text;color:transparent'); add('bg-clip-padding', 'background-clip:padding-box');
add('bg-none', 'background-image:none');
set('bg-blend-', 'background-blend-mode', { multiply: 'multiply', screen: 'screen', overlay: 'overlay', darken: 'darken', lighten: 'lighten' });
set('mix-blend-', 'mix-blend-mode', { normal: 'normal', multiply: 'multiply', screen: 'screen', overlay: 'overlay', difference: 'difference', 'soft-light': 'soft-light' });

/* ========== BORDER, RADIUS, RING, OUTLINE ========== */
[0, 1, 2, 4, 8].forEach(n => {
  add(n === 1 ? 'border' : `border-${n}`, `border-width:${n}px;border-style:${n ? 'solid' : 'none'}`);
  [['t', 'top'], ['r', 'right'], ['b', 'bottom'], ['l', 'left'], ['x', 'inline'], ['y', 'block']].forEach(([s, p]) =>
    add(n === 1 ? `border-${s}` : `border-${s}-${n}`, `border-${p}-width:${n}px;border-style:solid`));
});
set('border-', 'border-style', { solid: 'solid', dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none' });
const RD = { none: '0', sm: '.125rem', _: '.25rem', md: '.375rem', lg: '.5rem', xl: '.75rem', '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem', full: '9999px', brand: 'var(--r)', 'brand-lg': 'calc(var(--r)*1.5)' };
set('rounded-', 'border-radius', RD);
for (const k in RD) {
  const kk = k === '_' ? '' : '-' + k;
  add(`rounded-t${kk}`, `border-top-left-radius:${RD[k]};border-top-right-radius:${RD[k]}`);
  add(`rounded-b${kk}`, `border-bottom-left-radius:${RD[k]};border-bottom-right-radius:${RD[k]}`);
  add(`rounded-l${kk}`, `border-top-left-radius:${RD[k]};border-bottom-left-radius:${RD[k]}`);
  add(`rounded-r${kk}`, `border-top-right-radius:${RD[k]};border-bottom-right-radius:${RD[k]}`);
}
[0, 1, 2, 3, 4, 8].forEach(n => add(`ring-${n}`, `box-shadow:0 0 0 ${n}px var(--ring,var(--brand))`, { v: 1 }));
add('ring', 'box-shadow:0 0 0 3px color-mix(in oklch,var(--ring,var(--brand)) 40%,transparent)', { v: 1 });
add('ring-inset', 'box-shadow:inset 0 0 0 2px var(--ring,var(--brand))');
add('outline-none', 'outline:2px solid transparent;outline-offset:2px'); add('outline', 'outline:2px solid var(--brand)');
[1, 2, 4].forEach(n => add(`outline-${n}`, `outline:${n}px solid var(--brand)`)); [0, 2, 4, 8].forEach(n => add(`outline-offset-${n}`, `outline-offset:${n}px`));

/* ========== EFEK: shadow, opacity, filter, transisi, transform ========== */
set('shadow-', 'box-shadow', {
  none: 'none', xs: '0 1px 2px #0000000d', sm: '0 1px 3px #0000001a,0 1px 2px -1px #0000001a', md: '0 6px 12px -2px #0000001f,0 3px 7px -3px #0000001f',
  _: '0 4px 10px -2px #00000026', lg: '0 12px 28px -8px #00000033', xl: '0 24px 48px -16px #00000040', '2xl': '0 32px 64px -20px #00000059',
  inner: 'inset 0 2px 4px #0000000f', brand: '0 14px 30px -10px var(--brand)', soft: '0 20px 50px -24px #0000004d'
}, { v: 1 });
[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].forEach(n => add(`opacity-${n}`, `opacity:${n / 100}`, { v: 1 }));
set('blur-', 'filter', { none: 'none', sm: 'blur(4px)', _: 'blur(8px)', md: 'blur(12px)', lg: 'blur(16px)', xl: 'blur(24px)', '2xl': 'blur(40px)' });
set('backdrop-blur-', 'backdrop-filter', { none: 'none', sm: 'blur(4px)', _: 'blur(8px)', md: 'blur(12px)', lg: 'blur(16px)', xl: 'blur(24px)', '2xl': 'blur(40px)' });
add('backdrop-saturate', 'backdrop-filter:blur(12px) saturate(1.6)');
[50, 75, 90, 100, 110, 125, 150].forEach(n => { add(`brightness-${n}`, `filter:brightness(${n / 100})`); add(`contrast-${n}`, `filter:contrast(${n / 100})`); add(`saturate-${n}`, `filter:saturate(${n / 100})`); });
add('grayscale', 'filter:grayscale(1)'); add('grayscale-0', 'filter:grayscale(0)'); add('sepia', 'filter:sepia(1)'); add('invert', 'filter:invert(1)'); add('hue-rotate-90', 'filter:hue-rotate(90deg)'); add('hue-rotate-180', 'filter:hue-rotate(180deg)');
add('drop-shadow', 'filter:drop-shadow(0 4px 8px #0004)'); add('drop-shadow-lg', 'filter:drop-shadow(0 12px 20px #0005)');
add('transition', 'transition-property:color,background-color,border-color,opacity,box-shadow,transform,translate,scale,rotate,filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s');
set('transition-', 'transition-property', { all: 'all', none: 'none', colors: 'color,background-color,border-color,text-decoration-color,fill,stroke', opacity: 'opacity', shadow: 'box-shadow', transform: 'transform,translate,scale,rotate' });
[0, 75, 100, 150, 200, 300, 500, 700, 1000].forEach(n => add(`duration-${n}`, `transition-duration:${n}ms`));
[0, 75, 100, 150, 200, 300, 500, 700, 1000].forEach(n => add(`td-${n}`, `transition-delay:${n}ms`));
set('ease-', 'transition-timing-function', { linear: 'linear', in: 'cubic-bezier(.4,0,1,1)', out: 'cubic-bezier(0,0,.2,1)', 'in-out': 'cubic-bezier(.4,0,.2,1)', spring: 'cubic-bezier(.34,1.56,.64,1)', smooth: 'cubic-bezier(.2,.7,.2,1)' });
[0, 50, 75, 90, 95, 100, 105, 110, 125, 150].forEach(n => { add(`scale-${n}`, `scale:${n / 100}`, { v: 1 }); add(`scale-x-${n}`, `scale:${n / 100} 1`); add(`scale-y-${n}`, `scale:1 ${n / 100}`); });
[0, 1, 2, 3, 6, 12, 45, 90, 180].forEach(n => { add(`rotate-${n}`, `rotate:${n}deg`, { v: 1 }); if (n) add(`-rotate-${n}`, `rotate:-${n}deg`, { v: 1 }); });
['x', 'y'].forEach(a => [0, .5, 1, 2, 3, 4, 6, 8, 12, 16].forEach(s => {
  add(`translate-${a}-${s}`, `--t${a}:${sv(s)};translate:var(--tx,0) var(--ty,0)`, { v: 1 });
  if (s) add(`-translate-${a}-${s}`, `--t${a}:-${sv(s)};translate:var(--tx,0) var(--ty,0)`, { v: 1 });
}));
[0, 1, 2, 3, 6, 12].forEach(n => { add(`skew-x-${n}`, `transform:skewX(${n}deg)`); add(`skew-y-${n}`, `transform:skewY(${n}deg)`); });
set('origin-', 'transform-origin', { center: 'center', top: 'top', bottom: 'bottom', left: 'left', right: 'right', 'top-left': 'top left', 'top-right': 'top right', 'bottom-left': 'bottom left', 'bottom-right': 'bottom right' });
add('will-change-transform', 'will-change:transform'); add('will-change-opacity', 'will-change:opacity'); add('gpu', 'transform:translateZ(0)');

/* ========== INTERAKSI, SCROLL, MEDIA ========== */
set('cursor-', 'cursor', { pointer: 'pointer', default: 'default', 'not-allowed': 'not-allowed', wait: 'wait', grab: 'grab', grabbing: 'grabbing', text: 'text', move: 'move', help: 'help', zoom: 'zoom-in' });
set('pointer-events-', 'pointer-events', { none: 'none', auto: 'auto' });
set('resize-', 'resize', { none: 'none', y: 'vertical', x: 'horizontal', both: 'both' }); add('resize', 'resize:both');
add('appearance-none', 'appearance:none;-webkit-appearance:none'); add('touch-none', 'touch-action:none'); add('touch-pan-y', 'touch-action:pan-y'); add('touch-manipulation', 'touch-action:manipulation');
add('scroll-smooth', 'scroll-behavior:smooth'); add('scroll-auto', 'scroll-behavior:auto');
add('snap-x', 'scroll-snap-type:x mandatory'); add('snap-y', 'scroll-snap-type:y mandatory'); add('snap-none', 'scroll-snap-type:none'); add('snap-proximity', 'scroll-snap-type:x proximity');
add('snap-start', 'scroll-snap-align:start'); add('snap-center', 'scroll-snap-align:center'); add('snap-end', 'scroll-snap-align:end'); add('snap-always', 'scroll-snap-stop:always');
[0, 2, 4, 8, 16, 20, 24].forEach(n => { add(`scroll-mt-${n}`, `scroll-margin-top:${sv(n)}`); add(`scroll-pt-${n}`, `scroll-padding-top:${sv(n)}`); });
add('hide-scrollbar', 'scrollbar-width:none'); add('thin-scrollbar', 'scrollbar-width:thin'); add('scrollbar-gutter', 'scrollbar-gutter:stable');
set('object-', 'object-fit', { cover: 'cover', contain: 'contain', fill: 'fill', none: 'none', 'scale-down': 'scale-down' });
set('object-', 'object-position', { center: 'center', top: 'top', bottom: 'bottom', left: 'left', right: 'right' });
const AR = { square: '1/1', video: '16/9', '4/3': '4/3', '3/4': '3/4', '3/2': '3/2', '2/3': '2/3', '21/9': '21/9', '9/16': '9/16', '16/10': '16/10', auto: 'auto' };
for (const k in AR) add(`aspect-${k}`, `aspect-ratio:${AR[k]}`, { r: 1 });
add('fill-current', 'fill:currentColor'); add('stroke-current', 'stroke:currentColor'); add('stroke-2', 'stroke-width:2');
add('hover-lift', 'transition:transform .25s,box-shadow .25s', { x: '' });

/* ========== KOMPONEN v1.4 (satu aturan per baris) ========== */
/* .aurora dan .gborder sama-sama memakai ::before — gabungannya diperbaiki di sini (cincin gradient pindah ke ::after) */
const AUR = (base.match(/\.aurora::before\{([^}]*)\}/) || [])[1] || '';
const AURORA_FIX = `.aurora.gborder::before{${AUR};padding:0;-webkit-mask:none;mask:none;border-radius:0}\n.aurora.gborder::after{content:"";position:absolute;inset:0;padding:1.5px;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,var(--brand),var(--c-pink-500),var(--c-sky-500));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}`;
const components = String.raw`
/* v1.4 — variabel semantik */
:root{--ok:var(--c-green-600);--bad:var(--c-red-600);--warn:var(--c-amber-600);--inf:var(--c-sky-600);--ring:var(--brand);--nav-h:3.75rem}
.dark{--ok:var(--c-green-400);--bad:var(--c-red-400);--warn:var(--c-amber-400);--inf:var(--c-sky-400)}
html{scroll-padding-top:calc(var(--nav-h) + 1rem)}
[hidden]{display:none!important}
${AURORA_FIX}
.hover-lift{transition:transform .25s,box-shadow .25s}.hover-lift:hover{transform:translateY(-4px);box-shadow:0 18px 36px -16px #0004}
/* Navbar + hamburger */
.navbar{flex-wrap:wrap;min-height:var(--nav-h);transition:box-shadow .25s,background-color .25s,border-color .25s}
.navbar-brand{display:inline-flex;align-items:center;gap:.5rem;margin-right:auto;font-size:1.2rem;font-weight:800;letter-spacing:-.02em}
.navbar-end{display:flex;align-items:center;gap:.5rem}
.navbar-toggle{display:inline-grid;place-items:center;width:2.5rem;height:2.5rem;border:1px solid transparent;border-radius:var(--r);background:none;color:var(--text);transition:background-color .2s}
.navbar-toggle:hover{background:var(--surface-2)}
.hamburger,.hamburger::before,.hamburger::after{display:block;width:1.3rem;height:2px;border-radius:2px;background:currentColor;transition:transform .3s cubic-bezier(.2,.7,.2,1),top .3s cubic-bezier(.2,.7,.2,1),background-color .2s}
.hamburger{position:relative}
.hamburger::before,.hamburger::after{content:"";position:absolute;left:0}
.hamburger::before{top:-6px}
.hamburger::after{top:6px}
.navbar-toggle[aria-expanded=true] .hamburger{background:transparent}
.navbar-toggle[aria-expanded=true] .hamburger::before{top:0;transform:rotate(45deg)}
.navbar-toggle[aria-expanded=true] .hamburger::after{top:0;transform:rotate(-45deg)}
.navbar-menu{display:none;flex-basis:100%;flex-direction:column;gap:.2rem;order:3;margin-top:.5rem;padding-top:.75rem;border-top:1px solid var(--line)}
.navbar-menu.open{display:flex;animation:nu-down .25s both}
.navbar-menu a:not(.btn){padding:.65rem .85rem;border-radius:var(--r);color:var(--muted);font-weight:500;transition:.2s}
.navbar-menu a:not(.btn):hover,.navbar-menu a.active{background:var(--brand-soft);color:var(--brand)}
@media(min-width:768px){.navbar-toggle{display:none}.navbar-menu{display:flex;flex-direction:row;flex-basis:auto;order:0;gap:.15rem;margin:0;padding:0;border:0}.navbar-menu.open{animation:none}.navbar-menu a:not(.btn){padding:.4rem .8rem}.navbar-center .navbar-menu{margin-inline:auto}.navbar-end{order:1}}
.navbar.scrolled{background:color-mix(in oklch,var(--surface) 92%,transparent);box-shadow:0 10px 30px -18px #0006}
.navbar-transparent{position:fixed;inset:0 0 auto;background:transparent;border-color:transparent;backdrop-filter:none}
.navbar-transparent.scrolled{background:color-mix(in oklch,var(--surface) 90%,transparent);backdrop-filter:blur(14px);border-color:var(--line)}
.navbar-dark{background:var(--c-gray-900);color:var(--c-gray-100);border-color:transparent}.navbar-dark .navbar-menu a:not(.btn){color:var(--c-gray-300)}.navbar-dark .navbar-toggle{color:#fff}.navbar-dark .navbar-toggle:hover{background:#fff1}
/* Card */
.card{--cp:1.25rem}
.card-header{margin:calc(var(--cp)*-1) calc(var(--cp)*-1) var(--cp);padding:.9rem var(--cp);border-bottom:1px solid var(--line);font-weight:700}
.card-footer{margin:var(--cp) calc(var(--cp)*-1) calc(var(--cp)*-1);padding:.9rem var(--cp);border-top:1px solid var(--line);background:var(--surface-2);border-radius:0 0 calc(var(--r)*1.5) calc(var(--r)*1.5)}
.card-title{font-size:1.15rem;font-weight:700;line-height:1.3}
.card-text{color:var(--muted);font-size:.925rem}
.card-sm{--cp:.75rem;padding:var(--cp)}.card-lg{--cp:2rem;padding:var(--cp)}.card-xl{--cp:clamp(1.75rem,4vw,3rem);padding:var(--cp)}
.card-flush{padding:0;overflow:hidden}.card-flush>.card-img{margin:0;border-radius:0}
.card-content{padding:1.25rem}.card-content-lg{padding:clamp(1.5rem,3vw,2rem)}
.card-img{position:relative;overflow:hidden;margin:calc(var(--cp)*-1) calc(var(--cp)*-1) var(--cp);border-radius:calc(var(--r)*1.5) calc(var(--r)*1.5) 0 0;aspect-ratio:16/10;background:var(--surface-2)}
.card-img>img,.card-img>.ph{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.card:hover>.card-img>img,.card:hover>.card-img>.ph{transform:scale(1.07)}
.card-horizontal{display:grid}.card-horizontal>.card-img{aspect-ratio:auto;min-height:12rem;height:100%}
@media(min-width:640px){.card-horizontal{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}}
.card-flat{box-shadow:none;border-color:transparent;background:var(--surface-2)}
.card-outline{box-shadow:none;background:transparent}
.card-elevated{border-color:transparent;box-shadow:0 22px 48px -22px #0005}
.card-link{display:block;color:inherit}
.card-brand{background:var(--brand);color:var(--brand-fg);border-color:transparent}.card-brand .card-text,.card-brand .text-muted{color:color-mix(in oklch,var(--brand-fg) 80%,transparent)}
.card-overlay{position:relative;display:grid;align-items:end;min-height:16rem;padding:0;overflow:hidden;color:#fff}
.card-overlay>img,.card-overlay>.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.card-overlay::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,#000c,transparent 65%)}
.card-overlay>.card-content{position:relative;z-index:1}.card-overlay .card-text{color:#fffc}
.icon-box{display:grid;place-items:center;flex:none;width:3rem;height:3rem;border-radius:calc(var(--r)*1.3);background:var(--brand-soft);color:var(--brand);font-size:1.4rem}.icon-box-lg{width:4rem;height:4rem;font-size:1.9rem}
.stat{display:grid;gap:.15rem}.stat-value{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;line-height:1.1;letter-spacing:-.02em}.stat-label{color:var(--muted);font-size:.85rem}
.profile{text-align:center}.profile .avatar{margin-inline:auto}
.quote{position:relative;padding-top:2.25rem}.quote::before{content:"“";position:absolute;top:.4rem;left:1.1rem;font:700 4rem/1 Georgia,serif;color:var(--brand);opacity:.3}
.pricing{text-align:center}.price-big{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1}
.checklist>li{display:flex;gap:.55rem;align-items:flex-start;padding:.3rem 0}.checklist>li::before{content:"✓";flex:none;color:var(--ok);font-weight:800}
.logo-cloud{display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem 3rem;color:var(--muted);font-weight:800;opacity:.75}
/* Produk / Store */
.product{position:relative}.product-badge{position:absolute;top:.75rem;left:.75rem;z-index:2;background:color-mix(in oklch,var(--surface) 90%,transparent);backdrop-filter:blur(6px);box-shadow:0 2px 8px #0002}.product-fav{position:absolute;top:.75rem;right:.75rem;z-index:2}
.product-actions{position:absolute;inset:auto .75rem .75rem;z-index:2;display:flex;gap:.5rem;opacity:0;transform:translateY(10px);transition:.3s}.product:hover .product-actions{opacity:1;transform:none}
@media(hover:none){.product-actions{opacity:1;transform:none}}
.price{font-size:1.1rem;font-weight:800}.price del{margin-left:.4rem;color:var(--muted);font-size:.8em;font-weight:400}
.rating{display:inline-flex;align-items:center;gap:.15rem;color:var(--c-amber-500);font-size:.85rem;font-weight:600}.rating small{color:var(--muted);font-weight:400}
.qty{display:inline-flex;align-items:center;overflow:hidden;border:1px solid var(--line);border-radius:var(--r)}.qty button{width:2rem;height:2rem;border:0;background:none;color:var(--text)}.qty button:hover{background:var(--surface-2)}.qty span{min-width:2rem;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.cart-item{display:grid;grid-template-columns:4.5rem 1fr auto;gap:.9rem;align-items:center;padding:.9rem 0;border-bottom:1px solid var(--line)}
.badge-count{position:absolute;top:-.3rem;right:-.3rem;display:grid;place-items:center;min-width:1.1rem;height:1.1rem;padding:0 .25rem;border-radius:99px;background:var(--c-red-500);color:#fff;font-size:.65rem;font-weight:700}
/* Form tambahan */
.select,.textarea{width:100%;padding:.6rem .9rem;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);color:inherit;font:inherit;transition:.2s}
.select:focus,.textarea:focus{outline:0;border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklch,var(--brand) 25%,transparent)}
.textarea{min-height:7rem;resize:vertical}
.input-group{display:flex}.input-group>.input{border-radius:var(--r) 0 0 var(--r)}.input-group>.btn{border-radius:0 var(--r) var(--r) 0}
.newsletter{display:flex;gap:.5rem;max-width:26rem}.newsletter .input{flex:1}
.divider-text{display:flex;align-items:center;gap:1rem;color:var(--muted);font-size:.85rem}.divider-text::before,.divider-text::after{content:"";flex:1;height:1px;background:var(--line)}
/* Gambar */
.img{display:block;max-width:100%;height:auto}.img-cover{width:100%;height:100%;object-fit:cover}.img-contain{width:100%;height:100%;object-fit:contain}
.img-round{border-radius:var(--r)}.img-rounded-lg{border-radius:calc(var(--r)*2)}.img-circle{border-radius:50%;aspect-ratio:1;object-fit:cover}
.img-thumb{padding:.25rem;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}
.img-shadow{box-shadow:0 22px 44px -18px #0006}
.img-zoom{overflow:hidden;border-radius:var(--r)}.img-zoom>*{transition:transform .7s cubic-bezier(.2,.7,.2,1)}.img-zoom:hover>*{transform:scale(1.08)}
.img-gray{filter:grayscale(1);transition:filter .4s}.img-gray:hover{filter:none}
.img-frame{position:relative;isolation:isolate}.img-frame::before{content:"";position:absolute;inset:.9rem -.9rem -.9rem .9rem;border:2px solid var(--brand);border-radius:inherit;opacity:.55;z-index:-1}
.figure{display:grid;gap:.5rem}.figcaption{color:var(--muted);font-size:.85rem;text-align:center}
.gallery{display:grid;gap:.75rem;grid-template-columns:repeat(2,minmax(0,1fr))}.gallery>*{overflow:hidden;border-radius:var(--r)}
@media(min-width:768px){.gallery{grid-template-columns:repeat(4,minmax(0,1fr))}}
.gallery-masonry{columns:2 10rem;column-gap:.75rem}.gallery-masonry>*{break-inside:avoid;margin-bottom:.75rem;overflow:hidden;border-radius:var(--r)}
.avatar{overflow:hidden}.avatar>img{width:100%;height:100%;object-fit:cover}.avatar-sm{width:2rem;height:2rem;font-size:.8rem}.avatar-lg{width:3.5rem;height:3.5rem;font-size:1.2rem}.avatar-xl{width:5rem;height:5rem;font-size:1.8rem}
.ph{position:relative;display:grid;place-items:center;overflow:hidden;color:#fff;background:linear-gradient(135deg,var(--a1,var(--c-indigo-400)),var(--a2,var(--c-pink-400)))}
.ph::after{content:attr(data-ph);font-size:var(--ph-size,2.5rem);filter:drop-shadow(0 4px 8px #0004)}
.ph-1{--a1:var(--c-indigo-400);--a2:var(--c-pink-400)}.ph-2{--a1:var(--c-sky-400);--a2:var(--c-teal-400)}.ph-3{--a1:var(--c-amber-400);--a2:var(--c-orange-500)}.ph-4{--a1:var(--c-green-400);--a2:var(--c-lime-400)}.ph-5{--a1:var(--c-pink-400);--a2:var(--c-orange-400)}.ph-6{--a1:var(--c-violet-400);--a2:var(--c-blue-400)}
/* Loading */
@keyframes nu-bounce{0%,80%,100%{transform:scale(.4);opacity:.5}40%{transform:scale(1);opacity:1}}
@keyframes nu-eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes nu-pulse{50%{opacity:.45}}
@keyframes nu-blink{50%{opacity:0}}
@keyframes nu-bar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
@keyframes nu-shim{to{transform:translateX(100%)}}
@keyframes nu-stripe{to{background-position:1.7rem 0}}
.skeleton-text{height:.9rem;border-radius:.4rem}.skeleton-text+.skeleton-text{margin-top:.5rem}.skeleton-text:last-child:not(:first-child){width:60%}
.skeleton-title{width:55%;height:1.5rem;border-radius:.4rem}.skeleton-circle{width:3rem;height:3rem;border-radius:50%}.skeleton-img{width:100%;aspect-ratio:16/10}
.shimmer{position:relative;overflow:hidden}.shimmer::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in oklch,var(--text) 10%,transparent),transparent);transform:translateX(-100%);animation:nu-shim 1.4s infinite}
.pulse{animation:nu-pulse 1.6s ease-in-out infinite}.blink{animation:nu-blink 1s steps(2) infinite}
.dots{display:inline-flex;gap:.3rem}.dots>i{width:.55rem;height:.55rem;border-radius:50%;background:var(--brand);animation:nu-bounce 1.2s infinite ease-in-out both}.dots>i:nth-child(2){animation-delay:.15s}.dots>i:nth-child(3){animation-delay:.3s}
.eq{display:inline-flex;align-items:flex-end;gap:.2rem;height:1.5rem}.eq>i{width:.25rem;height:100%;border-radius:2px;background:var(--brand);animation:nu-eq 1s infinite ease-in-out}.eq>i:nth-child(2){animation-delay:.15s}.eq>i:nth-child(3){animation-delay:.3s}.eq>i:nth-child(4){animation-delay:.45s}
.orbit{position:relative;width:2.5rem;height:2.5rem;animation:nu-spin 1.2s linear infinite}.orbit::before,.orbit::after{content:"";position:absolute;top:0;left:50%;width:.7rem;height:.7rem;margin-left:-.35rem;border-radius:50%;background:var(--brand)}.orbit::after{top:auto;bottom:0;background:var(--c-pink-500)}
.loader-bar{position:fixed;inset:0 0 auto;z-index:90;height:3px;overflow:hidden;background:color-mix(in oklch,var(--brand) 15%,transparent)}.loader-bar::after{content:"";position:absolute;inset:0 auto 0 0;width:40%;background:linear-gradient(90deg,var(--brand),var(--c-pink-500));animation:nu-bar 1.1s ease-in-out infinite}
.progress-indeterminate>i{width:40%!important;animation:nu-bar 1.2s ease-in-out infinite}
.progress-striped>i{background-image:repeating-linear-gradient(45deg,#fff3 0 .6rem,transparent .6rem 1.2rem);background-size:1.7rem 1.7rem;animation:nu-stripe 1s linear infinite}
.loading-overlay{position:fixed;inset:0;z-index:100;display:none;place-items:center;align-content:center;gap:1rem;background:color-mix(in oklch,var(--bg) 82%,transparent);backdrop-filter:blur(8px)}.loading-overlay.show{display:grid;animation:nu-fade .2s}
.text-shimmer{background:linear-gradient(90deg,var(--muted) 30%,var(--text) 50%,var(--muted) 70%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:nu-shimmer 2s linear infinite}
.is-loading{position:relative;pointer-events:none}.is-loading>*{opacity:.35}.is-loading::after{content:"";position:absolute;top:50%;left:50%;width:1.75rem;height:1.75rem;margin:-.875rem;border:3px solid var(--line);border-top-color:var(--brand);border-radius:50%;animation:nu-spin .8s linear infinite}
.caret::after{content:"";display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-.1em;background:currentColor;animation:nu-blink 1s steps(2) infinite}
/* Efek teks */
.text-glow{text-shadow:0 0 24px color-mix(in oklch,var(--brand) 70%,transparent)}
.text-outline{-webkit-text-stroke:1.5px var(--text);color:transparent}
.marker{padding-inline:.1em;background:linear-gradient(transparent 62%,color-mix(in oklch,var(--c-amber-400) 55%,transparent) 0)}
.link-underline{background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .3s}.link-underline:hover{background-size:100% 2px}
.drop-cap::first-letter{float:left;padding:.08em .1em 0 0;color:var(--brand);font-size:3.6em;font-weight:800;line-height:.85}
.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--brand)}
/* Footer, main, section, hero */
.footer-lg{padding-block:clamp(3rem,7vw,5rem)}
.footer-dark{background:var(--c-gray-900);color:var(--c-gray-300);border-color:transparent}.footer-dark a:hover,.footer-dark .footer-title{color:#fff}
.footer-grid{display:grid;gap:2rem;grid-template-columns:repeat(2,minmax(0,1fr))}.footer-grid>:first-child{grid-column:1/-1}
@media(min-width:768px){.footer-grid{grid-template-columns:1.6fr repeat(3,minmax(0,1fr))}.footer-grid>:first-child{grid-column:auto}}
.footer-title{margin-bottom:.75rem;font-size:.95rem;font-weight:700;color:var(--text)}
.footer-links{display:grid;gap:.5rem;font-size:.9rem}.footer-links a{color:inherit;transition:.2s}.footer-links a:hover{color:var(--brand);padding-left:.25rem}
.footer-bottom{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid color-mix(in oklch,currentColor 18%,transparent);font-size:.85rem}
.social{display:flex;gap:.5rem}.social a{display:grid;place-items:center;width:2.2rem;height:2.2rem;border:1px solid color-mix(in oklch,currentColor 25%,transparent);border-radius:50%;transition:.2s}.social a:hover{background:var(--brand);border-color:var(--brand);color:var(--brand-fg);transform:translateY(-2px)}
.main-narrow{max-width:48rem;margin-inline:auto}.main-wide{max-width:90rem;margin-inline:auto}
.section-lg{padding-block:clamp(4rem,10vw,8rem)}.section-xl{padding-block:clamp(5rem,14vw,11rem)}.section-alt{background:var(--surface-2)}
.section-dark{--surface:oklch(.27 .02 270);--surface-2:oklch(.3 .02 270);--text:var(--c-gray-50);--muted:var(--c-gray-400);--line:oklch(.37 .02 270);background:var(--c-gray-900);color:var(--c-gray-100)}
.container-md{max-width:64rem}.container-lg{max-width:90rem}.container-xl{max-width:110rem}.container-fluid{max-width:none}
.hero{position:relative;isolation:isolate;display:grid;align-items:center;min-height:min(80dvh,46rem);padding-block:clamp(4rem,10vw,8rem)}.hero-sm{min-height:20rem}.hero-full{min-height:100dvh}
.hero-media{position:absolute;inset:0;z-index:-1;width:100%;height:100%;object-fit:cover}
.pad{padding:clamp(1rem,3vw,2rem)}.pad-lg{padding:clamp(1.5rem,5vw,3rem)}.pad-xl{padding:clamp(2rem,8vw,5rem)}.pad-x{padding-inline:clamp(1rem,4vw,3rem)}.pad-y{padding-block:clamp(1rem,4vw,3rem)}.pad-x-lg{padding-inline:clamp(1.5rem,7vw,6rem)}.pad-y-lg{padding-block:clamp(2rem,8vw,6rem)}
.gap-fluid{gap:clamp(1rem,3vw,2.5rem)}.gap-fluid-lg{gap:clamp(1.5rem,5vw,4rem)}
/* Tabel */
.table-responsive{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.table-card{overflow:hidden;border:1px solid var(--line);border-radius:calc(var(--r)*1.5);background:var(--surface)}.table-card .table th{background:var(--surface-2)}.table-card .table tbody tr:last-child td{border-bottom:0}
.table-striped tbody tr:nth-child(even) td{background:var(--surface-2)}
.table-bordered th,.table-bordered td{border:1px solid var(--line)}
.table-sm th,.table-sm td{padding:.4rem .6rem;font-size:.82rem}.table-lg th,.table-lg td{padding:1rem 1.1rem}
.table-sticky thead th{position:sticky;top:0;z-index:2;background:var(--surface-2)}
.table-center th,.table-center td{text-align:center}
.table .num{text-align:right;font-variant-numeric:tabular-nums}
.table-flat tbody tr:hover td{background:none}
.table-dark{color:var(--c-gray-100);background:var(--c-gray-900)}.table-dark th{background:var(--c-gray-800);color:var(--c-gray-300)}.table-dark td,.table-dark th{border-color:var(--c-gray-800)}.table-dark tbody tr:hover td{background:var(--c-gray-800)}
.table tr.row-active td{background:var(--brand-soft)}.table tr.row-ok td{background:color-mix(in oklch,var(--ok) 10%,transparent)}.table tr.row-bad td{background:color-mix(in oklch,var(--bad) 10%,transparent)}
@media(max-width:639px){.table-stack thead{display:none}.table-stack tr{display:block;margin-bottom:.75rem;padding:.4rem .8rem;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}.table-stack td{display:flex;justify-content:space-between;gap:1rem;padding:.4rem 0;border:0;text-align:right}.table-stack td::before{content:attr(data-label);color:var(--muted);font-weight:600;text-align:left}}
/* Efek scroll */
.reveal-left{transform:translateX(-40px)}.reveal-right{transform:translateX(40px)}.reveal-zoom{transform:scale(.88)}.reveal-flip{transform:perspective(800px) rotateX(18deg) translateY(20px)}
.reveal-blur{filter:blur(12px);transition:opacity .7s,transform .7s,filter .7s}.reveal-blur.in{filter:none}
.rd-1{transition-delay:.1s}.rd-2{transition-delay:.2s}.rd-3{transition-delay:.3s}.rd-4{transition-delay:.4s}.rd-5{transition-delay:.5s}.rd-6{transition-delay:.6s}
.sticky-top{position:sticky;top:calc(var(--nav-h) + 1rem);align-self:start}
.snap-x-box{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.snap-x-box>*{flex:none;scroll-snap-align:start}.snap-x-box::-webkit-scrollbar{display:none}
.carousel{display:flex;gap:1rem;overflow-x:auto;padding-bottom:.5rem;scroll-snap-type:x mandatory;scrollbar-width:thin}.carousel>*{flex:0 0 min(85%,20rem);scroll-snap-align:start}
.parallax{will-change:transform}
.to-top{position:fixed;right:1rem;bottom:1.25rem;z-index:55;visibility:hidden;opacity:0;transform:translateY(12px);transition:.3s}.to-top.show{visibility:visible;opacity:1;transform:none}
.scroll-hint{display:inline-block;animation:nu-hint 1.6s ease-in-out infinite}@keyframes nu-hint{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
@keyframes nu-sfade{from{opacity:0}}@keyframes nu-sscale{from{opacity:0;transform:scale(.85)}}@keyframes nu-sslide{from{opacity:0;transform:translateX(-60px)}}@keyframes nu-sfill{from{background-size:0 100%}}
@supports(animation-timeline:view()){.scroll-fade{animation:nu-sfade linear both;animation-timeline:view();animation-range:entry 0% cover 30%}.scroll-scale{animation:nu-sscale linear both;animation-timeline:view();animation-range:entry 0% cover 35%}.scroll-slide{animation:nu-sslide linear both;animation-timeline:view();animation-range:entry 0% cover 35%}.scroll-fill{background:linear-gradient(90deg,var(--brand),var(--brand)) 0 100%/100% .18em no-repeat;animation:nu-sfill linear both;animation-timeline:view();animation-range:entry 20% cover 45%}}
@media(prefers-reduced-motion:reduce){.parallax{transform:none!important}.scroll-fade,.scroll-scale,.scroll-slide{animation:none}}
`;

/* ========== EMIT ========== */
const one = (name, r, pre = '', st = '') => have.has(name) ? '' : `${pre}.${esc(name)}${st}${r.x === '::placeholder' ? '::placeholder' : (r.x || '')}{${r.d}}\n`;
let util = R.map(r => one(r.c, r)).join('');
const V = R.filter(r => r.v);
const VC = V.filter(r => /^(text|bg|border)-/.test(r.c));                 // dark: hanya warna
const VG = V.filter(r => /^(text|bg|opacity|scale|-?translate|shadow)/.test(r.c)); // group-hover
const VA = V.filter(r => /^(scale|shadow|bg-brand|ring)/.test(r.c));      // active
util += VC.map(r => one('dark:' + r.c, r, '.dark ')).join('');
util += VG.map(r => one('group-hover:' + r.c, r, '.group:hover ')).join('');
for (const [v, st, L] of [['hover', ':hover', V], ['focus', ':focus', V.filter(r => /^(ring|shadow|border|bg|text)/.test(r.c))], ['active', ':active', VA]]) util += L.map(r => one(`${v}:${r.c}`, r, '', st)).join('');
for (const b in BP) {
  const body = R.filter(r => r.r).map(r => one(`${b}:${r.c}`, r)).join('');
  if (body) util += `@media(min-width:${BP[b]}px){\n${body}}\n`;
}

const css = base.replace(/^\/\*! Nusa CSS v1\.3/, '/*! Nusa CSS v1.4') + `\n${components.trim()}\n/* v1.4 — utilitas tambahan (dibuat oleh extend.mjs) */\n${util}`;
const min = css.replace(/\/\*(?!!)[\s\S]*?\*\//g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').replace(/\n+/g, '').trim() + '\n';

fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
fs.writeFileSync(path.join(dir, 'assets/nusa.css'), css);
fs.writeFileSync(path.join(dir, 'assets/nusa.min.css'), min);
const kb = n => (n / 1024).toFixed(1) + ' KB';
const rules = (min.match(/}/g) || []).length;
console.log(`nusa.css ${kb(Buffer.byteLength(css))} | min ${kb(Buffer.byteLength(min))} | gzip ${kb(zlib.gzipSync(min).length)} | ±${rules} aturan | +${R.length} utilitas dasar`);
