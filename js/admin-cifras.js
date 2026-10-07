// Panel "Cifras" del admin: Cristina cambia el número de seguidores de cada red y se publica al momento.
// Usa la tabla cifras de supabase/cifras.sql. Los nombres y logos salen de js/data.js.
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function toast(msg, err) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:3000;padding:12px 20px;border-radius:999px;font-weight:700;color:#fff;max-width:calc(100% - 32px);background:' + (err ? '#A81C23' : '#18241A');
    t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }
  var fmt = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
  var fmtDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  function items() { return ((window.MARIETA && window.MARIETA.cifras) || {}).items || []; }

  async function load() {
    var box = $('cfBody');
    box.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
    var r = await supabase.from('cifras').select('*');
    if (r.error) {
      box.innerHTML = '<div class="alert alert--error visible">No se han podido cargar las cifras: ' + esc(r.error.message) + '<br>¿Has ejecutado el archivo supabase/cifras.sql en Supabase?</div>';
      return;
    }
    var saved = {};
    (r.data || []).forEach(function (row) { saved[row.clave] = row; });
    box.innerHTML = '<form id="cfForm" class="cf-form">' + items().map(function (it) {
      var row = saved[it.clave];
      var val = row ? row.valor : it.valor;
      var when = row && row.updated_at ? 'Cambiado el ' + fmtDate.format(new Date(row.updated_at)) : 'Todavía sin cambiar desde aquí';
      return '<label class="cf-item"><span class="cf-name">' + esc(it.nombre) + '</span>' +
        '<span class="cf-label">' + esc(it.etiqueta) + '</span>' +
        '<input type="number" name="' + esc(it.clave) + '" min="0" step="1" inputmode="numeric" required value="' + esc(val) + '">' +
        '<small class="pg-muted">' + esc(when) + '</small></label>';
    }).join('') +
      '<div class="pg-row cf-actions"><button type="submit" class="btn btn--primary" id="cfSave">Guardar cifras</button>' +
      '<a class="btn btn--outline" href="../index.html" target="_blank" rel="noopener">Ver la web</a></div>' +
      '<p class="pg-muted" id="cfTotal"></p></form>';
    updateTotal();
    $('cfForm').addEventListener('input', updateTotal);
    $('cfForm').addEventListener('submit', save);
  }

  // El total de seguidores que sale en la web: suma de las redes, redondeado hacia abajo a centenas.
  function updateTotal() {
    var fm = $('cfForm'); if (!fm) return;
    var total = items().reduce(function (s, it) { return s + (it.suma ? (parseInt(fm[it.clave].value, 10) || 0) : 0); }, 0);
    $('cfTotal').textContent = 'En la web saldrá: «Más de ' + fmt.format(Math.floor(total / 100) * 100) + ' seguidores».';
  }

  async function save(e) {
    e.preventDefault();
    var fm = e.target, btn = $('cfSave');
    var now = new Date().toISOString();
    var rows = items().map(function (it) { return { clave: it.clave, valor: Math.max(0, parseInt(fm[it.clave].value, 10) || 0), updated_at: now }; });
    btn.disabled = true; btn.textContent = 'Guardando...';
    var r = await supabase.from('cifras').upsert(rows, { onConflict: 'clave' });
    btn.disabled = false; btn.textContent = 'Guardar cifras';
    if (r.error) { toast('No se ha podido guardar: ' + r.error.message, true); return; }
    toast('Cifras guardadas. Ya se ven en la web.');
    load();
  }

  window.loadCifras = load;
})();
