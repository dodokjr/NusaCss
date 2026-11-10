/*! Ringan React v1.1 — komponen React memakai class Ringan CSS.
 *  Ditulis dengan React.createElement agar langsung jalan di Node/Vite/Next tanpa JSX. Peer dependency: react >= 17. */
import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';

const h = React.createElement;
export const cx = (...a) => a.filter(Boolean).join(' ');

/* ---------- Tema & gaya ---------- */
export function useTheme() {
  const read = () => { try { return localStorage.getItem('ringan-theme'); } catch { return null; } };
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const t = read();
    const d = t ? t === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    document.documentElement.classList.toggle('dark', d); setDark(d);
  }, []);
  const toggle = useCallback(() => {
    const d = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', d); setDark(d);
    try { localStorage.setItem('ringan-theme', d ? 'dark' : 'light'); } catch {}
  }, []);
  return [dark, toggle];
}
export function useStyle(initial = 'modern') {
  const [style, set] = useState(initial);
  useEffect(() => {
    let s = initial; try { s = localStorage.getItem('ringan-style') || initial; } catch {}
    set(s);
  }, [initial]);
  useEffect(() => {
    document.documentElement.setAttribute('data-style', style);
    try { localStorage.setItem('ringan-style', style); } catch {}
  }, [style]);
  return [style, set];
}

