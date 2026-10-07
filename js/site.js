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

  /* ---------- Inspiraciones (creaciones de Cristina, sin precios) ---------- */
  function inspoCard(p) {
    return '<li><figure class="inspo__item">' +
      '<div class="inspo__img"><img src="' + esc(p.imagen) + '" alt="' + esc(p.nombre) + '" loading="lazy" width="640" height="640"></div>' +
      '<figcaption><strong>' + esc(p.nombre) + '</strong>' + (p.descripcion ? '<span>' + esc(p.descripcion) + '</span>' : '') + '</figcaption>' +
      '</figure></li>';
  }
  // Creaciones desde Supabase (las gestiona Cristina en el panel). Si no hay o falla, se usan las de data.js.
  function loadInspiraciones() {
    var cfg = D.supabase, fallback = D.inspiraciones || [];
    if (!cfg || !window.fetch) return Promise.resolve(fallback);
    var ctl = window.AbortController ? new AbortController() : null;
    var to = ctl ? setTimeout(function () { ctl.abort(); }, 3500) : null;
    return fetch(cfg.url + '/rest/v1/productos?select=nombre,descripcion,imagen_url&visible=eq.true&order=orden.asc,created_at.asc', {
      headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key }, signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (to) clearTimeout(to);
        if (!Array.isArray(rows) || !rows.length) return fallback;
        return rows.map(function (p) { return { nombre: p.nombre, descripcion: p.descripcion || '', imagen: p.imagen_url || '' }; });
      })
      .catch(function () { return fallback; });
  }
  var inspoEls = document.querySelectorAll('[data-inspo]');
  if (inspoEls.length) {
    loadInspiraciones().then(function (list) {
      inspoEls.forEach(function (el) {
        var limit = parseInt(el.getAttribute('data-limit') || '99', 10);
        el.innerHTML = list.slice(0, limit).map(inspoCard).join('');
        // Las fotos llegan después de cargar la página: se revelan al llegar a la pantalla, como el resto.
        if (motionOn) {
          var g = window.gsap, kids = Array.prototype.slice.call(el.children);
          g.set(kids, { y: 24, opacity: 0 });
          window.ScrollTrigger.batch(kids, { start: 'top 92%', once: true, onEnter: function (els) { g.to(els, { y: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .07, clearProps: 'transform,opacity' }); } });
        }
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
  var totalEl = document.querySelector('[data-stats-total]');
  var cifras = D.cifras;
  var motionOn = false;
  function statsTotal() {
    var total = cifras.items.reduce(function (s, it) { return s + (it.suma ? it.valor : 0); }, 0);
    return Math.floor(total / 100) * 100;
  }
  function countText(el, n) {
    var item = el.hasAttribute('data-i') ? cifras.items[+el.getAttribute('data-i')] : null;
    return item ? statText(item, n) : fmtNum.format(n);
  }
  // Cuenta desde lo que se ve ahora hasta data-count (la primera vez, desde 0).
  function countUp(el, duration) {
    var obj = { v: +el.getAttribute('data-shown') || 0 };
    var to = +el.getAttribute('data-count');
    el.setAttribute('data-counted', '');
    if (el._tween) el._tween.kill();
    el._tween = window.gsap.to(obj, {
      v: to, duration: duration || 1.8, ease: 'power3.out',
      onUpdate: function () { var n = Math.round(obj.v); el.setAttribute('data-shown', n); el.textContent = countText(el, n); }
    });
  }
  function setCount(el, n) {
    el.setAttribute('data-count', n);
    if (!motionOn) { el.textContent = countText(el, n); return; }
    if (el.hasAttribute('data-counted')) countUp(el, 1.2); // si aún no ha llegado a la pantalla, contará al llegar
  }
  if (statsEl && cifras && cifras.items) {
    statsEl.innerHTML = cifras.items.map(function (it, i) {
      var ext = /^https?:/.test(it.url) ? ' target="_blank" rel="noopener"' : '';
      var logos = it.logos.map(function (src) {
        return '<img src="' + esc(src) + '" alt="" height="48" loading="lazy" />';
      }).join('');
      return '<li data-reveal><a class="stat" href="' + esc(it.url) + '"' + ext + ' aria-label="' + esc(it.nombre) + ': ' + statText(it, it.valor) + ' ' + esc(it.etiqueta) + '">' +
        '<span class="stat__logo" aria-hidden="true">' + logos + '</span>' +
        '<span class="stat__num" data-count="' + it.valor + '" data-i="' + i + '">' + statText(it, it.valor) + '</span>' +
        '<span class="stat__label">' + esc(it.etiqueta) + '</span></a></li>';
    }).join('');
    var rounded = statsTotal();
    if (totalEl) { totalEl.setAttribute('data-count', rounded); totalEl.setAttribute('data-final', fmtNum.format(rounded)); totalEl.textContent = fmtNum.format(rounded); }
    loadCifras();
  }
  // Cifras al día desde Supabase (las cambia Cristina en el panel). Si falla, se quedan las de data.js.
  function loadCifras() {
    var cfg = D.supabase;
    if (!cfg || !window.fetch) return;
    fetch(cfg.url + '/rest/v1/cifras?select=clave,valor', { headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        var byKey = {};
        rows.forEach(function (r) { byKey[r.clave] = +r.valor; });
        cifras.items.forEach(function (it, i) {
          if (!(it.clave in byKey) || byKey[it.clave] === it.valor) return;
          it.valor = byKey[it.clave];
          var el = statsEl.querySelector('[data-i="' + i + '"]');
          if (!el) return;
          el.closest('.stat').setAttribute('aria-label', it.nombre + ': ' + statText(it, it.valor) + ' ' + it.etiqueta);
          setCount(el, it.valor);
        });
        if (totalEl) {
          var t = statsTotal();
          totalEl.setAttribute('data-final', fmtNum.format(t));
          setCount(totalEl, t);
        }
      })
      .catch(function () {});
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

  // Firma: el título se revela, la foto cae sobre la mesa y las madejas se colocan una a una en la carta.
  var titleLines = gsap.utils.toArray('.hero__title .line');
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (titleLines.length) {
    gsap.set(titleLines, { clipPath: 'inset(0 0 100% 0)' });
    tl.to(titleLines, { clipPath: 'inset(0 0 0% 0)', duration: 1, stagger: .12 }, 0);
    tl.from(titleLines, { yPercent: 40, duration: 1, stagger: .12 }, 0);
  }
  tl.fromTo('.hero__text, .hero__ctas', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .1, clearProps: 'transform,opacity' }, .4);
  tl.fromTo('.hero__photo', { y: -60, rotation: -9, opacity: 0 }, { y: 0, rotation: -2, opacity: 1, duration: 1.2, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }, .2);
  tl.fromTo('.skeins li', { x: 48, rotation: 10, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: .9, stagger: .08, ease: 'back.out(1.6)', clearProps: 'transform,opacity' }, .55);
  root.classList.remove('js-motion');

  if (!window.ScrollTrigger) return;
  var ST = window.ScrollTrigger;

  gsap.utils.toArray('.section-head__skein, .page-hero__skein').forEach(function (sk) {
    // La madeja llega rodando desde la izquierda, como si la dejaran sobre la mesa.
    gsap.from(sk, {
      x: -60, rotation: -14, opacity: 0, duration: 1.1, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: sk, start: 'top 88%', once: true }
    });
  });

  gsap.set('[data-reveal]', { y: 26, opacity: 0 });
  ST.batch('[data-reveal]', {
    start: 'top 92%',
    once: true,
    onEnter: function (els) { gsap.to(els, { y: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .07, overwrite: true }); }
  });

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

  // Cifras: cuentan desde cero cuando llegan a la pantalla (con el número que haya en ese momento).
  motionOn = true;
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    el.textContent = countText(el, 0);
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { countUp(el); } });
  });

  window.addEventListener('load', function () { ST.refresh(); });
})();
