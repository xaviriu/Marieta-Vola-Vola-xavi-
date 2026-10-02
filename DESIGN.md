---
name: Marieta Vola Vola
description: Embroidery workshops, a monthly community and handmade pieces by Cristina Robles, laid out as a haberdashery thread card.
colors:
  paper: "#FDFDFB"
  card: "#EEF0EC"
  card-2: "#E3E6E0"
  ink: "#1B1B1A"
  ink-2: "#474744"
  ink-3: "#6A6A66"
  rule: "rgba(27, 27, 26, .16)"
  t321: "#C3283A"
  t321-deep: "#9E1E2E"
  t699: "#0F5E35"
  t699-deep: "#0A4627"
  t725: "#E3A42B"
  t725-deep: "#B97E12"
  t798: "#3C61A8"
  t3607: "#B8417F"
  t3607-deep: "#933264"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Arial Narrow', sans-serif"
    fontSize: "clamp(3rem, 7.2vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-.035em"
    fontVariation: "font-stretch: 76%"
  headline:
    fontFamily: "'Bricolage Grotesque', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.375rem, 4.6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-.025em"
    fontVariation: "font-stretch: 80%"
  title:
    fontFamily: "'Bricolage Grotesque', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.5rem, 2.2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-.02em"
    fontVariation: "font-stretch: 85%"
  body:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', sans-serif"
    fontSize: "clamp(1.1875rem, 1.6vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.1
  skein-number:
    fontFamily: "'Bricolage Grotesque', 'Arial Narrow', sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-.01em"
    fontVariation: "font-stretch: 75%"
rounded:
  label: "2px"
  card: "6px"
  panel: "10px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  maxw: "1320px"
  section: "clamp(4.5rem, 9vw, 8rem)"
  head-gap: "clamp(2.25rem, 4vw, 3.5rem)"
  grid-gap: "clamp(1rem, 2vw, 1.5rem)"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: ".5rem .5rem .5rem 1.5rem"
    height: "56px"
  button-321:
    backgroundColor: "{colors.t321}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: ".5rem .5rem .5rem 1.5rem"
    height: "56px"
  button-321-hover:
    backgroundColor: "{colors.t321-deep}"
  button-699:
    backgroundColor: "{colors.t699}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "56px"
  button-699-hover:
    backgroundColor: "{colors.t699-deep}"
  button-725:
    backgroundColor: "{colors.t725}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "56px"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "56px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: ".5rem 1.5rem"
    height: "56px"
  button-small:
    rounded: "{rounded.pill}"
    padding: ".5rem .5rem .5rem 1.125rem"
    height: "48px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "48px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card-product:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "1.125rem 1.25rem 1.25rem"
  label-tag:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.label}"
    padding: ".125rem .625rem"
  date-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "100px"
  skein-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.skein-number}"
    rounded: "{rounded.label}"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "48px"
    padding: "0 .7rem"
---

# Design System: Marieta Vola Vola

## Overview

**Creative North Star: "Carta de colores de la mercería"**

The site is the haberdashery thread card every embroiderer knows by heart: a white card-stock ground, a cool grey card, near-black ink, and five real thread colours, each numbered like a DMC skein and each owning one part of Cristina's offer. Talleres is 321 red, Comunidad is 699 green, Tienda is 725 topaz, Tutoriales is 798 blue, Sobre mí is 3607 pink. The skein, with its twisted face and paper band carrying the number, is the system's signature object: it is the hero menu, the marker beside every section heading, and the column beside every inner-page title.

Density is generous and calm for an audience of women aged 40-60 with little digital fluency: big type (body 19px), pill buttons at least 56px tall, one obvious action per block, and every path ending in a WhatsApp button. Colour comes in two doses: full-bleed colour fields for the sections that sell (green Comunidad, red closing contact, coloured inner-page heroes), and small doses everywhere else (nav underlines, skeins, step rules, one red word in the hero headline). The rest is paper and ink.

The world was chosen as a replacement for the cream-paper, elegant-italic-serif, pastel-doodle category default; the earlier pastel/doodle look in css/styles.css belongs only to the portal/ and admin/ pages and is not part of this system.

