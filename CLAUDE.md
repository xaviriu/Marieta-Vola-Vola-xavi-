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
