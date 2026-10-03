# MarietaVolaVola — Guía del Proyecto

## Contexto del proyecto

Web profesional para **Marieta Vola Vola**, artista de bordado que imparte talleres y cursillos.
Instagram: https://www.instagram.com/marieta.vola.vola.bordado/

**Objetivo de la web:**
- Información sobre cursos y talleres
- Acceso fácil a WhatsApp y redes sociales para reservas
- Diseño intuitivo para usuarias de 40-50 años con poco manejo digital
- Futuro: acceso a cursos online, pagos via Stripe

## El equipo

- **Pau Solé** — GitHub: `Roarpa` (pausolecasals@gmail.com) / Claude Pro: psole@playoffinformatica.com
- **Xavi Riu** — GitHub: `xaviriu` (spray2208@gmail.com)
- Ambos con **nivel 0 de programación** — Claude Code gestiona el flujo técnico

## Cómo trabaja Claude Code en este proyecto

Claude Code gestiona todo el flujo de Git. Los desarrolladores NO necesitan ejecutar comandos de git manualmente. Simplemente deben decir:

- "guarda lo que has hecho" → Claude hace commit
- "sube los cambios" → Claude hace push
- "dame los últimos cambios" → Claude hace pull
- "termina esta parte" → Claude hace commit + push + PR si corresponde

## Normas de colaboración (IMPORTANTE)

### Regla principal: no tocar el mismo archivo a la vez

Antes de pedir cambios en una sección, confirmar que el otro colaborador no está trabajando en ella. Comunicarse por WhatsApp/chat si hay duda.

### División de trabajo sugerida

Cada colaborador trabaja en una **rama separada**. Claude Code crea y gestiona las ramas automáticamente.

Ejemplo de reparto:
- Un colaborador trabaja en la sección de cursos
- El otro trabaja en el header/navegación
- Nunca los dos en el mismo archivo simultáneamente

### Flujo que Claude Code gestiona automáticamente

```
1. Al empezar → git pull (traer cambios del otro)
2. Crear rama para la tarea actual
3. Hacer cambios
4. Commit descriptivo
5. Push a GitHub
6. Pull Request para que el otro revise (si aplica)
7. Merge a main cuando esté aprobado
```

### Rama principal

- `main` → versión estable y publicada
- Nunca trabajar directamente en `main`
- Siempre crear una rama para cada feature/sección

## Stack tecnológico

- HTML + CSS + JavaScript vanilla (sin frameworks)
- Hosting: GitHub Pages o Netlify (gratuito)
- Pagos futuros: Stripe

## Secciones previstas de la web

- [ ] Header con logo y navegación
- [ ] Hero / presentación
- [ ] Sección de cursos y talleres
- [ ] Galería de trabajos
- [ ] Contacto (WhatsApp, Instagram)
- [ ] Footer

## Instrucciones para Claude Code

- Gestionar siempre el git flow completo sin que el usuario tenga que ejecutar comandos
- Antes de empezar a trabajar, hacer `git pull origin main` para tener los últimos cambios
- Usar ramas con nombres descriptivos: `feat/nombre-seccion`
- Commits en español, descriptivos y cortos
- Si hay conflicto de merge, resolverlo y explicar al usuario qué pasó en términos simples
- Priorizar diseño simple, accesible y mobile-first
- Tipografía grande y legible (mínimo 16px body)
- Contraste alto para buena legibilidad
- Botones grandes y claramente clicables

## Skills & Reglas de Uso

Tengo las siguientes skills instaladas. Léelas y aplícalas automáticamente 
según lo que te pida, sin que yo tenga que invocarlas manualmente.

---

### DISEÑO & ESTILO VISUAL

**/taste-skill** — Úsala SIEMPRE al construir algo nuevo desde cero.
Evita diseños genéricos, templated o con aspecto de IA. Lee el contexto 
del proyecto e infiere la dirección de diseño correcta.
→ Se activa cuando digo: "hazme una sección", "crea el hero", 
"diseña las cards", "construye el layout", "empieza la página"

**/soft-skill** — Úsala cuando algo tiene que verse caro, profesional o premium.
Define fuentes, espaciados, sombras y estructuras exactas para que no parezca 
hecho con una plantilla.
→ Se activa cuando digo: "que se vea premium", "que parezca caro", 
"que se vea profesional", "mejora el aspecto visual", "que no parezca de IA"

**/minimalist-skill** — Úsala cuando el cliente quiera algo limpio, 
serio y editorial. Paleta monocromática, tipografía con contraste, sin 
gradientes ni sombras pesadas.
→ Se activa cuando digo: "estilo minimalista", "diseño limpio", 
"algo simple y elegante", "estilo editorial", "sin mucho ruido visual"

