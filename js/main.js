// Menú móvil
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Cerrar menú al hacer clic en un enlace
mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// Formulario de contacto (simulación — sin backend todavía)
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  contactForm.style.display = 'none';
  formSuccess.style.display = 'block';
});
