/* ================================================================
   Comunidad Marieta — instalación en el móvil
   Registra el service worker y recuerda si Android nos deja
   enseñar el botón de "Instalar".
   ================================================================ */
(function () {
  'use strict';

  // El service worker necesita HTTPS (o localhost para probar)
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {
      /* Si falla, la web sigue funcionando igual */
    });
  });

  // Android/Chrome avisa cuando se puede instalar de verdad
  window.mvvInstalador = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.mvvInstalador = e;
    window.dispatchEvent(new CustomEvent('mvv:instalable'));
  });

  window.addEventListener('appinstalled', function () {
    window.mvvInstalador = null;
    window.dispatchEvent(new CustomEvent('mvv:instalada'));
  });

  // ¿Se está viendo ya como aplicación?
  window.mvvEsApp = function () {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || window.navigator.standalone === true;
  };

  if (window.mvvEsApp()) {
    document.documentElement.classList.add('is-app');

    // Dentro de la app no se puede ampliar con los dedos, como en
    // cualquier otra aplicacion. En la web normal si se puede, que
    // hay quien lo necesita para leer.
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp) {
      vp.setAttribute('content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Safari en iPhone se salta lo anterior: hay que pararlo a mano
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
    });
  }
})();