**Key Characteristics:**
- White card stock (paper), cool grey card, near-black ink; no cream, no beige.
- Five thread colours, one per offering, never reassigned.
- Condensed, heavy Bricolage Grotesque for headings and numbers; Atkinson Hyperlegible Next for everything read.
- Pill buttons with a round icon "dot" on the right; 6px cards; 2px labels.
- Motion with thread tension: short drops with a soft overshoot, once, never looping.

## Colors

A paper-and-ink ground carrying five saturated thread colours that act as section ownership, not decoration.

### Primary
- **321 Rojo** (t321): Talleres, the brand ladybird and the main booking action. Primary booking buttons, the red word in the hero headline, the "Completo" status, the empty-state icon disc, and the full-bleed closing contact field. Deepens to **321 Rojo Oscuro** (t321-deep) on button hover.

### Secondary
- **699 Verde** (t699): Comunidad. The full-bleed community field, the "Entrar" button in the header, and community buttons. Hover deepens to **699 Verde Oscuro** (t699-deep).
- **725 Topacio** (t725): Tienda. Product kind tags, the open-FAQ toggle, channel-icon hover, text selection. Text on topaz is always ink. As link colour on paper it is replaced by **725 Topacio Oscuro** (t725-deep).

### Tertiary
- **798 Azul** (t798): Tutoriales and the focus ring. The video play disc, the selected video-list outline, and every `:focus-visible` outline (3px, 3px offset).
- **3607 Rosa** (t3607): Sobre mí. The quote top rule and benefit icons; **3607 Rosa Oscuro** (t3607-deep) sets the large age numerals in the timeline.

### Neutral
- **Card Stock White** (paper): page ground, button text on colour, skein bands, product and format cards, date chips.
- **Cool Grey Card** (card): the carta behind the hero photo, alternating `section--card` bands, chips, tags, venue and notice panels, mobile menu rows.
- **Grey Card Shade** (card-2): image placeholders while photos load, chip hover, neutral status label.
- **Thread Ink** (ink): text, the default button, 2px rules that open lists (programme, FAQ, channels), the footer field, the WhatsApp float.
- **Ink 2** (ink-2): secondary text, descriptions and meta lines.
- **Ink 3** (ink-3): past/disabled text only (past date chips), scrollbar thumb.
- **Hairline** (rule): 1px row dividers between list items and in card footers.

### Named Rules
**The One Skein, One Section Rule.** Each thread colour belongs to exactly one offering (321 Talleres, 699 Comunidad, 725 Tienda, 798 Tutoriales, 3607 Sobre mí). A new surface for an offering inherits its colour; a colour is never borrowed for another offering's emphasis. Neutral surfaces (Contacto, footer, WhatsApp float) use ink.

**The Field Or Fleck Rule.** A thread colour appears either as a full-bleed field (community, closing, inner-page hero) or as a small fleck (underline, skein, rule, tag, one word). Never as a tinted mid-size panel or a gradient.

**The Topaz Never Writes Rule.** 725 topaz is a background only; text set on it is ink, and topaz-coloured text or underlines on paper use t725-deep.

## Typography

**Display Font:** Bricolage Grotesque, variable width 75-100% and weight 400-800, self-hosted (with Arial Narrow fallback)
**Body Font:** Atkinson Hyperlegible Next 400-700 plus italic, self-hosted (with Segoe UI fallback)

**Character:** A condensed, heavy grotesque that reads like the printed numbers on a thread band, paired with a typeface designed for low-vision legibility. Headings are tight and loud; everything people actually read is open and plain.

### Hierarchy
- **Display** (800, clamp(3rem, 7.2vw, 6rem), 0.95, width 76%): inner-page hero titles and the closing "contact" title. The home hero title runs smaller (800, clamp(2.75rem, 4.2vw, 4rem), 1.0, width 84%) so photo and skeins share the first viewport; the community title sits between (clamp(2.75rem, 5.6vw, 5rem), width 78%).
- **Headline** (800, clamp(2.375rem, 4.6vw, 4rem), width 80%): section titles beside a section skein; `.h2` on inner pages runs clamp(2rem, 3.8vw, 3.25rem).
- **Title** (700, clamp(1.5rem, 2.2vw, 1.875rem), width 85%): programme rows, card names (1.5-1.625rem), FAQ questions, steps, venues.
- **Body** (400, 19px desktop, 18px below 860px, 1.6): all running text; measure 62ch. Lead paragraphs run 19-22px at 1.55 in ink-2.
- **Label** (700, 16-18px, no tracking, no uppercase): buttons, nav links, tags, date-chip weekday/month, meta lines.
- **Numerals** (800, width 75%, tight negative tracking): skein numbers, date-chip day (2.75rem), price tag (clamp(3.25rem, 6vw, 4.5rem)), timeline ages.

