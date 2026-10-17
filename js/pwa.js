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

  if (window.mvvEsApp()) document.documentElement.classList.add('is-app');
})();