**/redesign-skill** — Úsala cuando el cliente ya tiene web y quiere mejorarla.
Primero audita lo que hay, luego mejora sin romper la funcionalidad existente.
→ Se activa cuando digo: "el cliente ya tiene web", "quiero mejorar esto", 
"rediseña esta sección", "actualiza el diseño actual"

**/emil-design-eng** — Úsala para revisar y pulir animaciones y transiciones CSS.
Devuelve siempre una tabla Before/After/Why con los cambios exactos.
→ Se activa cuando digo: "revisa las animaciones", "¿está bien este CSS?", 
"¿se ve natural?", "revisa las transiciones", "¿el timing está bien?"

---

### ANIMACIONES

**/gsap-scrolltrigger** — Úsala para todo lo que se anime al hacer scroll.
Elementos que aparecen, secciones que se pegan, efectos parallax.
→ Se activa cuando digo: "que aparezca al hacer scroll", "efecto parallax", 
"que se revele al bajar", "sección que se queda fija", "animación al scroll"

**/gsap-timeline** — Úsala para secuenciar varias animaciones en orden.
Primero entra esto, luego aquello, luego lo otro.
→ Se activa cuando digo: "primero el título luego el botón", 
"que entren en orden", "secuencia de entrada", "animación por pasos", 
"que aparezcan uno detrás del otro"

**/gsap-core** — Úsala para animaciones simples y directas sobre un elemento.
Mover, escalar, cambiar opacidad, rotar.
→ Se activa cuando digo: "anima este elemento", "que aparezca con fade", 
"que se mueva hacia arriba", "animación de entrada básica"

**/gsap-plugins** — Úsala para efectos avanzados que impresionan al cliente.
Texto que se rompe letra a letra, scroll suave, elementos arrastrables, flip de layout.
→ Se activa cuando digo: "texto que aparece letra por letra", 
"scroll suave", "que se pueda arrastrar", "efecto de texto avanzado", 
"SplitText", "ScrollSmoother"

**/gsap-react** — Úsala cuando el proyecto está en React o Next.js.
Gestiona correctamente refs, cleanup y el hook useGSAP.
→ Se activa cuando el proyecto usa React/Next.js y me pide animaciones

**/gsap-performance** — Úsala cuando las animaciones van lentas o hacen saltos.
→ Se activa cuando digo: "va lento en móvil", "hace jank", 
"las animaciones no van fluidas", "quiero 60fps", "optimiza las animaciones"

---

### REVISIÓN & ENTREGA

**/code-review** — Úsala antes de entregar el proyecto al cliente.
Busca bugs, problemas de lógica y errores en el código.
→ Se activa cuando digo: "voy a entregar esto", "revisa el código", 
"¿está todo bien antes de subir?", "última revisión"

**/security-review** — Úsala antes de hacer deploy en producción.
Busca vulnerabilidades de seguridad.
→ Se activa cuando digo: "voy a hacer deploy", "súbelo a producción", 
"revisión de seguridad"

---

### REGLA GENERAL

Cuando me pidas construir cualquier cosa nueva, combina automáticamente:
1. **/taste-skill** → para que no sea genérico
2. **/soft-skill** → para que se vea premium
3. La skill de animación que corresponda según el contexto

No esperes a que yo invoque las skills manualmente. Lée lo que te pido, 
decide cuál encaja mejor y aplícala directamente.

## Checklist antes de publicar la web (lanzamiento)

Cuando el usuario diga "vamos a publicar / lanzar la web / deploy", recordarle estos pasos pendientes:

- [ ] **Supabase → Authentication → URL Configuration → Redirect URLs:** añadir `https://DOMINIO-REAL/portal/restablecer.html` (sin esto el email de "restablecer contraseña" no funciona en producción). Cambiar también la **Site URL** al dominio real.
- [ ] **Supabase → Authentication → SMTP Settings:** configurar un correo propio (el envío por defecto de Supabase tiene un límite muy bajo de emails por hora).
- [ ] **Supabase → Authentication → Sign In / Providers → Email:** longitud mínima de contraseña 8 y activar "Prevent use of leaked passwords".
- [ ] **Vercel:** definir las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (las usan `api/create-user.js` y `api/delete-user.js`).
- [ ] **Clave `service_role`:** `js/admin-secret.js` es solo para uso local y está en `.gitignore`. No subirlo nunca; si alguna vez se expone, regenerar la clave en Supabase → Settings → API.
- [ ] Comprobar en Supabase que **solo** `cristina@marietavolavola.com` tiene `es_admin = true` en la tabla `profiles`.
- [ ] Ejecutar `supabase/schema.sql` actualizado (incluye la función `is_admin()` que evita la recursión de RLS).
- [ ] Probar en el dominio real: login de alumna, login admin, cambio de contraseña provisional y restablecer por email.
- [ ] Revisar HTTPS activo y pasar `/security-review` antes del deploy.
- [ ] Opcional: ejecutar `gh auth login` una vez para que Claude pueda crear Pull Requests.