### Named Rules
**The Narrow For Numbers Rule.** Bricolage is always condensed (font-stretch 75-85%) and negatively tracked; the narrowest widths (75%) are reserved for numbers on bands, chips and tags.

**The Nothing Small Rule.** No text under 16px (1rem), no uppercase labels, no letter-spaced small caps. Secondary information is quieter by colour (ink-2), never by size below 16px.

## Layout

A single centered column (max 1320px) with a fluid gutter (clamp(1rem, 4vw, 3rem)). Sections breathe at clamp(4.5rem, 9vw, 8rem) vertical padding and alternate paper and card bands, broken by full-bleed colour fields. Section heads are a two-column grid: a slim hanging skein (40-54px wide, 150-196px tall) to the left of the title and lead. Inner pages open with the same structure at hero scale (skein 52-70px by 210-290px).

The home hero is a 10fr / 13fr grid: headline, one sentence and two pills on the left; on the right, the carta (grey card with a hanging tab) holding a 3:4 photo of Cristina with five full-height skeins along its right edge. Lists are rows, not card grids: the workshop programme is a dated table (date chip, title, meta, action), contact channels and community inclusions are ruled rows. Cards are used for things you would pick up: products (4-up grid or horizontal snap rail), formats (3-up), works (masonry columns of 280px), venues.

Breakpoints: 1100px swaps the inline nav for a "Menú" pill and a full-screen menu and folds programme rows; 860px collapses every two-column grid to one, stacks the carta (photo 5:4, skeins as a 190px row of five) and drops body to 18px; 600px makes hero/community/closing CTAs full width and reduces the programme to a date column plus content.

## Elevation & Depth

