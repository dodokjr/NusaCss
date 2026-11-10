/*! Ringan JS v1.1 — interaksi tanpa dependensi (UMD: browser, Node/bundler) */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Ringan = api;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.init);
      else api.init();
    }
  }(typeof self !== 'undefined' ? self : this, function () {
    'use strict';
    var doc = typeof document !== 'undefined' ? document : null;
    var $ = function (s, c) { return (c || doc).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
    var FOCUS = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    var store = {
      get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };
  
    /* ---------- Tema (gelap/terang) dan gaya (simple/modern/classic) ---------- */
    var theme = {
      apply: function () {
        var t = store.get('ringan-theme');
        var dark = t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches);
        doc.documentElement.classList.toggle('dark', dark);
        $$('[data-r-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(dark)); });
      },
      toggle: function () {
        store.set('ringan-theme', doc.documentElement.classList.contains('dark') ? 'light' : 'dark');
        theme.apply();
      }
    };
    var style = {
      set: function (name) {
        doc.documentElement.setAttribute('data-style', name);
        store.set('ringan-style', name);
        $$('[data-r-style]').forEach(function (b) {
          var on = b.getAttribute('data-r-style') === name;
          b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
        });
      }
    };
  
    /* ---------- Buka/tutup (hamburger, sidebar) ---------- */
    function setToggle(trigger, open) {
      var target = $(trigger.getAttribute('data-r-toggle'));
      if (!target) return;
      target.classList.toggle('open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }
    function closeMenus(e) {
      $$('.navbar-menu.open').forEach(function (m) {
        var nb = m.closest('.navbar');
        var inside = e && m.contains(e.target), link = e && e.target.closest && e.target.closest('a');
        var outside = e && nb && !nb.contains(e.target);
        if (!e || (inside && link) || outside) {
          m.classList.remove('open');
          $$('[data-r-toggle="#' + m.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
        }
      });
    }
  
    /* ---------- Dropdown ---------- */
    function closeDropdowns(except) {
      $$('.dropdown.open').forEach(function (d) { if (d !== except) d.classList.remove('open'); });
    }
  
    /* ---------- Modal ---------- */
    var modal = {
      open: function (target, trigger) {
        var m = typeof target === 'string' ? $(target) : target; if (!m) return;
        m._last = trigger || doc.activeElement;
        m.classList.add('open'); m.removeAttribute('aria-hidden');
        doc.body.style.overflow = 'hidden';
        var f = $(FOCUS, $('.modal-dialog', m) || m); f && f.focus();
      },
      close: function (target) {
        var m = typeof target === 'string' ? $(target) : target; if (!m) return;
        m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
        if (!$('.modal.open')) doc.body.style.overflow = '';
        m._last && m._last.focus && m._last.focus();
      },
      top: function () { var l = $$('.modal.open'); return l[l.length - 1]; }
    };
  
    /* ---------- Tab ---------- */
    function selectTab(trigger) {
      var group = trigger.closest('[data-r-tabs]'); if (!group) return;
      $$('[data-r-tab]', group).forEach(function (t) {
        var on = t === trigger, panel = $(t.getAttribute('data-r-tab'));
        t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (panel) panel.classList.toggle('active', on);
      });
    }
  
    /* ---------- Toast ---------- */
    function toast(message, o) {
      o = o || {};
      var box = $('.toast-container');
      if (!box) { box = doc.createElement('div'); box.className = 'toast-container'; box.setAttribute('aria-live', 'polite'); doc.body.appendChild(box); }
      var t = doc.createElement('div');
      t.className = 'toast' + (o.type ? ' toast-' + o.type : ''); t.setAttribute('role', 'status');
      var s = doc.createElement('span'); s.textContent = message; s.style.flex = '1';
      var x = doc.createElement('button'); x.className = 'btn-close'; x.type = 'button'; x.setAttribute('aria-label', 'Tutup'); x.textContent = '×';
      t.appendChild(s); t.appendChild(x); box.appendChild(t);
      var kill = function () { t.classList.add('leaving'); setTimeout(function () { t.remove(); }, 220); };
      x.onclick = kill; if (o.duration !== 0) setTimeout(kill, o.duration || 4000);
      return kill;
    }
  
    /* ---------- Salin ke papan klip ---------- */
    function copy(text, btn) {
      var done = function () { toast('Tersalin', { type: 'success', duration: 1600 }); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done); else done();
    }
  
    /* ---------- Init + delegasi event ---------- */
    var ready = false;
    function init() {
      if (!doc) return;
      theme.apply(); var s = store.get('ringan-style'); if (s) style.set(s);
      var nb = $$('.navbar'), onScroll = function () { nb.forEach(function (n) { n.classList.toggle('scrolled', window.scrollY > 8); }); };
      if (!ready) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
      if (ready) return; ready = true;
  
      doc.addEventListener('click', function (e) {
        closeMenus(e);
        var t = e.target.closest && e.target.closest('[data-r-toggle],[data-r-dropdown],[data-r-modal],[data-r-close],[data-r-tab],[data-r-theme],[data-r-style],[data-r-dismiss],[data-r-copy],.dropdown-item,.modal-overlay');
        if (!e.target.closest || !e.target.closest('.dropdown')) closeDropdowns();
        if (!t) return;
        if (t.hasAttribute('data-r-toggle')) setToggle(t, !$(t.getAttribute('data-r-toggle')).classList.contains('open'));
        else if (t.hasAttribute('data-r-dropdown')) { var d = t.closest('.dropdown'); closeDropdowns(d); var o = d.classList.toggle('open'); t.setAttribute('aria-expanded', String(o)); }
        else if (t.classList.contains('dropdown-item')) closeDropdowns();
        else if (t.hasAttribute('data-r-modal')) { e.preventDefault(); modal.open(t.getAttribute('data-r-modal'), t); }
        else if (t.hasAttribute('data-r-close') || t.classList.contains('modal-overlay')) modal.close(t.closest('.modal'));
        else if (t.hasAttribute('data-r-tab')) selectTab(t);
        else if (t.hasAttribute('data-r-theme')) theme.toggle();
        else if (t.hasAttribute('data-r-style')) style.set(t.getAttribute('data-r-style'));
        else if (t.hasAttribute('data-r-dismiss')) { var x = t.closest('.alert,.toast,.badge'); x && x.remove(); }
        else if (t.hasAttribute('data-r-copy')) { var src = t.getAttribute('data-r-copy'), el = src.charAt(0) === '#' ? $(src) : null; copy(el ? (el.value || el.textContent) : src); }
      });
  
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          var m = modal.top(); if (m) modal.close(m); else { closeMenus(); closeDropdowns(); }
        }
        if (e.key === 'Tab') {
          var top = modal.top(); if (!top) return;
          var f = $$(FOCUS, top).filter(function (n) { return n.offsetParent !== null; }); if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        var tab = e.target.closest && e.target.closest('[data-r-tab]');
        if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          var all = $$('[data-r-tab]', tab.closest('[data-r-tabs]')), i = all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1);
          var n = all[(i + all.length) % all.length]; n.focus(); selectTab(n);
        }
      });
  
      if (window.matchMedia) matchMedia('(min-width:768px)').addEventListener('change', function () { closeMenus(); });
      $$('[data-r-tabs]').forEach(function (g) { if (!$('[data-r-tab].active', g)) { var f = $('[data-r-tab]', g); f && selectTab(f); } });
    }
  
    return { init: init, theme: theme, style: style, modal: modal, toast: toast, copy: copy };
  }));