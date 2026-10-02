# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** women aged 40-60, mostly in Sant Quirze del Vallès / Barcelona area, with little digital fluency. They find Marieta through Instagram, word of mouth, posters at the Cercle Cultural or La Merceria dels Encants. Their job: find out when the next workshop is, whether they can do it with no experience, and book it with as little friction as possible (WhatsApp).
- **Members:** paying members of the Comunidad Marieta who log in to watch exclusive tutorials, live recordings and download materials.
- **Gift buyers:** people who want a personalised embroidered piece (birth hoops with name and date, initials, denim jackets) or one of her handmade items.

## Product Purpose

Public website for Marieta Vola Vola, the craft brand of Cristina Robles (embroidery, sewing, cross-stitch and crafts). It exists to:
1. Fill in-person workshops (booking via WhatsApp).
2. Sell membership to the Comunidad Marieta (20 €/month).
3. Show and sell handmade pieces and commissions (catalogue, order via WhatsApp).
4. Offer free tutorials that build trust and lead to the community.

Success: more workshop bookings and more community members without Cristina having to explain everything by message.

## Positioning

A real person teaching in her own town, not a kit brand or an online academy. Cristina learned embroidery at 10 with "la Sra. Teresina", has done crafts for decades (painting on plaster, decoupage, sewing) and teaches with patience in small groups and in a private WhatsApp community. Workshops are seasonal and local (Halloween fabric pumpkins, Christmas embroidered wreaths, Sant Jordi bookmarks, children's name embroidery).

## Operating Context

- Workshops: in person, 2-3 h, small groups, all materials included, no experience needed. Venues so far: Cercle Cultura (Carrer Nou 10, Sant Quirze del Vallès) and La Merceria dels Encants (Carrer dels Enamorats 93, Barcelona). Booking: WhatsApp 630 05 02 09.
- Comunidad Marieta: 20 €/month. Today runs on a private WhatsApp group (exclusive tutorials, live sessions, materials). The web's private area (portal/, Supabase auth + courses/videos/materials, admin panel) is meant to replace that as the place where members see everything uploaded.
- Paid courses also exist (e.g. "Corona Bordada de Navidad 2024", watercolour pencils, embroidered jewellery) delivered as YouTube unlisted video sequences.
- Free tutorials on YouTube: @marieta.vola.vola.Bordado.
- Shop: catalogue + "order via WhatsApp" button. No online payment yet; Stripe later.

## Capabilities and Constraints

- Static site: vanilla HTML + CSS + JS, no frameworks, no build step. Hosting GitHub Pages / Netlify / Vercel.
- Existing private area: portal/ (login, dashboard, course page) and admin/ backed by Supabase. Must keep working; public pages link to it.
- Language: Spanish only for now (Catalan possibly later).
- Maintained by two non-programmers through Claude Code, so content (workshops, products) should be easy to edit in one place.

## Brand Commitments

- Name: Marieta Vola Vola ("mariquita vuela vuela", Catalan children's song). The ladybird logo (images/logo nuevo.png, images/icono marieta.png) is binding.
- Voice: first person, warm, close, plain Spanish. Cristina speaks directly ("te cuento", "me encantaría ayudarte").
- Email: cristina@marietavolavola.com. Domain: marietavolavola.com.
- Social: Instagram @marieta.vola.vola.bordado, YouTube @marieta.vola.vola.Bordado, Facebook Lady.Bug.CR.

## Evidence on Hand

- Real story text: images/Presentación.docx (origin of the name, Sra. Teresina, Carme Josa de Pinzellart, benefits of embroidery).
- Real photos of Cristina: images/fotomarieta.jpg, images/presentacion-cristina.jpg, images/fotomarietapresentacion.jpg.
- Real work photos: images/1.jpg (birth hoop), 2.jpg (MAGIA hoop), 55.jpg (apron), 88.jpg (painted bag hanger), proyecto.jpg (denim jacket), otramanualidad.jpg (floral initial L), manualidad2.jpg (embroidered hat and gloves), manudalidadhecha.jpg (fabric house organisers), otramanualidaade.jpg (phone stand), puntoslibrosantjordi.jpg (Sant Jordi bookmarks), presentacion-labor10.jpg (first piece at age 10), presentacion-colgador.jpg (first plaster painting).
- Workshop posters: tallerdisponible.jpg, otrotallerdisponible.jpg, otrotallerdispo.jpg.
- Course/tutorial inventory: images/Planing Cursos.xlsx.
- **Absent, must not be fabricated:** testimonials (previous ones were invented and removed), product prices, number of students, upcoming workshop dates beyond what Cristina confirms.

## Product Principles

1. WhatsApp is the front door: every decision path ends in one clear "write to Cristina" action.
2. Real over polished: her real pieces and her real face carry the trust, not stock imagery.
3. Never make a 50-year-old feel lost: big type, obvious buttons, one action per block.
4. The community is the long-term business: the site should make joining it feel natural and its value concrete.

## Accessibility & Inclusion

Audience 40-60 with low digital fluency: body text ≥ 18px, high contrast (WCAG AA minimum), large tap targets (≥ 48px), no hidden navigation patterns on desktop, no meaning carried by motion alone, respect prefers-reduced-motion.
