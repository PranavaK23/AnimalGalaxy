# AnimalGalaxy - Global Animal Species Database & Citizen Science Wildlife Portal

A responsive, full-stack, high-accessibility (WCAG 2.1 AA/AAA) web application built for wildlife biodiversity research, biological education, and citizen science observation tracking.

- **GitHub Repository:** [https://github.com/PranavaK23/AnimalGalaxy](https://github.com/PranavaK23/AnimalGalaxy)

---

## Project Structure

```
AnimalGalaxy/
├── index.html            # Page 1 (Main Landing): Global Animal Species Directory & Wikipedia API
├── sighting.html         # Page 2: Citizen Science Wildlife Observation & Geolocation Sighting Portal
├── adoption.html         # Mirror alias of index.html for legacy bookmarks
├── species.html          # Semantic alias for index.html
├── serve.js              # Full-stack Node.js HTTP/REST API server (GET/POST /api/...)
├── css/
│   └── styles.css        # Accessible stylesheet (WCAG 2.1 AA/AAA, 0px sharp geometry)
├── js/
│   ├── species.js        # Page 1 Dynamic JS (Fetch API, Filters, Wikipedia API, Modal)
│   └── discovery.js      # Page 2 Dynamic JS (Geolocation API, Form Validation, REST API)
├── data/
│   ├── species.json      # Curated dataset of 12 iconic species with IUCN status & uncropped photos
│   └── sightings.json    # Persisted citizen science field observation records
└── README.md             # Project documentation and quick start guide
```

---

## Key Features

1. **Dynamic Species Catalog & Taxonomy Filtering:** Full-stack REST API (`GET /api/species`) serving biological profiles across Mammalia, Aves, Reptilia, and Aquatic life.
2. **Real-Time Search Engine:** Instant client-side string matching across common names, scientific binomial names, diets, and native habitats.
3. **Live Wikipedia REST API Integration:** Real-time encyclopedia lookups without authentication barriers.
4. **Wikimedia Commons Infinite Scroll:** Streams uncropped, peer-reviewed DSLR wildlife photography dynamically using the W3C `IntersectionObserver` API and MediaWiki Action API.
5. **Accessible `<dialog>` Modal Species Dossier:** Native HTML5 dialog with focus trapping and complete taxonomic breakdown.
6. **Citizen Science Field Sighting Portal:** Multi-step observation form with high-accuracy W3C GPS Geolocation satellite pinning and server-side persistence (`POST /api/sightings`).

---

## How to Run the Project

1. **Using the Full-Stack Node.js Server:**
   ```bash
   node serve.js
   ```
   - Open [http://localhost:8080/](http://localhost:8080/) in your browser.
   - REST API endpoints available at `/api/species`, `/api/sightings`, and `/api/health`.

2. **Direct Browser Open (Offline Mode):**
   - Double-click `index.html` in your file explorer to open directly in any web browser.
   - Built-in offline fallback data ensures smooth operation even under restricted `file://` protocol.

---

## Web Accessibility (WCAG 2.1 AA/AAA)

- **Skip Link:** Accessible `<a href="#main-content" class="skip-link">` element at top of page.
- **Strict Heading Hierarchy:** Sequential headings (`<h1>` -> `<h2>` -> `<h3>`) with zero skipped levels.
- **Unambiguous Focus Indicators:** 3px solid cyan outline (`#0284c7`) with 3px offset.
- **100% Uncropped Photography:** Images retain natural subject framing via `object-fit: contain`.
- **Zero Emojis:** Clean, professional scientific aesthetic.
- **Lighthouse Accessibility Score:** 100 / 100.
