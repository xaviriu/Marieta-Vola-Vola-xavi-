(function () {
  'use strict';

  var D = window.MARIETA || {};
  var C = D.contacto || {};
  var ICONS = document.documentElement.getAttribute('data-icons') || 'images/icons.svg';

  function icon(id) {
    return '<svg class="icon" aria-hidden="true"><use href="' + ICONS + '#' + id + '"></use></svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function waLink(msg) {
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  /* ---------- Cabecera pegada ---------- */
  var header = document.querySelector('.site-header');
  var sentinel = document.querySelector('[data-header-sentinel]');
  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Menú móvil ---------- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && closeBtn) closeBtn.focus();
    if (!open && openBtn) openBtn.focus();
  }
  if (menu && openBtn) {
    openBtn.addEventListener('click', function () { setMenu(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- Programa de talleres ---------- */
  var fmtWd = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
  var fmtM = new Intl.DateTimeFormat('es-ES', { month: 'short' });
  var fmtLong = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });
  var fmtYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

  function parseDate(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], 23, 59);
  }
  function dateChip(d) {
    return '<div class="date-chip" aria-hidden="true">' +
      '<span class="date-chip__wd">' + fmtWd.format(d).replace('.', '') + '</span>' +
      '<span class="date-chip__d">' + d.getDate() + '</span>' +
      '<span class="date-chip__m">' + fmtM.format(d).replace('.', '') + '</span></div>';
  }

  function renderProgramme(el) {
    var now = new Date();
    var pastLimit = parseInt(el.getAttribute('data-past-limit') || '99', 10);
    var list = (D.talleres || []).map(function (t) { return Object.assign({ d: parseDate(t.fecha) }, t); });
    var upcoming = list.filter(function (t) { return t.d >= now; }).sort(function (a, b) { return a.d - b.d; });
    var past = list.filter(function (t) { return t.d < now; }).sort(function (a, b) { return b.d - a.d; }).slice(0, pastLimit);
    var html = '';

    if (upcoming.length) {
      html += '<ol class="programme" aria-label="Próximos talleres">' + upcoming.map(function (t) {
        var full = t.estado === 'completo';
        var when = fmtLong.format(t.d);
        var msg = full
          ? 'Hola Cristina, el taller «' + t.titulo + '» del ' + when + ' está completo. ¿Me apuntas en la lista de espera?'
          : 'Hola Cristina, quiero reservar plaza en el taller «' + t.titulo + '» del ' + when + '.';
        return '<li class="programme__row" data-reveal>' + dateChip(t.d) +
          '<div><h3 class="programme__title">' + esc(t.titulo) + '</h3>' +
          '<p class="programme__desc">' + esc(t.descripcion) + '</p>' +
          (full ? '<span class="status status--full">Completo</span>' : '') + '</div>' +
          '<div class="programme__meta">' +
          '<span>' + icon('cal') + '<span><span class="sr-only">Fecha: </span>' + esc(when) + '</span></span>' +
          '<span>' + icon('clock') + esc(t.hora) + '</span>' +
          '<span>' + icon('pin') + esc(t.lugar) + '</span>' +
          '<span>' + icon('check') + 'Todo el material incluido</span></div>' +
          '<a class="btn btn--321 btn--small" href="' + waLink(msg) + '" target="_blank" rel="noopener">' +
          (full ? 'Lista de espera' : 'Reservar plaza') + '<span class="btn__dot">' + icon('wa') + '</span></a></li>';
      }).join('') + '</ol>';
    } else if (!el.hasAttribute('data-hide-empty')) {
      html += '<div class="empty-state" data-reveal>' +
        '<span class="empty-state__icon">' + icon('needle') + '</span>' +
        '<div><h3>Estoy preparando los próximos talleres</h3>' +
        '<p>Escríbeme y te aviso en cuanto abra plazas. Suelo hacerlos en otoño, Navidad y Sant Jordi.</p></div>' +
        '<a class="btn btn--321" href="' + waLink('Hola Cristina, avísame cuando abras plazas para el próximo taller, por favor.') + '" target="_blank" rel="noopener">Avísame<span class="btn__dot">' + icon('wa') + '</span></a></div>';
    }

    if (past.length) {
      html += '<h3 class="past-label">Talleres que ya hemos hecho</h3>' +
        '<ol class="programme" aria-label="Talleres anteriores">' + past.map(function (t) {
          return '<li class="programme__row is-past" data-reveal>' + dateChip(t.d) +
            '<div><h4 class="programme__title">' + esc(t.titulo) + '</h4>' +
            '<p class="programme__desc">' + esc(t.descripcion) + '</p></div>' +
            '<div class="programme__meta">' +
            '<span>' + icon('cal') + esc(fmtYear.format(t.d)) + '</span>' +
            '<span>' + icon('pin') + esc(t.lugar) + '</span></div>' +
            (t.cartel ? '<div class="programme__poster"><img src="' + esc(t.cartel) + '" alt="Cartel del taller ' + esc(t.titulo) + '" loading="lazy" width="132" height="132"></div>' : '<span></span>') +
            '</li>';
        }).join('') + '</ol>';
    }
    el.innerHTML = html;
  }
  document.querySelectorAll('[data-programme]').forEach(renderProgramme);

  /* ---------- Tienda ---------- */
  function productCard(p) {
    var msg = 'Hola Cristina, me interesa: ' + p.nombre + '. ¿Me cuentas más?';
    return '<li data-kind="' + esc(p.tipo) + '"><article class="product">' +
      '<div class="product__img"><img src="' + esc(p.imagen) + '" alt="' + esc(p.nombre) + '" loading="lazy" width="640" height="640"></div>' +
      '<div class="product__body">' +
      '<h3 class="product__name">' + esc(p.nombre) + '</h3>' +
      '<p class="product__desc">' + esc(p.descripcion) + '</p>' +
      '<div class="product__foot"><span class="product__price"><span class="product__kind">' + esc(p.tipo) + '</span>' + (p.precio ? '<strong>' + esc(p.precio) + '</strong>' : 'Pregúntame el precio') + '</span>' +
      '<a class="btn btn--small" href="' + waLink(msg) + '" target="_blank" rel="noopener" aria-label="Lo quiero: ' + esc(p.nombre) + '">Lo quiero<span class="btn__dot">' + icon('wa') + '</span></a></div>' +
      '</div></article></li>';
  }
  function fmtPrecio(v) {
    if (v == null || v === '') return '';
    if (typeof v === 'number') return v.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';
    return v;
  }
  // Productos desde Supabase (los gestiona Cristina en el panel). Si no hay o falla, se usan los de data.js.
  function loadProductos() {
    var cfg = D.supabase, fallback = D.productos || [];
    if (!cfg || !window.fetch) return Promise.resolve(fallback);
    var ctl = window.AbortController ? new AbortController() : null;
    var to = ctl ? setTimeout(function () { ctl.abort(); }, 3500) : null;
    return fetch(cfg.url + '/rest/v1/productos?select=*&visible=eq.true&order=orden.asc,created_at.asc', {
      headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key }, signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (to) clearTimeout(to);
        if (!Array.isArray(rows) || !rows.length) return fallback;
        return rows.map(function (p) { return { nombre: p.nombre, tipo: p.tipo, descripcion: p.descripcion || '', precio: fmtPrecio(p.precio), imagen: p.imagen_url || '' }; });
      })
      .catch(function () { return fallback; });
  }
  var shopEls = document.querySelectorAll('[data-shop]');
  if (shopEls.length) {
    loadProductos().then(function (list) {
      shopEls.forEach(function (el) {
        var limit = parseInt(el.getAttribute('data-limit') || '99', 10);
        el.innerHTML = list.slice(0, limit).map(productCard).join('');
      });
    });
  }
  var filterBox = document.querySelector('[data-filters]');
  if (filterBox) {
    filterBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      filterBox.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      var k = b.getAttribute('data-kind');
      document.querySelectorAll('[data-shop] > li').forEach(function (li) {
        li.hidden = !!k && li.getAttribute('data-kind') !== k;
      });
    });
  }

  /* ---------- Tutoriales (YouTube solo al pulsar) ---------- */
  function thumb(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; }
  function play(box, id, title) {
    box.classList.add('is-playing');
    box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }
  function videoFace(t) {
    return '<img src="' + thumb(t.id) + '" alt="" loading="lazy">' +
      '<button class="video__play" type="button" aria-label="Ver el vídeo: ' + esc(t.titulo) + '"><span class="video__play-dot">' + icon('play') + '</span></button>';
  }
  document.querySelectorAll('[data-tutorials]').forEach(function (el) {
    var list = D.tutoriales || [];
    if (!list.length) return;
    var stage = el.querySelector('.video');
    var ul = el.querySelector('.video-list');
    var cap = el.querySelector('.video-caption');
    var current = list[0];
    function setStage(t) {
      current = t;
      stage.classList.remove('is-playing');
      stage.innerHTML = videoFace(t);
      if (cap) cap.textContent = t.titulo;
      stage.querySelector('.video__play').addEventListener('click', function () { play(stage, t.id, t.titulo); });
    }
    setStage(current);
    ul.innerHTML = list.slice(1, 6).map(function (t, i) {
      return '<li><button type="button" aria-pressed="false" data-i="' + (i + 1) + '"><img src="' + thumb(t.id) + '" alt="" loading="lazy"><span>' + esc(t.titulo) + '</span></button></li>';
    }).join('');
    ul.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      ul.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var t = list[+b.getAttribute('data-i')];
      setStage(t);
      play(stage, t.id, t.titulo);
      stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
  document.querySelectorAll('[data-video-grid]').forEach(function (el) {
    el.innerHTML = (D.tutoriales || []).map(function (t) {
      return '<li data-reveal><div class="video" data-id="' + esc(t.id) + '">' + videoFace(t) + '</div><h3>' + esc(t.titulo) + '</h3></li>';
    }).join('');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.video__play');
      if (!b) return;
      var box = b.closest('.video');
      var li = box.closest('li');
      play(box, box.getAttribute('data-id'), li.querySelector('h3').textContent);
    });
  });

  /* ---------- WhatsApp flotante: se aparta si ya hay otro botón de WhatsApp a la vista ---------- */
  var waFloat = document.querySelector('.wa-float');
  if (waFloat && 'IntersectionObserver' in window) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      waFloat.classList.toggle('is-hidden', visible.size > 0);
    });
    document.querySelectorAll('main a[href*="wa.me"]').forEach(function (a) { io.observe(a); });
  }

  /* ---------- Cifras ---------- */
  var fmtNum = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
  function statText(it, n) {
    var scale = it.escala || 1, dec = it.decimales || 0;
    var v = n / scale;
    return new Intl.NumberFormat('es-ES', { useGrouping: 'always', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v) + (it.sufijo || '');
  }
  var statsEl = document.querySelector('[data-stats]');
  var cifras = D.cifras;
  if (statsEl && cifras && cifras.items) {
    statsEl.innerHTML = cifras.items.map(function (it, i) {
      var ext = /^https?:/.test(it.url) ? ' target="_blank" rel="noopener"' : '';
      var logos = it.logos.map(function (src) {
        return '<img src="' + esc(src) + '" alt="" height="48" loading="lazy" />';
      }).join('');
      var texto = '';
      return '<li data-reveal><a class="stat" href="' + esc(it.url) + '"' + ext + ' aria-label="' + esc(it.nombre) + ': ' + statText(it, it.valor) + ' ' + esc(it.etiqueta) + '">' +
        '<span class="stat__logo" aria-hidden="true">' + logos + texto + '</span>' +
        '<span class="stat__num" data-count="' + it.valor + '" data-i="' + i + '">' + statText(it, it.valor) + '</span>' +
        '<span class="stat__label">' + esc(it.etiqueta) + '</span></a></li>';
    }).join('');
    var total = cifras.items.reduce(function (s, it) { return s + (it.suma ? it.valor : 0); }, 0);
    var rounded = Math.floor(total / 100) * 100;
    var totalEl = document.querySelector('[data-stats-total]');
    if (totalEl) { totalEl.setAttribute('data-count', rounded); totalEl.setAttribute('data-final', fmtNum.format(rounded)); totalEl.textContent = fmtNum.format(rounded); }
  }

  /* ---------- Movimiento ---------- */
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduce) {
    root.classList.remove('js-motion');
    return;
  }
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  // Firma: el título se revela, la foto cae y los hilos se tiran de lado a lado.
  var titleLines = gsap.utils.toArray('.hero__title .line');
  var threads = gsap.utils.toArray('.hero__threads path');
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (titleLines.length) {
    gsap.set(titleLines, { clipPath: 'inset(0 0 100% 0)' });
    tl.to(titleLines, { clipPath: 'inset(0 0 0% 0)', duration: 1, stagger: .12 }, 0);
    tl.from(titleLines, { yPercent: 40, duration: 1, stagger: .12 }, 0);
  }
  tl.fromTo('.hero__text, .hero__ctas, .channel', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .1, clearProps: 'transform,opacity' }, .45);
  tl.fromTo('.hero__photo', { y: -70, rotation: -6, opacity: 0 }, { y: 0, rotation: 3, opacity: 1, duration: 1.3, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }, .2);
  if (threads.length) {
    tl.fromTo(threads, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: .1, ease: 'power3.out' }, .3);
  }
  root.classList.remove('js-motion');

  if (!window.ScrollTrigger) return;
  var ST = window.ScrollTrigger;

  gsap.utils.toArray('.section-head__skein, .page-hero__skein').forEach(function (sk) {
    gsap.from(sk, {
      yPercent: -60, opacity: 0, duration: 1.1, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: sk, start: 'top 88%', once: true }
    });
  });

  gsap.set('[data-reveal]', { y: 26, opacity: 0 });
  ST.batch('[data-reveal]', {
    start: 'top 92%',
    once: true,
    onEnter: function (els) { gsap.to(els, { y: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .07, overwrite: true }); }
  });

  var tag = document.querySelector('.price-tag');
  if (tag) {
    gsap.from(tag, {
      rotation: -14, y: -30, opacity: 0, duration: 1.3, ease: 'elastic.out(1, .55)',
      scrollTrigger: { trigger: tag, start: 'top 85%', once: true }
    });
  }

  var inset = document.querySelector('.story__inset');
  if (inset) {
    gsap.from(inset, {
      rotation: 9, y: 40, opacity: 0, duration: 1.2, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: inset, start: 'top 90%', once: true }
    });
  }

  // Hilo cosido: cada sección empieza con una costura que se dibuja al bajar.
  gsap.utils.toArray('.stitch').forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(-8px 100% -8px 0)' }, {
      clipPath: 'inset(-8px 0% -8px 0)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: true }
    });
  });

  // Cifras: cuentan desde cero cuando llegan a la pantalla.
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = +el.getAttribute('data-count');
    var item = cifras && cifras.items ? cifras.items[+el.getAttribute('data-i')] : null;
    var obj = { v: 0 };
    el.textContent = item ? statText(item, 0) : fmtNum.format(0);
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { var n = Math.round(obj.v); el.textContent = item ? statText(item, n) : fmtNum.format(n); }
    });
  });

  window.addEventListener('load', function () { ST.refresh(); });
})();