Mostly flat paper with soft, warm-tinted ambient shadow under objects that could be lifted off the table (cards, carta, photos, video), and a stronger lift as a hover response. Depth inside the world is physical: skeins have inset edge shading and a drop shadow, bands cast a small shadow on the skein, the price tag and the story inset photo sit slightly rotated with their own shadow.

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 1px 2px rgba(40,42,36,.06), 0 10px 30px -12px rgba(40,42,36,.22)`): resting cards, carta, photos, video.
- **Lift** (`box-shadow: 0 2px 4px rgba(40,42,36,.08), 0 22px 40px -16px rgba(40,42,36,.34)`): button hover, the rotated story inset.
- **Skein hang** (`0 6px 14px -8px rgba(0,0,0,.4)`, rising to `0 22px 26px -14px rgba(0,0,0,.45)` on hover): hero skeins.
- **Header stuck** (`0 1px 0 var(--rule), 0 8px 24px -18px rgba(40,42,36,.4)`): appears only once the page scrolls.

### Named Rules
**The Lift Is A Response Rule.** Resting surfaces use Soft at most; Lift and stronger shadows appear on hover or on objects that are physically tilted (price tag, inset photo).

## Shapes

Three radii and a pill: 2px for labels and skein bands (paper tags), 6px for cards, photos and chips (card), 10px for the two large panels (carta, WhatsApp card), and full pill (999px) for every button, chip, nav hover and the menu button. Skeins use an elliptical radius (999px / 46px) and a small dark loop at the top. Icon discs are circles (40px in buttons, 48-64px elsewhere). Rules are 1px hairlines between rows and a 2px ink rule opening each list; coloured 3px rules top steps and the quote.

## Components

### Buttons
Confident, round, impossible to miss.
- **Shape:** full pill (999px), 56px tall (48px small), label left and a round 40px "dot" on the right holding a Phosphor icon (WhatsApp, arrow, lock).
- **Primary:** ink by default; thread-colour variants (321 for booking, 699 for community, 725 with ink text, 798, 3607) follow the section they live in. Paper variant on colour fields.
- **Hover / Focus:** rises 2px with the Lift shadow while the dot nudges 3px right and scales 1.06 (0.5s ease-out); 321/699 deepen; active presses to scale .98. Focus is the global 3px 798 outline.
- **Ghost:** transparent with a 2px inset ink ring, no dot; fills with ink on hover. Ghost-light variant uses a white ring on colour fields.
- **Text link:** bold, 2px underline in the section colour, offset grows on hover and the arrow slides 4px.

### Chips
- **Style:** pill, 48px tall, card background, bold 17px label.
- **State:** hover card-2; selected (aria-pressed) ink with paper text. Used as shop filters.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** paper on card bands, card on paper (venues, notices).
- **Shadow Strategy:** Soft at rest; image inside scales 1.04 over 1.2s on hover.
- **Border:** none; product footers divided by a hairline.
- **Internal Padding:** 1.125-1.5rem.

### Navigation
- **Desktop:** brand (ladybird + Bricolage 800 name) left; bold 18px links, 48px tall, each underlined on hover/current by a 3px bar in its section colour drawing in from the left; a small 699 "Entrar" pill at the end. Header is sticky, translucent paper with backdrop blur, and gains a hairline and shadow once scrolled.
- **Mobile (<=1100px):** an ink "Menú" pill opens a full-screen paper sheet of 64px card rows, each led by a 12x36px thread-colour bar, staggered in by 40ms; WhatsApp and community pills below.

### Skein (signature)
A tall rounded skein filled with the section's thread colour and a twisted-stripe texture, with a paper band at ~52% height carrying the number (Bricolage 800, 75% width) above a small colour tick and, in the hero, the section name. In the hero the five skeins are the section menu: they drop in one after another on load (back.out overshoot, 90ms stagger) with bands unfolding after, and on hover lift 10px while the band slides 14px down. Beside section and page titles a slim, number-only skein drops in once on scroll. The skein face is currently a CSS interim; see Do's and Don'ts.

### Date chip and programme row
Paper chip with a 2px inset ink ring: weekday and month in bold Atkinson, day in Bricolage 800 at 2.75rem. Past rows dim the ring to the hairline and the text to ink-3, and show the workshop poster as a 132px square.

### Price tag
A paper tag rotated -2deg on the green field with the amount in Bricolage 800 (75% width) and "al mes" beside it; it swings in once with an elastic settle.

### Thread strip
An 8px pill strip of the five thread colours in the footer, the one place all five appear together outside the hero.

## Do's and Don'ts

### Do:
- **Do** give every new offering surface its own thread colour from the existing five and use it as a field or a fleck, per The One Skein, One Section Rule.
- **Do** end every block with one WhatsApp pill (ink or section colour, WhatsApp icon in the dot) that pre-fills a message to Cristina.
- **Do** keep body at 19px (18px under 860px), labels at 16px or more, and every target at 48px or more (56px for primary pills).
- **Do** use the skein with its numbered paper band to mark sections and page titles.
- **Do** animate with thread tension: one short drop or reveal with expo.out or back.out, played once, and nothing when prefers-reduced-motion is set.
- **Do** use Phosphor regular icons from images/icons.svg, inline via `<use>`.
- **Do** use real photographs of Cristina and her pieces at 6px radius with a card-2 placeholder.

### Don't:
- **Don't** use cream or beige grounds, italic serif display type, or pastel sewing doodles; that was the rejected category default and the old portal look.
- **Don't** put text over the hero photo; the photo carries no caption or overlay.
- **Don't** set topaz (725) as text or underline on paper; use t725-deep.
- **Don't** use uppercase or letter-spaced labels, or any text under 16px.
- **Don't** loop, float or bounce continuously; motion settles and stops.
- **Don't** mix thread colours in gradients; the only multi-colour moments are the hero skeins and the footer thread strip.
- **Don't** treat the CSS twisted-stripe skein face as final or copy it to new surfaces as texture; it is an interim stand-in until photographs of Cristina's own DMC skeins 321, 699, 725, 798 and 3607 replace it.
