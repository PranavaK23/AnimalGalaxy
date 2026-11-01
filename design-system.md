# FaunaScope Design System & Style Guide
**Classic 2-Column Hero & Sharp Geometry Edition (WCAG 2.1 AA/AAA Compliant)**

This document serves as the permanent design specification for **FaunaScope: Global Animal Species Database & Citizen Science Wildlife Portal**. It combines the clean, high-contrast forest biodiversity palette with the classic responsive 2-column hero banner, sharp zero-radius architectural geometry, and uncropped media standards.

---

## 1. Brand Identity & Visual Architecture

- **Visual Tone**: Scientific, educational, biodiversity-focused, and accessible.
- **Hero Banner Architecture**: Clean, balanced 2-column layout (1.2fr content & discovery / 0.8fr featured uncropped photograph) over a soft natural gradient, collapsing gracefully to a single column on tablet and mobile.
- **Sharp Geometric Architecture**: Pure 90-degree corners (`0px` border-radius) across cards, forms, buttons, inputs, and modals.
- **Strict Accessibility (WCAG 2.1 AA/AAA)**: Every color pair, text contrast ratio, keyboard focus ring, and ARIA state strictly conforms to W3C accessibility guidelines without reliance on emojis.
- **100% Uncropped Media**: `object-fit: contain` and `fit=max` parameters preserve animal subjects without crop clipping.

---

## 2. Color Palette & Accessibility Tokens

| Token Name | Hex Code | Contrast (on #FFFFFF) | Role & Usage |
|:---|:---|:---|:---|
| `--color-primary` | `#1b5e20` | **7.4:1 (AAA)** | Deep Forest Green; primary buttons, brand logos, Least Concern IUCN status |
| `--color-primary-hover` | `#144618` | **9.6:1 (AAA)** | Button hover state |
| `--color-primary-light` | `#e8f5e9` | — | Taxonomic tags, subtle highlights |
| `--color-emergency` | `#b71c1c` | **7.2:1 (AAA)** | Endangered IUCN status badge, form error highlights |
| `--color-emergency-hover`| `#8f1313` | **9.4:1 (AAA)** | Action button hover |
| `--color-accent` | `#b45309` | **4.6:1 (AA)** | Vulnerable IUCN status badge, secondary accents |
| `--color-accent-light` | `#fef3c7` | — | Notice alert fill |
| `--color-text-dark` | `#1e293b` | **12.6:1 (AAA)**| Slate dark body text |
| `--color-text-muted` | `#475569` | **5.5:1 (AA)**  | Secondary metadata, hints, scientific names |
| `--color-bg-light` | `#f8fafc` | — | Clean canvas background |
| `--color-surface` | `#ffffff` | — | Card surfaces |
| `--color-border` | `#cbd5e1` | — | Component borders |

---

## 3. Classic 2-Column Responsive Hero Architecture

```
┌───────────────────────────────────────────────┬────────────────────────────┐
│ Content & Discovery Column (1.2fr)            │ Photographic Column (0.8fr)│
│                                               │                            │
│ Explore Earth's Wildlife Species &            │ ┌────────────────────────┐ │
│ Biodiversity                                  │ │                        │ │
│ (H1: clamp(2rem, 4vw, 2.75rem))               │ │ [Featured Wildlife     │ │
│                                               │ │  Photograph - Uncropped│ │
│ Search comprehensive biological records,      │ │  fit=max, contain]     │ │
│ IUCN statuses, or log wildlife sightings ...  │ │ (Zero rounded corners) │ │
│                                               │ │                        │ │
│ [ Quick Search Input ] [ Search Button ]      │ └────────────────────────┘ │
│ [ Browse Directory ] [ Log Field Sighting ]   │                            │
└───────────────────────────────────────────────┴────────────────────────────┘
```

- **Desktop (>= 900px):** 2-column balanced grid with fluid typography.
- **Tablet & Mobile (< 900px):** Collapses into a centered single-column stack with auto-adjusting image dimensions.

---

## 4. Sharp Geometric Architecture (Zero Rounded Corners)

All border radii are locked to strict 90-degree architectural corners:

```css
--radius-xs:   0px;     /* Status badges & micro-chips */
--radius-sm:   0px;     /* Buttons, form inputs, filter chips */
--radius-md:   0px;     /* Species cards, form panels, and modal dialogs */
--radius-lg:   0px;     /* Outer bounding layouts */
--radius-pill: 0px;     /* Badges, action pills */
```

---

## 5. Component Standards

### 5.1 Species Cards (`.pet-card`)
- **Direct Photography**: 100% uncropped photographic view using `object-fit: contain` and Wikimedia Commons high-resolution photography, completely preserving subject framing without clipping.
- **Unobstructed Media**: Zero badges, tags, or overlay boxes over the picture container; all status badges are rendered inside the card content header below the image so photography remains 100% visible and uncovered.
- **Uniform Card Geometry**: Strict `560px` height across all cards in all rows. Uses a 220px fixed uncropped media wrap, single-line truncation for long names, and a 3-line (`-webkit-line-clamp: 3`) clamped summary to guarantee every card across all rows remains 100% equal in dimensions. Full texts remain accessible inside the modal dialog.
- **Status Badge**: Positioned top-right of card content header with color mapping corresponding to IUCN Red List classification (*Endangered* = Red `#b71c1c`, *Vulnerable* = Amber `#b45309`, *Least Concern* = Green `#1b5e20`).
- **Stationary Green Aura Micro-Interaction**: Cards remain completely stationary on hover (`transform: none`, no jumping/lifting), accompanied by a signature glowing green aura (`box-shadow: 0 0 24px rgba(27, 94, 32, 0.28), 0 8px 32px -4px rgba(27, 94, 32, 0.38); border-color: var(--color-primary);`) inspired by PojoGalaxy's card design pattern.
- **Dynamic Marquee Titles (`.card-marquee-wrapper`)**: When a species common name exceeds the header width, it is constrained to a single line with an 18% right-fade linear gradient mask. On card hover, after a uniform 300ms initial pause (`animation-delay: 0.3s`), the marquee glides smoothly to the left at a constant speed of 50 px/second across all cards, pauses at the end to allow reading, glides back to the start at 50 px/second, pauses, and loops seamlessly back-and-forth matching PojoGalaxy's `CardMarqueeTitle` interaction.

### 5.2 Public Wikimedia API Integration
- Real-time querying of `https://en.wikipedia.org/api/rest_v1/page/summary/{species}` without requiring API keys or authentication.
- Seamlessly appends new verified species cards to the directory on demand.

### 5.3 Form & Inputs
- **Border**: Clean `1.5px solid #64748b` on default.
- **Focus Indicator**: High-visibility 3px outline (`#0284c7`) with 3px offset.
- **Validation**: Dynamic `aria-invalid="true"` indicator with crimson error highlight.
- **Geolocation**: Seamless W3C Geolocation API coordinate autofill with high-accuracy GPS feedback.

### 5.4 Wikimedia Commons Featured Wildlife Pictures Endless Scrolling Engine
- **Mechanism**: W3C `IntersectionObserver` observing `#scroll-sentinel` with `rootMargin: 300px 0px`.
- **API Endpoint**: `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Commons:Featured_pictures/Animals/...&gimlimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&origin=*`.
- **Award-Winning Photography**: Streams high-definition, peer-reviewed DSLR wildlife photography, automatically providing clean 800px width uncropped previews (`imageinfo[0].thumburl`), artist metadata, and licensing info.
- **Geometry**: Strict `0px` border-radius with sharp pulsing loading indicator (zero rounded corners).
