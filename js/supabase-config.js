const SUPABASE_URL      = 'https://iktdggvtvbvkmprjfmcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IhvUuyPNSxm5Wl_-VwRt4A_ZEB9x5WR';

// ---------------------------------------------------------------
// "Recordar este dispositivo"
//
// Si la alumna lo marca, la sesión se guarda en localStorage y sigue
// ahí aunque cierre el navegador o apague el móvil.
// Si NO lo marca, se guarda en sessionStorage: al cerrar el navegador
// desaparece. Es lo seguro en un ordenador compartido.
//
// La bandera no es ningún secreto: solo dice DÓNDE guardar la sesión.
// ---------------------------------------------------------------
const MVV_REMEMBER_KEY = 'mvv.recordar-dispositivo';

window.mvvRecordarDispositivo = function (valor) {
  try { window.localStorage.setItem(MVV_REMEMBER_KEY, valor ? '1' : '0'); }
  catch (e) { /* navegación privada: no se puede guardar la preferencia */ }
};

// Por defecto SÍ se recuerda. Solo se deja de recordar si la alumna
// ha desmarcado la casilla a propósito (guardamos un '0').
// Esto importa: si no, al abrir una pestaña nueva (por ejemplo
// "Ver como alumna") la sesión no estaría y pediría entrar otra vez.
window.mvvRecuerdaDispositivo = function () {
  try { return window.localStorage.getItem(MVV_REMEMBER_KEY) !== '0'; }
  catch (e) { return true; }
};

// Almacén propio: elige localStorage o sessionStorage en cada escritura
// y nunca deja la sesión duplicada en los dos sitios.
const mvvAuthStorage = {
  getItem: function (k) {
    try {
      const v = window.localStorage.getItem(k);
      if (v !== null) return v;
    } catch (e) { /* ignorar */ }
    try { return window.sessionStorage.getItem(k); } catch (e) { return null; }
  },
  setItem: function (k, v) {
    const recordar = window.mvvRecuerdaDispositivo();
    try {
      if (recordar) { window.localStorage.setItem(k, v); }
      else          { window.sessionStorage.setItem(k, v); }
    } catch (e) { /* ignorar */ }
    // Limpiar el otro sitio para que no queden dos sesiones sueltas
    try { (recordar ? window.sessionStorage : window.localStorage).removeItem(k); } catch (e) { /* ignorar */ }
  },
  removeItem: function (k) {
    try { window.localStorage.removeItem(k); } catch (e) { /* ignorar */ }
    try { window.sessionStorage.removeItem(k); } catch (e) { /* ignorar */ }
  }
};

// Guardar referencia a createClient antes de sobreescribir window.supabase
window.supabaseFactory = window.supabase.createClient.bind(window.supabase);
window.supabase        = window.supabaseFactory(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: mvvAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
