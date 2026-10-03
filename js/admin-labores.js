// Panel "Labores" del admin: las fotos que las alumnas envían al terminar un curso.
(function () {
  var loaded = false;
  var items = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function fecha(iso) { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); }

  async function load() {
    var box = $('labBody');
    box.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
    try {
      var r = await Promise.all([
        supabase.from('labores').select('id, user_id, curso_id, foto_path, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('id, nombre'),
        supabase.from('cursos').select('id, nombre')
      ]);
      if (r[0].error) throw r[0].error;
      var nombres = {}; (r[1].data || []).forEach(function (p) { nombres[p.id] = p.nombre; });
      var cursos = {}; (r[2].data || []).forEach(function (c) { cursos[c.id] = c.nombre; });
      var rows = r[0].data || [];
      var paths = rows.map(function (x) { return x.foto_path; });
      var urls = {}, dls = {};
      if (paths.length) {
        var s1 = await supabase.storage.from('labores').createSignedUrls(paths, 3600);
        (s1.data || []).forEach(function (u) { if (u.path) urls[u.path] = u.signedUrl; });
        var s2 = await supabase.storage.from('labores').createSignedUrls(paths, 3600, { download: true });
        (s2.data || []).forEach(function (u) { if (u.path) dls[u.path] = u.signedUrl; });
      }
      items = rows.map(function (x) {
        return { id: x.id, path: x.foto_path, url: urls[x.foto_path], dl: dls[x.foto_path] || urls[x.foto_path],
          alumna: nombres[x.user_id] || 'Alumna', curso: cursos[x.curso_id] || 'Curso', cursoId: x.curso_id, fecha: x.created_at };
      });
      loaded = true;
      render();
    } catch (err) {
      box.innerHTML = '<div class="alert alert--error visible">No se han podido cargar las fotos: ' + esc(err.message || err) +
        '<br>¿Has ejecutado el archivo supabase/labores.sql en Supabase?</div>';
    }
  }

  function render() {
    var box = $('labBody');
    if (!items.length) {
      box.innerHTML = '<p class="seg-empty">Todavía no ha llegado ninguna foto. Cuando una alumna termine un curso y te envíe su labor, aparecerá aquí.</p>';
      return;
    }
    var cursos = {}; items.forEach(function (i) { cursos[i.cursoId] = i.curso; });
    var sel = $('labCurso') ? $('labCurso').value : '';
    var opts = '<option value="">Todos los cursos</option>' + Object.keys(cursos).map(function (id) {
      return '<option value="' + esc(id) + '"' + (id === sel ? ' selected' : '') + '>' + esc(cursos[id]) + '</option>';
    }).join('');
    var list = items.filter(function (i) { return !sel || i.cursoId === sel; });
    box.innerHTML = '<div class="seg-filters"><select id="labCurso" aria-label="Filtrar por curso">' + opts + '</select>' +
      '<span class="seg-sub">' + list.length + (list.length === 1 ? ' foto' : ' fotos') + '</span></div>' +
      '<div class="lab-grid">' + list.map(function (i) {
        return '<article class="lab-card"><a class="lab-img" href="' + esc(i.url || '#') + '" target="_blank" rel="noopener">' +
          (i.url ? '<img src="' + esc(i.url) + '" alt="Labor de ' + esc(i.alumna) + '" loading="lazy">' : '') + '</a>' +
          '<div class="lab-body"><h3>' + esc(i.alumna) + '</h3><p>' + esc(i.curso) + '</p><small>' + fecha(i.fecha) + '</small>' +
          '<div class="lab-actions"><a class="btn btn-sm btn--outline" href="' + esc(i.dl || '#') + '" download>Descargar</a>' +
          '<button type="button" class="btn btn-sm btn-danger" data-lab-del="' + esc(i.id) + '">Borrar</button></div></div></article>';
      }).join('') + '</div>';
    $('labCurso').addEventListener('change', render);
  }

  document.addEventListener('click', async function (e) {
    var b = e.target.closest && e.target.closest('[data-lab-del]');
    if (b) {
      var it = items.find(function (i) { return i.id === b.dataset.labDel; });
      if (!it || !confirm('¿Borrar esta foto de ' + it.alumna + '? No se puede deshacer.')) return;
      await supabase.storage.from('labores').remove([it.path]);
      var r = await supabase.from('labores').delete().eq('id', it.id);
      if (r.error) { alert('Error: ' + r.error.message); return; }
      items = items.filter(function (i) { return i.id !== it.id; });
      render();
    } else if (e.target && e.target.id === 'labReload') {
      load();
    }
  });

  window.loadLabores = function () { if (!loaded) load(); };
})();
