// Ordenar arrastrando (ratón y dedo), sin librerías. También funciona con el teclado (flechas ↑ ↓ sobre el asa).
//
// Uso:  makeSortable(rootEl, { onEnd: function () { ...guardar el nuevo orden... } })
//  - Los contenedores son elementos con data-sort="tipo" (p. ej. <ul data-sort="bloques">).
//  - Cada elemento es un <li data-item> con un botón .grip dentro (el asa para agarrarlo).
//  - Un elemento solo se puede soltar en contenedores con el MISMO data-sort (así los bloques pasan de una
//    sección a otra, pero una sección no se mete dentro de otra).
(function () {
  var css = document.createElement('style');
  css.textContent =
    '.grip{flex:none;display:inline-grid;place-items:center;width:44px;min-height:44px;padding:0;border:0;border-radius:10px;background:transparent;color:inherit;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none}' +
    '.grip:hover{background:rgba(24,36,26,.09)}.grip:focus-visible{outline:3px solid #3C61A8;outline-offset:2px}' +
    '.grip svg{width:22px;height:22px;opacity:.7;pointer-events:none}' +
    '.sort-ph{list-style:none;border:2px dashed #1F6B33;border-radius:12px;background:rgba(31,107,51,.08);box-sizing:border-box}' +
    'li.is-dragging{box-shadow:0 24px 50px -12px rgba(0,0,0,.45)!important;transform:rotate(.8deg);opacity:.96;cursor:grabbing;list-style:none}' +
    '.is-sorting [data-sort]{min-height:20px}' +
    '.is-sorting{cursor:grabbing;-webkit-user-select:none;user-select:none}';
  document.head.appendChild(css);

  window.GRIP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/><circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/><circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/></svg>';

  window.makeSortable = function (root, opts) {
    opts = opts || {};
    var handleSel = opts.handle || '.grip';
    var drag = null, last = { x: 0, y: 0 }, timer = null;

    function containers(kind) { return Array.prototype.slice.call(root.querySelectorAll('[data-sort="' + kind + '"]')); }
    function kids(c, except) { return Array.prototype.filter.call(c.children, function (k) { return k !== except && k.matches('li[data-item]') && !k.classList.contains('sort-ph'); }); }
    function end() { if (opts.onEnd) opts.onEnd(); }

    function place(x, y) {
      var best = null, bestD = 1e9;
      containers(drag.kind).forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 14 && y <= r.bottom + 14) {
          var d = Math.abs(y - (r.top + r.height / 2));
          if (d < bestD) { bestD = d; best = c; }
        }
      });
      if (!best) return;
      var before = null, ks = kids(best, drag.item);
      for (var i = 0; i < ks.length; i++) {
        var r2 = ks[i].getBoundingClientRect();
        if (y < r2.top + r2.height / 2) { before = ks[i]; break; }
      }
      if (before) { if (drag.ph.nextElementSibling !== before || drag.ph.parentElement !== best) best.insertBefore(drag.ph, before); }
      else if (best.lastElementChild !== drag.ph) best.appendChild(drag.ph);
    }

    function tick() {
      if (!drag) return;
      if (last.y < 80) window.scrollBy(0, -16);
      else if (last.y > window.innerHeight - 80) window.scrollBy(0, 16);
      place(last.x, last.y);
    }

    function onDown(e) {
      var h = e.target.closest && e.target.closest(handleSel);
      if (!h || !root.contains(h) || (e.button !== undefined && e.button > 0)) return;
      var item = h.closest('li[data-item]');
      if (!item) return;
      e.preventDefault();
      var r = item.getBoundingClientRect();
      var ph = document.createElement('li');
      ph.className = 'sort-ph'; ph.style.height = r.height + 'px';
      item.parentElement.insertBefore(ph, item);
      drag = { item: item, ph: ph, kind: item.parentElement.getAttribute('data-sort'), dx: e.clientX - r.left, dy: e.clientY - r.top, handle: h };
      item.classList.add('is-dragging');
      item.style.cssText += ';position:fixed;z-index:2000;pointer-events:none;margin:0;width:' + r.width + 'px;left:' + r.left + 'px;top:' + r.top + 'px';
      root.classList.add('is-sorting');
      last = { x: e.clientX, y: e.clientY };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
      timer = setInterval(tick, 40);
    }
    function onMove(e) {
      if (!drag) return;
      e.preventDefault();
      last = { x: e.clientX, y: e.clientY };
      drag.item.style.left = (e.clientX - drag.dx) + 'px';
      drag.item.style.top = (e.clientY - drag.dy) + 'px';
      place(e.clientX, e.clientY);
    }
    function onUp() {
      if (!drag) return;
      clearInterval(timer);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      var d = drag; drag = null;
      d.item.classList.remove('is-dragging');
      d.item.style.position = ''; d.item.style.zIndex = ''; d.item.style.pointerEvents = ''; d.item.style.margin = '';
      d.item.style.width = ''; d.item.style.left = ''; d.item.style.top = '';
      d.ph.parentElement.insertBefore(d.item, d.ph);
      d.ph.remove();
      root.classList.remove('is-sorting');
      d.handle.focus({ preventScroll: true });
      end();
    }

    // Teclado: con el asa enfocada, flechas arriba/abajo
    function onKey(e) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      var h = e.target.closest && e.target.closest(handleSel);
      if (!h) return;
      var item = h.closest('li[data-item]'); if (!item) return;
      e.preventDefault();
      var up = e.key === 'ArrowUp', c = item.parentElement;
      var sib = up ? item.previousElementSibling : item.nextElementSibling;
      while (sib && !sib.matches('li[data-item]')) sib = up ? sib.previousElementSibling : sib.nextElementSibling;
      if (sib) { if (up) c.insertBefore(item, sib); else c.insertBefore(item, sib.nextElementSibling); }
      else {
        var cs = containers(c.getAttribute('data-sort')), i = cs.indexOf(c), n = cs[i + (up ? -1 : 1)];
        if (!n) return;
        if (up) n.appendChild(item); else n.insertBefore(item, n.firstElementChild);
      }
      h.focus(); end();
    }

    root.addEventListener('pointerdown', onDown);
    root.addEventListener('keydown', onKey);
  };
})();
