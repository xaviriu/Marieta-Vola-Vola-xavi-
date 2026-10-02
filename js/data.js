// Contenido editable de la web. Para añadir un taller, un producto o un vídeo,
// copia un bloque existente, cámbialo y guarda.

window.MARIETA = {
  contacto: {
    canalWhatsApp: 'https://www.whatsapp.com/channel/0029VbBE6U29hXF9e8IVsQ00',
    whatsapp: '34630050209',
    telefonoVisible: '630 05 02 09',
    email: 'cristina@marietavolavola.com',
    instagram: 'https://www.instagram.com/marieta.vola.vola.bordado/',
    youtube: 'https://www.youtube.com/@marieta.vola.vola.Bordado',
    facebook: 'https://www.facebook.com/Lady.Bug.CR/'
  },

  // Cifras reales. Actualiza el número y la fecha cuando quieras; el total se calcula solo.
  // suma: true => cuenta para el total de seguidores. Los números se muestran tal cual, con punto de miles.
  cifras: {
    fecha: 'octubre de 2026',
    items: [
      { logos: ['images/web/logos/facebook.svg'], nombre: 'Facebook', valor: 4927, etiqueta: 'seguidores en Facebook', url: 'https://www.facebook.com/Lady.Bug.CR/', color: '--t699', suma: true },
      { logos: ['images/web/logos/instagram-icono.svg', 'images/web/logos/instagram-texto.svg'], nombre: 'Instagram', valor: 4677, etiqueta: 'seguidores en Instagram', url: 'https://www.instagram.com/marieta.vola.vola.bordado/', color: '--t321', suma: true },
      { logos: ['images/web/logos/youtube.svg'], nombre: 'YouTube', valor: 1900, etiqueta: 'suscriptores en YouTube', url: 'https://www.youtube.com/@marieta.vola.vola.Bordado', color: '--t3328', suma: true },
      { logos: ['images/web/logos/comunidad-sello.webp'], nombre: 'Comunidad Marieta', valor: 95, etiqueta: 'miembros', url: 'comunidad.html', color: '--t368' }
    ]
  },

  comunidad: {
    precio: '20 €',
    periodo: 'al mes'
  },

  // Talleres presenciales. fecha: AAAA-MM-DD. estado: 'abierto' o 'completo'.
  // Los talleres con fecha pasada se muestran solos como "ya hechos".
  talleres: [
    {
      fecha: '2026-05-23',
      titulo: 'Taller de bordado infantil',
      descripcion: 'Aprende a bordar tu nombre con diferentes puntos de bordado.',
      hora: '17:00 a 19:00',
      lugar: 'Sant Quirze del Vallès',
      publico: 'Para niños y niñas',
      cartel: 'images/web/cartel-infantil-640.webp',
      estado: 'abierto'
    },
    {
      fecha: '2024-11-16',
      titulo: 'Corona bordada de Navidad',
      descripcion: 'Bordamos una corona de Navidad. No hace falta experiencia.',
      hora: '10:30 a 13:30',
      lugar: 'La Merceria dels Encants, Barcelona',
      publico: 'Adultos',
      cartel: 'images/web/cartel-navidad-640.webp',
      estado: 'abierto'
    },
    {
      fecha: '2024-10-17',
      titulo: 'Mini calabaza de tela',
      descripcion: 'Cosemos una calabaza de tela decorada para otoño.',
      hora: '16:30 a 19:30',
      lugar: 'Cercle Cultura, Sant Quirze del Vallès',
      publico: 'Adultos o menores acompañados',
      cartel: 'images/web/cartel-calabaza-640.webp',
      estado: 'abierto'
    }
  ],

  // Tienda. precio: escribe por ejemplo '35 €' o deja null para "Pregúntame el precio".
  // tipo: 'Por encargo' o 'Hecho a mano'.
  productos: [
    {
      nombre: 'Bastidor de nacimiento',
      tipo: 'Por encargo',
      descripcion: 'Con el nombre, la fecha, la hora y el peso del bebé.',
      imagen: 'images/web/bastidor-nacimiento-640.webp',
      precio: null
    },
    {
      nombre: 'Inicial con flores',
      tipo: 'Por encargo',
      descripcion: 'La letra que tú quieras, bordada con flores en bastidor.',
      imagen: 'images/web/inicial-floral-640.webp',
      precio: null
    },
    {
      nombre: 'Chaqueta vaquera bordada',
      tipo: 'Por encargo',
      descripcion: 'Personalizo tu chaqueta con los motivos que elijas.',
      imagen: 'images/web/chaqueta-vaquera-640.webp',
      precio: null
    },
    {
      nombre: 'Bastidor «Magia eres tú»',
      tipo: 'Hecho a mano',
      descripcion: 'Bastidor pintado y bordado a mano.',
      imagen: 'images/web/bastidor-magia-640.webp',
      precio: null
    },
    {
      nombre: 'Organizadores casita',
      tipo: 'Hecho a mano',
      descripcion: 'Cestitas de tela con forma de casa para tus lápices y tijeras.',
      imagen: 'images/web/organizadores-casitas-640.webp',
      precio: null
    },
    {
      nombre: 'Gorro y guantes bordados',
      tipo: 'Hecho a mano',
      descripcion: 'Flores bordadas a mano sobre punto.',
      imagen: 'images/web/gorro-guantes-640.webp',
      precio: null
    },
    {
      nombre: 'Soporte para el móvil',
      tipo: 'Hecho a mano',
      descripcion: 'Cojín de tela para apoyar el móvil.',
      imagen: 'images/web/soporte-movil-640.webp',
      precio: null
    },
    {
      nombre: 'Delantal de patchwork',
      tipo: 'Hecho a mano',
      descripcion: 'Delantal de cuadros con bolsillos de patchwork.',
      imagen: 'images/web/delantal-patchwork-640.webp',
      precio: null
    }
  ],

  // Tutoriales gratis de YouTube (el id es lo que va después de "v=" en el enlace).
  tutoriales: [
    { id: 'pL7IZGk2DTQ', titulo: 'Cómo pasar un dibujo a tela clara u oscura sin mesa de luz' },
    { id: 'kxApL4V7T5Q', titulo: 'Cómo imprimir sobre tela con la impresora de casa' },
    { id: 'e8UAvfTtZvo', titulo: 'Cómo ordeno mis hilos de bordado' },
    { id: 'IMr5A73i5xU', titulo: 'Campanitas de Navidad' },
    { id: 'FmdjfDur4NE', titulo: 'Un truco para los nudos' },
    { id: 'xxV5TINtjpU', titulo: '¿Qué hago con mis bordados acabados?' }
  ]
};
