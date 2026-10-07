// Panel "Inspiraciones" del admin: Cristina añade, quita y ordena sus creaciones para que las alumnas cojan ideas.
// Sin precios: solo foto, nombre y una frase. Usa la tabla productos y el almacén "tienda" de supabase/tienda.sql
// (se llaman así porque antes era una tienda; las columnas tipo y precio ya no se usan).
(function () {
  var BUCKET = 'tienda';
  var S = { items: [], loaded: false, view: 'lista', editing: null, file: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function img(u) { return !u ? '' : (/^https?:/.test(u) ? u : '../' + u); }
  function safeName(n) { return n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(-60); }
  function toast(msg, err) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:3000;padding:12px 20px;border-radius:999px;font-weight:700;color:#fff;max-width:calc(100% - 32px);background:' + (err ? '#A81C23' : '#18241A');
    t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }

  async function load() {
    var box = $('tdBody');
    if (!S.loaded) box.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
    var r = await supabase.from('productos').select('*').order('orden', { ascending: true }).order('created_at', { ascending: true });
    if (r.error) {
      box.innerHTML = '<div class="alert alert--error visible">No se han podido cargar las inspiraciones: ' + esc(r.error.message) + '<br>¿Has ejecutado el archivo supabase/tienda.sql en Supabase?</div>';
      return;
    }
    S.items = r.data || []; S.loaded = true; render();
  }

  function row(p) {
    return '<li data-item data-id="' + esc(p.id) + '" class="td-row' + (p.visible ? '' : ' is-hidden') + '">' +
      '<button type="button" class="grip" aria-label="Mover. Arrástralo, o usa las flechas arriba y abajo del teclado" title="Arrastra para mover">' + window.GRIP_SVG + '</button>' +
      '<div class="td-thumb">' + (p.imagen_url ? '<img src="' + esc(img(p.imagen_url)) + '" alt="">' : '<span>Sin foto</span>') + '</div>' +
      '<div class="td-main"><strong>' + esc(p.nombre) + '</strong>' +
      (p.visible ? '' : '<span class="td-meta"><b class="td-off">Oculto</b></span>') +
      (p.descripcion ? '<span class="td-desc">' + esc(p.descripcion) + '</span>' : '') + '</div>' +
      '<div class="td-act"><button type="button" class="ib" data-a="edit">Editar</button><button type="button" class="ib" data-a="vis">' + (p.visible ? 'Ocultar' : 'Mostrar') + '</button><button type="button" class="ib ib--danger" data-a="del">Borrar</button></div></li>';
  }

  function render() {
    var box = $('tdBody');
    var tabs = '<div class="td-tabs" role="tablist"><button type="button" role="tab" class="td-tab' + (S.view === 'lista' ? ' active' : '') + '" data-v="lista">Creaciones</button>' +
      '<button type="button" role="tab" class="td-tab' + (S.view === 'publico' ? ' active' : '') + '" data-v="publico">Ver como público</button></div>';
    if (S.view === 'publico') {
      box.innerHTML = tabs + '<p class="pg-muted" style="margin-bottom:10px">Así ven Inspiraciones los visitantes de la web ahora mismo. Las creaciones ocultas no aparecen.</p>' +
        '<p style="margin-bottom:12px"><button type="button" class="btn btn-sm btn--outline" id="tdReloadPub">Recargar</button> <a class="btn btn-sm btn--outline" href="../inspiraciones.html" target="_blank" rel="noopener">Abrir en otra pestaña</a></p>' +
        '<iframe id="tdFrame" class="td-frame" src="../inspiraciones.html" title="Vista pública de Inspiraciones"></iframe>';
      return;
    }
    var body;
    if (!S.items.length) {
      body = '<div class="td-empty"><p><strong>Las inspiraciones todavía no se gestionan desde aquí.</strong> Ahora mismo la web enseña las creaciones de siempre.</p>' +
        '<p>Pulsa el botón para traerlas aquí y poder cambiarles la foto, el texto y el orden, o añadir otras nuevas.</p>' +
        '<button type="button" class="btn btn--primary" id="tdImport">Traer las creaciones actuales de la web</button></div>';
    } else {
      body = '<p class="pg-muted" style="margin-bottom:12px">Arrastra cada creación por el asa de la izquierda para cambiar el orden en que salen en la web. Lo que guardas aquí se publica al momento.</p>' +
        '<ul class="td-list" data-sort="productos">' + S.items.map(row).join('') + '</ul>';
    }
    box.innerHTML = tabs + '<div class="pg-row" style="margin:0 0 16px"><button type="button" class="btn btn--primary" id="tdAdd">+ Añadir creación</button></div>' + body;
  }

  function dlg() {
    var d = $('tdDlg'); if (d) return d;
    d = document.createElement('dialog'); d.id = 'tdDlg'; d.className = 'ficha-dlg';
    d.innerHTML = '<form id="tdForm"><h3 id="tdTitle">Creación</h3>' +
      '<div class="alert alert--error" id="tdErr" role="alert"></div>' +
      '<div class="pg-grid"><label class="pg-wide">Nombre<input name="nombre" required maxlength="120" placeholder="Ej: Bastidor de nacimiento"></label>' +
      '<label class="pg-wide">Una frase (opcional)<textarea name="descripcion" rows="2" maxlength="300" placeholder="Ej: Con el nombre, la fecha y el peso del bebé."></textarea></label>' +
      '<div class="pg-wide"><span style="font-weight:700;font-size:.9375rem">Foto</span><div class="td-photo"><div class="td-thumb td-thumb--big" id="tdPrev"><span>Sin foto</span></div>' +
      '<div><label class="btn btn--outline" for="tdFile" style="cursor:pointer">Elegir foto</label><input type="file" id="tdFile" accept="image/*" hidden><p class="pg-muted">Mejor cuadrada (por ejemplo 1000 × 1000) y de menos de 5 MB.</p></div></div></div>' +
      '<label class="pg-check pg-wide"><input type="checkbox" name="visible" checked> Mostrar esta creación en la web</label></div>' +
      '<div class="pg-row"><button type="submit" class="btn btn--primary" id="tdSave">Guardar</button><button type="button" class="btn btn--outline" id="tdCancel">Cancelar</button></div></form>';
    document.body.appendChild(d);
    $('tdCancel').addEventListener('click', function () { d.close(); });
    $('tdFile').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      if (!f.type.startsWith('image/')) { toast('Elige una imagen.', true); return; }
      if (f.size > 5 * 1024 * 1024) { toast('La foto pesa más de 5 MB.', true); return; }
      S.file = f; $('tdPrev').innerHTML = '<img src="' + URL.createObjectURL(f) + '" alt="">';
    });
    $('tdForm').addEventListener('submit', save);
    return d;
  }

  function open(id) {
    var d = dlg(), fm = $('tdForm'), p = id ? S.items.find(function (x) { return x.id === id; }) : null;
    S.editing = p; S.file = null; $('tdFile').value = '';
    $('tdTitle').textContent = p ? 'Editar creación' : 'Añadir creación';
    fm.nombre.value = p ? p.nombre : ''; fm.descripcion.value = p ? (p.descripcion || '') : '';
    fm.visible.checked = p ? p.visible : true;
    $('tdPrev').innerHTML = p && p.imagen_url ? '<img src="' + esc(img(p.imagen_url)) + '" alt="">' : '<span>Sin foto</span>';
    $('tdErr').classList.remove('visible'); $('tdSave').disabled = false; $('tdSave').textContent = 'Guardar';
    d.showModal(); fm.nombre.focus();
  }

  async function save(e) {
    e.preventDefault();
    var fm = e.target, btn = $('tdSave');
    var rec = { nombre: fm.nombre.value.trim(), descripcion: fm.descripcion.value.trim() || null, visible: fm.visible.checked };
    if (!rec.nombre) return;
    btn.disabled = true; btn.textContent = S.file ? 'Subiendo foto...' : 'Guardando...';
    try {
      var oldUrl = S.editing ? S.editing.imagen_url : null;
      if (S.file) {
        var path = crypto.randomUUID() + '-' + safeName(S.file.name);
        var up = await supabase.storage.from(BUCKET).upload(path, S.file, { contentType: S.file.type });
        if (up.error) throw up.error;
        rec.imagen_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      var r;
      if (S.editing) {
        r = await supabase.from('productos').update(rec).eq('id', S.editing.id).select().single();
        if (r.error) throw r.error;
        S.items[S.items.findIndex(function (x) { return x.id === S.editing.id; })] = r.data;
        if (S.file && oldUrl && oldUrl.indexOf('/' + BUCKET + '/') >= 0) await supabase.storage.from(BUCKET).remove([decodeURIComponent(oldUrl.split('/' + BUCKET + '/')[1].split('?')[0])]);
      } else {
        rec.orden = S.items.length ? Math.max.apply(null, S.items.map(function (x) { return x.orden; })) + 1 : 1;
        r = await supabase.from('productos').insert(rec).select().single();
        if (r.error) throw r.error;
        S.items.push(r.data);
      }
      $('tdDlg').close(); render(); toast('Guardado. Ya se ve en la web.');
    } catch (err) {
      $('tdErr').textContent = 'No se ha podido guardar: ' + (err.message || err); $('tdErr').classList.add('visible');
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  }

  async function saveOrder() {
    var ids = Array.prototype.map.call(document.querySelectorAll('#tdBody .td-list > li[data-item]'), function (l) { return l.dataset.id; });
    var changed = [];
    ids.forEach(function (id, i) { var p = S.items.find(function (x) { return x.id === id; }); if (p && p.orden !== i + 1) { p.orden = i + 1; changed.push(p); } });
    S.items.sort(function (a, b) { return a.orden - b.orden; });
    var res = await Promise.all(changed.map(function (p) { return supabase.from('productos').update({ orden: p.orden }).eq('id', p.id); }));
    if (res.some(function (r) { return r.error; })) toast('No se ha podido guardar el orden. Recarga la página.', true);
    else if (changed.length) toast('Orden guardado.');
  }

  async function importCurrent() {
    var cur = (window.MARIETA && window.MARIETA.inspiraciones) || [];
    if (!cur.length) { toast('No hay creaciones que traer.', true); return; }
    var rows = cur.map(function (p, i) { return { nombre: p.nombre, descripcion: p.descripcion || null, imagen_url: p.imagen, orden: i + 1, visible: true }; });
    var r = await supabase.from('productos').insert(rows);
    if (r.error) { toast('Error: ' + r.error.message, true); return; }
    await load(); toast('Creaciones traídas. Ya puedes editarlas.');
  }

  document.addEventListener('click', async function (e) {
    var root = $('tdBody'); if (!root || !root.contains(e.target)) return;
    var t = e.target.closest('.td-tab');
    if (t) { S.view = t.dataset.v; render(); if (S.view === 'lista') initSort(); return; }
    if (e.target.id === 'tdAdd') return open(null);
    if (e.target.id === 'tdImport') return importCurrent();
    if (e.target.id === 'tdReloadPub') { var f = $('tdFrame'); if (f) f.src = f.src; return; }
    var b = e.target.closest('[data-a]'); if (!b) return;
    var li = b.closest('[data-id]'), p = S.items.find(function (x) { return x.id === li.dataset.id; });
    if (b.dataset.a === 'edit') open(p.id);
    else if (b.dataset.a === 'vis') {
      var r = await supabase.from('productos').update({ visible: !p.visible }).eq('id', p.id);
      if (r.error) return toast('Error: ' + r.error.message, true);
      p.visible = !p.visible; render(); toast(p.visible ? 'Ahora se ve en la web.' : 'Oculto: ya no se ve en la web.');
    } else if (b.dataset.a === 'del') {
      if (!confirm('¿Borrar "' + p.nombre + '" de Inspiraciones? No se puede deshacer.')) return;
      var d = await supabase.from('productos').delete().eq('id', p.id);
      if (d.error) return toast('Error: ' + d.error.message, true);
      if (p.imagen_url && p.imagen_url.indexOf('/' + BUCKET + '/') >= 0) await supabase.storage.from(BUCKET).remove([decodeURIComponent(p.imagen_url.split('/' + BUCKET + '/')[1].split('?')[0])]);
      S.items = S.items.filter(function (x) { return x.id !== p.id; }); await saveOrder(); render();
    }
  });

  var sortReady = false;
  function initSort() {
    if (sortReady || !window.makeSortable) return;
    makeSortable($('tdBody'), { onEnd: saveOrder }); sortReady = true;
  }

  window.loadTienda = async function () {
    if ($('tdBody')) { initSort(); await load(); }
  };
})();