/* ---------- Hook bantu ---------- */
function useEscape(active, fn) {
  useEffect(() => {
    if (!active) return;
    const on = e => e.key === 'Escape' && fn();
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [active, fn]);
}
function useOutside(ref, active, fn) {
  useEffect(() => {
    if (!active) return;
    const on = e => ref.current && !ref.current.contains(e.target) && fn();
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, [ref, active, fn]);
}

/* ---------- Dasar ---------- */
export const Button = ({ variant, size, block, loading, className, children, ...p }) =>
  h('button', { type: 'button', className: cx('btn', variant && `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', className), disabled: loading || p.disabled, ...p }, children);

export const Badge = ({ tone, className, children }) => h('span', { className: cx('badge', tone && `badge-${tone}`, className) }, children);

export function Alert({ tone = 'sky', onClose, className, children }) {
  return h('div', { className: cx('alert', `alert-${tone}`, className), role: 'alert' },
    h('div', { style: { flex: 1 } }, children),
    onClose && h('button', { className: 'btn-close', type: 'button', 'aria-label': 'Tutup', onClick: onClose }, '×'));
}

export const Card = ({ header, footer, hover, className, children }) =>
  h('div', { className: cx('card', hover && 'card-hover', className) },
    header && h('div', { className: 'card-header' }, header), children,
    footer && h('div', { className: 'card-footer' }, footer));

export function Input({ label, error, id, className, ...p }) {
  const uid = id || (label ? 'in-' + label.toLowerCase().replace(/\W+/g, '-') : undefined);
  return h('div', null,
    label && h('label', { className: 'label', htmlFor: uid }, label),
    h('input', { id: uid, className: cx('input', error && 'input-error', className), 'aria-invalid': !!error, ...p }),
    error && h('p', { className: 'text-sm', style: { color: 'var(--t-red)', marginTop: '.25rem' } }, error));
}

export const Switch = ({ checked, onChange, label }) =>
  h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '.5rem' } },
    h('span', { className: 'switch' }, h('input', { type: 'checkbox', checked, onChange: e => onChange(e.target.checked) }), h('span')),
    label);

export const Progress = ({ value = 0 }) => h('div', { className: 'progress', role: 'progressbar', 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { className: 'progress-bar', style: { '--value': value + '%' } }));

/* ---------- Navbar dengan hamburger ---------- */
export function Navbar({ brand, links = [], actions, current, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);
  useOutside(ref, open, close);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return h('header', { ref, className: cx('navbar', scrolled && 'scrolled') },
    h('a', { className: 'navbar-brand', href: '/' }, brand),
    h('div', { className: 'navbar-end' }, actions,
      h('button', { className: 'navbar-toggle', type: 'button', 'aria-expanded': open, 'aria-controls': 'r-menu', 'aria-label': 'Menu', onClick: () => setOpen(o => !o) }, h('span', { className: 'hamburger' }))),
    h('nav', { id: 'r-menu', className: cx('navbar-menu', open && 'open') },
      links.map(l => h('a', { key: l.href, href: l.href, className: cx('nav-link', current === l.href && 'active'), onClick: e => { setOpen(false); onNavigate && (e.preventDefault(), onNavigate(l.href)); } }, l.label))));
}

/* ---------- Dropdown ---------- */
export function Dropdown({ label, items = [], align }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close); useOutside(ref, open, close);
  return h('div', { ref, className: cx('dropdown', open && 'open', align === 'end' && 'dropdown-end') },
    h(Button, { variant: 'outline', 'aria-expanded': open, 'aria-haspopup': 'menu', onClick: () => setOpen(o => !o) }, label),
    h('div', { className: 'dropdown-menu', role: 'menu' }, items.map((it, i) => it === '-'
      ? h('div', { key: i, className: 'dropdown-divider' })
      : h('button', { key: i, role: 'menuitem', type: 'button', className: 'dropdown-item', onClick: () => { setOpen(false); it.onClick && it.onClick(); } }, it.label))));
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, footer, children }) {
  const dialog = useRef(null);
  useEscape(open, onClose);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement, old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const f = dialog.current && dialog.current.querySelector('button,[href],input,select,textarea');
    f && f.focus();
    return () => { document.body.style.overflow = old; prev && prev.focus && prev.focus(); };
  }, [open]);
  return h('div', { className: cx('modal', open && 'open'), role: 'dialog', 'aria-modal': true, 'aria-hidden': !open, 'aria-label': title },
    h('div', { className: 'modal-overlay', onClick: onClose }),
    h('div', { className: 'modal-dialog', ref: dialog },
      h('div', { className: 'modal-header' }, h('span', null, title), h('button', { className: 'btn-close', type: 'button', 'aria-label': 'Tutup', onClick: onClose }, '×')),
      h('div', { className: 'modal-body' }, children),
      footer && h('div', { className: 'modal-footer' }, footer)));
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs = [], initial = 0 }) {
  const [i, setI] = useState(initial);
  const key = e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    setI(n => (n + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length);
  };
  return h('div', null,
    h('div', { className: 'tabs', role: 'tablist', onKeyDown: key },
      tabs.map((t, n) => h('button', { key: n, role: 'tab', type: 'button', className: cx('tab', n === i && 'active'), 'aria-selected': n === i, tabIndex: n === i ? 0 : -1, onClick: () => setI(n) }, t.label))),
    h('div', { className: 'tab-panel active', role: 'tabpanel' }, tabs[i] && tabs[i].content));
}

/* ---------- Accordion ---------- */
export function Accordion({ items = [], exclusive = true }) {
  const [open, setOpen] = useState(() => new Set());
  const toggle = n => setOpen(s => { const x = new Set(exclusive ? [] : s); s.has(n) ? x.delete(n) : x.add(n); return x; });
  return h('div', null, items.map((it, n) => h('details', { key: n, className: 'accordion', open: open.has(n), onToggle: e => { if (e.target.open !== open.has(n)) toggle(n); } },
    h('summary', null, it.title), h('div', { className: 'accordion-body' }, it.content))));
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((message, { type, duration = 4000 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setList(l => [...l, { id, message, type }]);
    if (duration) setTimeout(() => setList(l => l.filter(t => t.id !== id)), duration);
  }, []);
  return h(ToastCtx.Provider, { value: push }, children,
    h('div', { className: 'toast-container', 'aria-live': 'polite' }, list.map(t =>
      h('div', { key: t.id, className: cx('toast', t.type && `toast-${t.type}`), role: 'status' },
        h('span', { style: { flex: 1 } }, t.message),
        h('button', { className: 'btn-close', type: 'button', 'aria-label': 'Tutup', onClick: () => setList(l => l.filter(x => x.id !== t.id)) }, '×')))));
}
