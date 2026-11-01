/**
 * FaunaScope - Global Animal Species Database & Field Observation Portal
 * Page 1 & 2 JavaScript: Dynamic Species Directory, Wikimedia Commons Featured Wildlife & Wikipedia API
 * Adheres strictly to WCAG 2.1 AA/AAA accessibility standards
 * Zero emojis - Pure professional scientific UI
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const speciesGrid = document.getElementById('species-grid');
  const speciesSearchInput = document.getElementById('species-search');
  const announcer = document.getElementById('gallery-status-announcer');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Counts
  const countAll = document.getElementById('count-all');
  const countMammals = document.getElementById('count-mammals');
  const countBirds = document.getElementById('count-birds');
  const countReptiles = document.getElementById('count-reptiles');
  const countAquatic = document.getElementById('count-aquatic');

  // Live Wikipedia API elements
  const wikiForm = document.getElementById('wiki-search-form');
  const wikiInput = document.getElementById('wiki-search-input');
  const wikiStatus = document.getElementById('wiki-status');

  // Endless Scrolling Sentinel Elements
  const scrollSentinel = document.getElementById('scroll-sentinel');
  const sentinelText = document.getElementById('sentinel-text');

  // Accessible Modal Elements
  const speciesModal = document.getElementById('species-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  let lastActiveElement = null;

  // State
  let speciesData = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let isLoadingMore = false;
  let infiniteObserver = null;

  // Wikimedia Commons Featured Wildlife Categories Mapping
  const categoryWikimediaMap = {
    'all': 'Commons:Featured_pictures/Animals/Mammals|Commons:Featured_pictures/Animals/Birds|Commons:Featured_pictures/Animals/Reptiles|Commons:Featured_pictures/Animals/Amphibians|Commons:Featured_pictures/Animals/Fish',
    'mammal': 'Commons:Featured_pictures/Animals/Mammals',
    'bird': 'Commons:Featured_pictures/Animals/Birds',
    'reptile': 'Commons:Featured_pictures/Animals/Reptiles',
    'aquatic': 'Commons:Featured_pictures/Animals/Amphibians|Commons:Featured_pictures/Animals/Fish'
  };

  const categoryTokens = {
    'all': null,
    'mammal': null,
    'bird': null,
    'reptile': null,
    'aquatic': null
  };

  const categoryHasMore = {
    'all': true,
    'mammal': true,
    'bird': true,
    'reptile': true,
    'aquatic': true
  };

  const batchCounters = {
    'all': 1,
    'mammal': 1,
    'bird': 1,
    'reptile': 1,
    'aquatic': 1
  };

  // Deduplication registries: prevents burst frames (e.g. 016a, 016b, 016c) and repeated animals
  const seenBurstGroups = new Set();
  const seenSpeciesKeys = new Set();

  // ----------------------------------------------------------------------------
  // Offline Fallback Dataset (Guarantees 100% operation even offline in lab exams)
  // ----------------------------------------------------------------------------
  const fallbackSpecies = [
    {
      id: "sp-001",
      commonName: "Bengal Tiger",
      scientificName: "Panthera tigris tigris",
      class: "Mammalia",
      category: "mammal",
      status: "Endangered",
      statusCode: "EN",
      diet: "Carnivore",
      habitat: "Tropical rainforests, alluvial grasslands, and mangrove swamps",
      range: "Indian Subcontinent (India, Nepal, Bhutan, Bangladesh)",
      lifespan: "10 - 15 Years (Wild)",
      weight: "140 - 260 kg",
      summary: "The Bengal tiger is an apex predator recognized for its iconic orange coat with black stripes. It plays a critical keystone role in regulating herbivore populations and maintaining the ecological balance of deciduous and evergreen forests.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/960px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg",
      imageAlt: "A royal Bengal tiger photographed in Sanjay Dubri Tiger Reserve - Wikimedia Commons",
      wikipediaTitle: "Bengal_tiger"
    },
    {
      id: "sp-002",
      commonName: "African Bush Elephant",
      scientificName: "Loxodonta africana",
      class: "Mammalia",
      category: "mammal",
      status: "Endangered",
      statusCode: "EN",
      diet: "Herbivore",
      habitat: "Savannas, grasslands, woodlands, and floodplains",
      range: "Sub-Saharan Africa across 37 range states",
      lifespan: "60 - 70 Years",
      weight: "4,000 - 7,000 kg",
      summary: "The African bush elephant is the largest living terrestrial animal. Known for high cognitive capabilities, complex matriarchal social structures, and specialized communications, it shapes entire ecosystems as an ecological landscape engineer.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg/960px-178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg",
      imageAlt: "A male African bush elephant in Etosha National Park - Wikimedia Commons Featured Picture",
      wikipediaTitle: "African_bush_elephant"
    },
    {
      id: "sp-003",
      commonName: "Snow Leopard",
      scientificName: "Panthera uncia",
      class: "Mammalia",
      category: "mammal",
      status: "Vulnerable",
      statusCode: "VU",
      diet: "Carnivore",
      habitat: "Alpine and subalpine zones across rugged cliffs and rocky crags",
      range: "Central and South Asian mountain ranges",
      lifespan: "15 - 18 Years",
      weight: "30 - 55 kg",
      summary: "Known as the ghost of the mountains, the snow leopard possesses thick smoky-grey fur with dark rosettes, broad paws functioning as natural snowshoes, and a long muscular tail used for balance on steep mountain precipices.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Irbis4.JPG/960px-Irbis4.JPG",
      imageAlt: "A snow leopard resting alertly on high mountain rocks - Wikimedia Commons",
      wikipediaTitle: "Snow_leopard"
    },
    {
      id: "sp-004",
      commonName: "Giant Panda",
      scientificName: "Ailuropoda melanoleuca",
      class: "Mammalia",
      category: "mammal",
      status: "Vulnerable",
      statusCode: "VU",
      diet: "Herbivore (Specialized Folivore)",
      habitat: "Montane temperate broadleaf and mixed bamboo forests",
      range: "South-central China (Sichuan, Shaanxi, and Gansu provinces)",
      lifespan: "20 Years (Wild), up to 30 Years (Managed care)",
      weight: "70 - 120 kg",
      summary: "The giant panda is recognized worldwide for its distinct black and white pelage. Despite having the digestive system of a carnivore, its diet consists of over 99% bamboo shoots and leaves, requiring it to feed for up to 14 hours per day.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/960px-Grosser_Panda.JPG",
      imageAlt: "A giant panda feeding on bamboo - Wikimedia Commons Featured Picture",
      wikipediaTitle: "Giant_panda"
    },
    {
      id: "sp-005",
      commonName: "Bald Eagle",
      scientificName: "Haliaeetus leucocephalus",
      class: "Aves",
      category: "bird",
      status: "Least Concern",
      statusCode: "LC",
      diet: "Carnivore (Piscivore & Scavenger)",
      habitat: "Large bodies of open water with abundant fish and old-growth trees",
      range: "North America (Alaska, Canada, contiguous United States, and Mexico)",
      lifespan: "20 - 30 Years",
      weight: "3 - 6.3 kg",
      summary: "The bald eagle is an apex avian raptor characterized by its white head and tail contrasting with dark brown body plumage. Utilizing exceptional binocular vision, it can spot fish from over a kilometer high before executing rapid aerial dives.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/960px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg",
      imageAlt: "A bald eagle about to take flight in Alaska - Wikimedia Commons Featured Picture",
      wikipediaTitle: "Bald_eagle"
    },
    {
      id: "sp-006",
      commonName: "Peregrine Falcon",
      scientificName: "Falco peregrinus",
      class: "Aves",
      category: "bird",
      status: "Least Concern",
      statusCode: "LC",
      diet: "Carnivore (Avian Specialist)",
      habitat: "Open landscapes, river valleys, coastal cliffs, and urban skyscrapers",
      range: "Cosmopolitan distribution across every continent except Antarctica",
      lifespan: "13 - 17 Years",
      weight: "0.7 - 1.5 kg",
      summary: "The peregrine falcon is celebrated as the fastest member of the animal kingdom. During its high-speed hunting stoop (vertical dive), it routinely reaches aerodynamic velocities exceeding 320 km/h (200 mph) to intercept prey mid-flight.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg/960px-Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg",
      imageAlt: "A peregrine falcon perched alertly at Humber Bay Park - Wikimedia Commons",
      wikipediaTitle: "Peregrine_falcon"
    },
    {
      id: "sp-007",
      commonName: "Emperor Penguin",
      scientificName: "Aptenodytes forsteri",
      class: "Aves",
      category: "bird",
      status: "Near Threatened",
      statusCode: "NT",
      diet: "Carnivore (Piscivore & Cephalopods)",
      habitat: "Antarctic sea ice and surrounding sub-zero marine waters",
      range: "Antarctica exclusively (Circumpolar distribution)",
      lifespan: "15 - 20 Years",
      weight: "22 - 45 kg",
      summary: "The emperor penguin is the tallest and heaviest of all living penguin species. It breeds during the harsh Antarctic winter, where males fast for over two months while incubating a single egg on their feet beneath an insulated brood pouch.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg",
      imageAlt: "Emperor penguins on Antarctic ice at Snow Hill Island - Wikimedia Commons Featured Picture",
      wikipediaTitle: "Emperor_penguin"
    },
    {
      id: "sp-008",
      commonName: "Green Sea Turtle",
      scientificName: "Chelonia mydas",
      class: "Reptilia",
      category: "reptile",
      status: "Endangered",
      statusCode: "EN",
      diet: "Herbivore (Adults feed primarily on Seagrass)",
      habitat: "Tropical and subtropical coastal reefs and seagrass beds",
      range: "Atlantic, Pacific, and Indian Oceans",
      lifespan: "70 - 80+ Years",
      weight: "110 - 190 kg",
      summary: "The green sea turtle is a marine reptile named for the greenish tint of its subdermal fat tissue. As primary grazers of seagrass beds, green turtles keep ocean meadows trimmed and productive, which provides nursery habitats for juvenile marine species.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg/960px-Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg",
      imageAlt: "A green sea turtle swimming in clear waters of Moorea - Wikimedia Commons Featured Picture",
      wikipediaTitle: "Green_sea_turtle"
    },
    {
      id: "sp-009",
      commonName: "King Cobra",
      scientificName: "Ophiophagus hannah",
      class: "Reptilia",
      category: "reptile",
      status: "Vulnerable",
      statusCode: "VU",
      diet: "Carnivore (Ophiophagous - Feeds on other snakes)",
      habitat: "Dense highland forests, bamboo thickets, and agricultural plantations",
      range: "South and Southeast Asia (India, southern China, and Indonesia)",
      lifespan: "20 Years",
      weight: "6 - 10 kg (Length up to 5.5 meters)",
      summary: "The king cobra is the longest venomous snake in the world. It is the only known snake species in which the female builds an elaborate above-ground nest from leaf litter and defends her clutch of eggs until hatching.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/12_-_The_Mystical_King_Cobra_and_Coffee_Forests.jpg/960px-12_-_The_Mystical_King_Cobra_and_Coffee_Forests.jpg",
      imageAlt: "A king cobra in forest habitat - Wikimedia Commons",
      wikipediaTitle: "King_cobra"
    },
    {
      id: "sp-010",
      commonName: "Blue Whale",
      scientificName: "Balaenoptera musculus",
      class: "Mammalia",
      category: "aquatic",
      status: "Endangered",
      statusCode: "EN",
      diet: "Carnivore (Filter Feeder - Euphausiids / Krill)",
      habitat: "Open pelagic oceans ranging from polar feeding waters to equatorial breeding zones",
      range: "All oceans globally except the Arctic",
      lifespan: "80 - 90 Years",
      weight: "100,000 - 190,000 kg (Length up to 30 meters)",
      summary: "The blue whale is the largest known animal ever to have inhabited the planet. Consuming up to four metric tons of krill daily using baleen plates, this oceanic giant plays a vital role in global marine nutrient cycling.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/960px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg",
      imageAlt: "A massive blue whale near the oceanic surface - Wikimedia Commons NOAA Archive",
      wikipediaTitle: "Blue_whale"
    },
    {
      id: "sp-011",
      commonName: "Red Panda",
      scientificName: "Ailurus fulgens",
      class: "Mammalia",
      category: "mammal",
      status: "Endangered",
      statusCode: "EN",
      diet: "Herbivore / Omnivore (Mainly Bamboo, berries, and acorns)",
      habitat: "Temperate montane forests with dense bamboo understories",
      range: "Eastern Himalayas and southwestern China",
      lifespan: "8 - 12 Years",
      weight: "3 - 6.2 kg",
      summary: "The red panda is an arboreal mammal with dense reddish-brown fur, a ringed tail for balance and winter warmth, and a false thumb (an elongated wrist bone) that facilitates grasping slender bamboo stems.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Red_Panda%2C_Gentle_Tree-Dweller_of_the_Himalayas.jpg/960px-Red_Panda%2C_Gentle_Tree-Dweller_of_the_Himalayas.jpg",
      imageAlt: "A red panda resting in tree branches - Wikimedia Commons",
      wikipediaTitle: "Red_panda"
    },
    {
      id: "sp-012",
      commonName: "Red-Eyed Tree Frog",
      scientificName: "Agalychnis callidryas",
      class: "Amphibia",
      category: "aquatic",
      status: "Least Concern",
      statusCode: "LC",
      diet: "Carnivore (Insectivore)",
      habitat: "Lowland rainforests and cloud forests near freshwater streams and ponds",
      range: "Neotropical regions from southern Mexico through Central America to Colombia",
      lifespan: "5 Years",
      weight: "6 - 15 grams",
      summary: "The red-eyed tree frog is an iconic arboreal amphibian with vivid neon green coloration, bright orange webbed feet, and striking crimson eyes. It relies on startle coloration (deimatic display) to momentarily confuse avian and reptilian predators.",
      imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Red-eyed_Tree_Frog_%28Agalychnis_callidryas%29_1.png/960px-Red-eyed_Tree_Frog_%28Agalychnis_callidryas%29_1.png",
      imageAlt: "A vivid green red-eyed tree frog on a rainforest leaf - Wikimedia Commons Featured Picture",
      wikipediaTitle: "Agalychnis_callidryas"
    }
  ];

  // ----------------------------------------------------------------------------
  // Data Fetching Function (Dynamic fetch with graceful offline fallback)
  // ----------------------------------------------------------------------------
  async function loadSpeciesData() {
    try {
      // Attempt to query full-stack backend REST API endpoint first, fallback to static JSON
      let response = await fetch('/api/species').catch(() => null);
      if (!response || !response.ok) {
        response = await fetch('data/species.json');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      speciesData = await response.json();
    } catch (error) {
      console.warn('Local fetch error or offline protocol detected. Falling back to built-in dataset:', error);
      speciesData = [...fallbackSpecies];
    }

    // Check for URL query parameter (e.g. from Page 1 Hero Quick Search)
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search');
    if (initialSearch && speciesSearchInput) {
      speciesSearchInput.value = initialSearch;
      searchQuery = initialSearch.toLowerCase();
    }

    // Register baseline species into deduplication registry
    speciesData.forEach(s => {
      const key = (s.commonName || '').toLowerCase().replace(/[^a-z]/g, '');
      if (key) seenSpeciesKeys.add(key);
    });

    updateCategoryCounts();
    renderSpeciesCards();
    initInfiniteScroll();
  }

  // ----------------------------------------------------------------------------
  // Category Counts
  // ----------------------------------------------------------------------------
  function updateCategoryCounts() {
    if (countAll) countAll.textContent = `(${speciesData.length})`;
    if (countMammals) countMammals.textContent = `(${speciesData.filter(s => s.category === 'mammal').length})`;
    if (countBirds) countBirds.textContent = `(${speciesData.filter(s => s.category === 'bird').length})`;
    if (countReptiles) countReptiles.textContent = `(${speciesData.filter(s => s.category === 'reptile').length})`;
    if (countAquatic) countAquatic.textContent = `(${speciesData.filter(s => s.category === 'aquatic').length})`;
  }

  // ----------------------------------------------------------------------------
  // Filter & Search Logic
  // ----------------------------------------------------------------------------
  function getFilteredSpecies() {
    return speciesData.filter(species => {
      const matchesCategory = (currentCategory === 'all') || (species.category === currentCategory);
      const matchesSearch = !searchQuery || 
        species.commonName.toLowerCase().includes(searchQuery) ||
        species.scientificName.toLowerCase().includes(searchQuery) ||
        species.class.toLowerCase().includes(searchQuery) ||
        species.habitat.toLowerCase().includes(searchQuery) ||
        species.diet.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });
  }

  // ----------------------------------------------------------------------------
  // Render Dynamic Cards
  // ----------------------------------------------------------------------------
  function renderSpeciesCards() {
    if (!speciesGrid) return;
    speciesGrid.innerHTML = '';

    const filtered = getFilteredSpecies();

    if (announcer) {
      announcer.textContent = `Showing ${filtered.length} animal species matching your criteria.`;
    }

    if (filtered.length === 0) {
      speciesGrid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; border: 1px dashed var(--color-border); background: var(--color-bg-light);">
          <h3 style="color: var(--color-text-dark); margin-bottom: 0.5rem;">No Species Found</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1rem;">No animal species matched "${escapeHtml(searchQuery)}" in this classification.</p>
          <button type="button" class="btn btn-outline" id="reset-filters-btn">Reset Search &amp; Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentCategory = 'all';
          searchQuery = '';
          if (speciesSearchInput) speciesSearchInput.value = '';
          setActiveFilterButton('all');
          renderSpeciesCards();
        });
      }
      return;
    }

    filtered.forEach(species => {
      speciesGrid.appendChild(createSpeciesCardElement(species));
    });

    // Attach event listeners to modal buttons
    attachDossierButtons();
    requestAnimationFrame(() => initCardMarquees(speciesGrid));
  }

  // ----------------------------------------------------------------------------
  // Card Marquee Engine (PojoGalaxy Signature Behavior)
  // Glides overflowing titles smoothly left to reveal, pauses, glides back to start, and loops
  // ----------------------------------------------------------------------------
  function initCardMarquees(scopeElement) {
    const scope = scopeElement || document;
    const wrappers = scope.querySelectorAll('.card-marquee-wrapper');
    wrappers.forEach(wrapper => {
      const textSpan = wrapper.querySelector('.marquee-text');
      if (!textSpan) return;

      const containerWidth = wrapper.clientWidth;
      const textWidth = textSpan.scrollWidth;

      if (containerWidth > 0 && textWidth - containerWidth > 3) {
        const overflowDistance = textWidth - containerWidth + 14; // 14px breathing room at end
        // Constant speed pacing: 50 px/sec across every single card title (PojoGalaxy standard)
        // With forward glide occupying 45% of the keyframe timeline:
        // duration = (overflowDistance / SPEED) / 0.45
        const CONSTANT_SPEED = 50; // pixels per second
        const forwardGlideTime = overflowDistance / CONSTANT_SPEED;
        const totalDuration = Math.max(2.4, forwardGlideTime / 0.45);

        const newSlide = `-${overflowDistance}px`;
        const newDuration = `${totalDuration.toFixed(2)}s`;

        if (!wrapper.classList.contains('has-overflow')) wrapper.classList.add('has-overflow');
        if (!textSpan.classList.contains('has-overflow')) textSpan.classList.add('has-overflow');
        if (textSpan.style.getPropertyValue('--slide-dist') !== newSlide) {
          textSpan.style.setProperty('--slide-dist', newSlide);
        }
        if (textSpan.style.getPropertyValue('--marquee-duration') !== newDuration) {
          textSpan.style.setProperty('--marquee-duration', newDuration);
        }
      } else {
        wrapper.classList.remove('has-overflow');
        textSpan.classList.remove('has-overflow');
        textSpan.style.removeProperty('--slide-dist');
        textSpan.style.removeProperty('--marquee-duration');
      }
    });
  }

  function createSpeciesCardElement(species) {
    const card = document.createElement('article');
    card.className = 'pet-card';
    card.setAttribute('aria-labelledby', `species-heading-${species.id}`);

    // Status badge color class
    let badgeClass = 'badge-least-concern';
    const statusLower = (species.status || '').toLowerCase();
    if (species.isFeatured || statusLower.includes('featured')) {
      badgeClass = 'badge-featured';
    } else if (statusLower.includes('endangered') || statusLower.includes('threatened')) {
      badgeClass = 'badge-endangered';
    } else if (statusLower.includes('vulnerable')) {
      badgeClass = 'badge-vulnerable';
    } else if (species.isLiveApi) {
      badgeClass = 'badge-live-api';
    }

    card.innerHTML = `
      <div class="pet-card-image-wrap">
        <img src="${escapeHtml(species.imageUrl)}" 
             alt="${escapeHtml(species.imageAlt || species.commonName)}" 
             class="pet-card-img" 
             loading="lazy" 
             width="800" 
             height="533"
             onerror="this.onerror=null; this.src='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/960px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg';">
      </div>
      <div class="pet-card-body">
        <div class="pet-card-header">
          <div class="card-marquee-wrapper" title="${escapeHtml(species.commonName)}">
            <h3 id="species-heading-${species.id}" class="pet-name">
              <span class="marquee-text">${escapeHtml(species.commonName)}</span>
            </h3>
          </div>
          <span class="pet-status-badge ${badgeClass}">${escapeHtml(species.status || 'Verified')}</span>
        </div>
        <div class="species-sub-header">
          <div class="card-marquee-wrapper" title="${escapeHtml(species.scientificName)}">
            <span class="species-scientific-name" style="margin-bottom: 0;">
              <span class="marquee-text">${escapeHtml(species.scientificName)}</span>
            </span>
          </div>
          <span class="species-class-label">${escapeHtml(species.class)}</span>
        </div>
        
        <div class="species-meta-row">
          <div><strong>Diet:</strong> ${escapeHtml(species.diet)}</div>
          <div><strong>Lifespan:</strong> ${escapeHtml(species.lifespan)}</div>
          <div><strong>Habitat:</strong> ${escapeHtml(species.habitat)}</div>
        </div>

        <p class="pet-story" title="${escapeHtml(species.summary)}">${escapeHtml(species.summary)}</p>

        <div class="pet-card-footer">
          <button type="button" 
                  class="btn btn-primary full-width view-dossier-btn" 
                  data-species-id="${escapeHtml(species.id)}"
                  aria-haspopup="dialog">
            View Species Dossier
          </button>
        </div>
      </div>
    `;

    // Re-measure marquee whenever cursor enters card
    card.addEventListener('mouseenter', () => initCardMarquees(card));

    return card;
  }

  // ----------------------------------------------------------------------------
  // Wikimedia Commons Featured Wildlife Pictures Endless Scrolling Engine
  // Fetches award-winning, peer-reviewed DSLR wildlife photography via MediaWiki API
  // ----------------------------------------------------------------------------
  async function fetchMoreFromWikimediaFeatured() {
    if (isLoadingMore || !categoryHasMore[currentCategory] || searchQuery.length > 0) return;
    isLoadingMore = true;

    const currentBatch = batchCounters[currentCategory] || 1;
    if (sentinelText) {
      sentinelText.textContent = `Connecting to Wikimedia Commons. Streaming award-winning wildlife photography (Batch ${currentBatch})...`;
    }

    try {
      const titles = categoryWikimediaMap[currentCategory] || categoryWikimediaMap['all'];
      let apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=${encodeURIComponent(titles)}&gimlimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&origin=*`;

      const token = categoryTokens[currentCategory];
      if (token && token.gimcontinue) {
        apiUrl += `&continue=${encodeURIComponent(token.continue || 'gimcontinue||')}&gimcontinue=${encodeURIComponent(token.gimcontinue)}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Wikimedia Commons API returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.continue && data.continue.gimcontinue) {
        categoryTokens[currentCategory] = data.continue;
      } else {
        categoryHasMore[currentCategory] = false;
      }

      if (!data.query || !data.query.pages) {
        if (!categoryHasMore[currentCategory] && sentinelText) {
          sentinelText.textContent = 'All available featured wildlife images loaded for this classification.';
        }
        isLoadingMore = false;
        return;
      }

      const pages = Object.values(data.query.pages);
      const newBatch = [];

      pages.forEach(page => {
        if (!page.imageinfo || !page.imageinfo[0]) return;
        const info = page.imageinfo[0];
        const title = page.title || '';

        // Exclude non-photo files, svgs, icons, UI assets, and non-living specimens
        const lowerTitle = title.toLowerCase();
        if (
          lowerTitle.endsWith('.svg') ||
          lowerTitle.endsWith('.gif') ||
          lowerTitle.endsWith('.pdf') ||
          lowerTitle.includes('silhouette') ||
          lowerTitle.includes('noun project') ||
          lowerTitle.includes('icon') ||
          lowerTitle.includes('logo') ||
          lowerTitle.includes('chart') ||
          lowerTitle.includes('diagram') ||
          lowerTitle.includes('dead') ||
          lowerTitle.includes('fossil') ||
          lowerTitle.includes('skeleton') ||
          lowerTitle.includes('skull') ||
          lowerTitle.includes('carcass') ||
          lowerTitle.includes('bone') ||
          lowerTitle.includes('beachcomber')
        ) {
          return;
        }

        // Clean raw filename into readable subject string
        let rawSubject = title
          .replace(/^File:/i, '')
          .replace(/\.(jpe?g|png|webp|tif?f)$/i, '')
          .replace(/\s*Photo by.*$/i, '')
          .replace(/\s*\(d\.j\.b\.\).*$/i, '')
          .replace(/_/g, ' ')
          .trim();

        // 1. Detect and deduplicate photoshoot burst sequences (e.g. 016a, 016b, 016c)
        const burstMatch = rawSubject.match(/^(\d+)([a-z]?)\s+(.*)$/i);
        let burstGroupId = null;
        let cleanSubject = rawSubject;

        if (burstMatch) {
          burstGroupId = burstMatch[1]; // e.g. "016"
          cleanSubject = burstMatch[3].trim();
        }

        // If another shot from this exact camera burst/series was already accepted, skip sequential frames
        if (burstGroupId && seenBurstGroups.has(burstGroupId)) {
          return;
        }

        if (cleanSubject.length < 3) return;

        // 2. Derive concise, elegant Common Name
        let commonName = cleanSubject
          .replace(/^(?:A\s+pair\s+of|Pod\s+of|Herd\s+of|Group\s+of|Flock\s+of|A\s+)\s*/i, '')
          .split(/\s+(?:dust bathing|breaching|swimming|jumping|cuddling|sunbathing|taking off|in flight|feeding|standing|perched|lobtailing|close-up|face close-up|eating|sleeping|hunting|walking|resting|running|drinking|mating|flying)\b/i)[0]
          .replace(/\s*\([^)]*\)/g, '')
          .trim();

        // Strip location if attached at end (e.g. "Wild marmot at Grand Muveran" -> "Wild Marmot")
        const locMatch = commonName.match(/^(.*?)\s+(?:in|at|near|of)\s+[A-Z]/);
        if (locMatch && locMatch[1].length >= 3) {
          commonName = locMatch[1].trim();
        }

        if (commonName.length < 3) commonName = cleanSubject;
        commonName = commonName.replace(/^\w/, c => c.toUpperCase());

        // 3. Deduplicate by species: ensure every card in the grid represents a unique animal
        const speciesKey = commonName.toLowerCase().replace(/[^a-z]/g, '');
        if (seenSpeciesKeys.has(speciesKey)) {
          return;
        }

        // Extract metadata
        const meta = info.extmetadata || {};

        // Extract Artist (strip HTML)
        let artist = 'Wildlife Photographer';
        if (meta.Artist && meta.Artist.value) {
          const tmp = document.createElement('div');
          tmp.innerHTML = meta.Artist.value;
          const parsedArtist = (tmp.textContent || tmp.innerText || '').trim();
          if (parsedArtist && parsedArtist.length < 50) {
            artist = parsedArtist;
          }
        }

        // Extract Description (strip HTML)
        let summary = '';
        if (meta.ImageDescription && meta.ImageDescription.value) {
          const tmp = document.createElement('div');
          tmp.innerHTML = meta.ImageDescription.value;
          let text = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
          if (text.length > 200) {
            text = text.substring(0, 197) + '...';
          }
          summary = text;
        }

        if (!summary || summary.length < 15) {
          summary = `${commonName} is an award-winning wildlife photograph recognized as a Featured Picture on Wikimedia Commons for its outstanding biological clarity and natural habitat composition.`;
        }

        // 4. Taxonomic class & category mapping
        let assignedCat = currentCategory !== 'all' ? currentCategory : 'mammal';
        let className = 'Mammalia';
        const lowerMeta = ((meta.Categories ? meta.Categories.value : '') + ' ' + title).toLowerCase();

        if (currentCategory === 'bird' || lowerMeta.includes('bird') || lowerMeta.includes('aves')) {
          assignedCat = 'bird';
          className = 'Aves';
        } else if (currentCategory === 'reptile' || lowerMeta.includes('reptil') || lowerMeta.includes('snake') || lowerMeta.includes('lizard') || lowerMeta.includes('caiman')) {
          assignedCat = 'reptile';
          className = 'Reptilia';
        } else if (currentCategory === 'aquatic' || lowerMeta.includes('amphib') || lowerMeta.includes('frog') || lowerMeta.includes('toad') || lowerMeta.includes('fish') || lowerMeta.includes('whale') || lowerMeta.includes('dolphin')) {
          assignedCat = 'aquatic';
          className = lowerMeta.includes('fish') ? 'Actinopterygii' : (lowerMeta.includes('frog') || lowerMeta.includes('toad') ? 'Amphibia' : 'Marine Species');
        } else if (currentCategory === 'mammal' || lowerMeta.includes('mammal')) {
          assignedCat = 'mammal';
          className = 'Mammalia';
        }

        // 5. Scientific Binomial Extraction (clean, professional - zero raw filenames)
        let scientificName = (meta.ObjectName && meta.ObjectName.value) ? meta.ObjectName.value.trim() : '';
        const parenMatch = (title + ' ' + summary).match(/\(([A-Z][a-z]+(?:\s+[a-z]+)+)\)/);
        if (parenMatch) {
          scientificName = parenMatch[1];
        } else if (!scientificName) {
          const latinMatch = summary.match(/\b([A-Z][a-z]+\s+[a-z]+)\b/);
          if (latinMatch && !['National Park', 'South America', 'North America', 'New Zealand', 'Costa Rica', 'United States'].includes(latinMatch[1])) {
            scientificName = latinMatch[1];
          }
        }
        if (!scientificName || scientificName.length < 3 || scientificName.toLowerCase().includes('file:') || scientificName.includes('016')) {
          scientificName = `${className} Species Observation`;
        }

        // Capture Date & License
        const dateRaw = meta.DateTimeOriginal?.value || meta.DateTime?.value || '';
        const captureDate = dateRaw ? dateRaw.substring(0, 10) : 'Archive Record';
        const license = meta.LicenseShortName?.value || 'CC BY-SA';

        // Prevent duplicates
        const pageKey = 'wiki-feat-' + page.pageid;
        const isDuplicate = speciesData.some(s => s.id === pageKey || s.imageUrl === (info.thumburl || info.url));
        if (isDuplicate) return;

        // Register in deduplication sets
        if (burstGroupId) seenBurstGroups.add(burstGroupId);
        seenSpeciesKeys.add(speciesKey);

        newBatch.push({
          id: pageKey,
          commonName: commonName,
          scientificName: scientificName,
          class: className,
          category: assignedCat,
          status: 'Featured Picture',
          statusCode: 'FEATURED',
          diet: 'Observed in natural habitat',
          habitat: `Photographer: ${artist}`,
          range: 'Wikimedia Commons Featured Collection',
          lifespan: `Recorded: ${captureDate}`,
          weight: `License: ${license}`,
          summary: summary,
          imageUrl: info.thumburl || info.url,
          imageAlt: `${commonName} photographed by ${artist} - Wikimedia Commons Featured Wildlife`,
          wikipediaTitle: scientificName ? scientificName.replace(/\s+/g, '_') : commonName.replace(/\s+/g, '_'),
          isFeatured: true,
          attribution: `${artist} (${license})`
        });
      });

      if (newBatch.length > 0) {
        speciesData.push(...newBatch);
        batchCounters[currentCategory] = currentBatch + 1;
        updateCategoryCounts();

        // Dynamically append new cards into DOM
        newBatch.forEach(species => {
          speciesGrid.appendChild(createSpeciesCardElement(species));
        });

        attachDossierButtons();
        requestAnimationFrame(() => initCardMarquees(speciesGrid));

        if (announcer) {
          announcer.textContent = `Loaded ${newBatch.length} featured wildlife photographs from Wikimedia Commons. Total cataloged: ${speciesData.length}.`;
        }
      }

      if (sentinelText) {
        if (categoryHasMore[currentCategory]) {
          sentinelText.textContent = 'Scroll down to discover more featured wildlife photography...';
        } else {
          sentinelText.textContent = 'All available featured wildlife images loaded for this classification.';
        }
      }
    } catch (err) {
      console.warn('Wikimedia Commons API network pause or offline mode:', err);
      if (sentinelText) {
        sentinelText.innerHTML = `
          Endless stream paused. <button type="button" class="sentinel-retry-btn" id="retry-wiki-btn">Load More Featured Images</button>
        `;
        const retryBtn = document.getElementById('retry-wiki-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            isLoadingMore = false;
            fetchMoreFromWikimediaFeatured();
          });
        }
      }
    } finally {
      isLoadingMore = false;
    }
  }

  function initInfiniteScroll() {
    if (!scrollSentinel) return;

    if (infiniteObserver) {
      infiniteObserver.disconnect();
    }

    infiniteObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !isLoadingMore && categoryHasMore[currentCategory] && !searchQuery) {
        fetchMoreFromWikimediaFeatured();
      }
    }, {
      root: null,
      rootMargin: '300px 0px',
      threshold: 0.1
    });

    infiniteObserver.observe(scrollSentinel);
  }

  // ----------------------------------------------------------------------------
  // Live Wikipedia REST API Integration
  // ----------------------------------------------------------------------------
  if (wikiForm && wikiInput && wikiStatus) {
    wikiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = wikiInput.value.trim();

      if (!query) {
        wikiStatus.textContent = 'Please enter an animal or species name to query Wikipedia.';
        wikiStatus.className = 'status-msg status-error';
        return;
      }

      wikiStatus.textContent = `Querying public Wikipedia REST API for "${query}"...`;
      wikiStatus.className = 'status-msg status-info';

      try {
        const encodedTitle = encodeURIComponent(query.replace(/\s+/g, '_'));
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`);

        if (!response.ok) {
          throw new Error(`Wikipedia entry not found (Status ${response.status})`);
        }

        const data = await response.json();

        // Check if page has useful content
        if (!data.extract) {
          throw new Error('Wikipedia returned an empty extract for this species.');
        }

        // Prepare new species entry
        const liveSpecies = {
          id: 'wiki-' + Math.floor(1000 + Math.random() * 9000),
          commonName: data.title,
          scientificName: data.description || 'Public Biological Record',
          class: 'Taxonomic Record',
          category: 'all',
          status: 'Live Wikipedia Data',
          statusCode: 'WIKI',
          diet: 'Refer to encyclopedia dossier',
          habitat: 'Documented in scientific range notes',
          range: 'Global Distribution',
          lifespan: 'Documented in full record',
          weight: 'Varies by subspecies',
          summary: data.extract,
          imageUrl: data.originalimage?.source || data.thumbnail?.source || 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/960px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg',
          imageAlt: `Photograph of ${data.title} from Wikimedia commons`,
          wikipediaTitle: data.title,
          isLiveApi: true
        };

        // Prepend to species array
        speciesData.unshift(liveSpecies);
        updateCategoryCounts();
        renderSpeciesCards();

        wikiStatus.textContent = `Successfully fetched live scientific profile for "${data.title}" from Wikipedia! Card added to top of directory.`;
        wikiStatus.className = 'status-msg status-success';
        wikiInput.value = '';

        // Announce to screen readers
        if (announcer) {
          announcer.textContent = `Live record for ${data.title} fetched from Wikipedia and added to database directory.`;
        }
      } catch (err) {
        wikiStatus.textContent = `Could not load live Wikipedia data for "${query}". Note: Requires active internet connection. Please verify species spelling or browse our local verified dataset.`;
        wikiStatus.className = 'status-msg status-error';
      }
    });
  }

  // ----------------------------------------------------------------------------
  // Modal Dossier Dialog Management
  // ----------------------------------------------------------------------------
  function attachDossierButtons() {
    const buttons = document.querySelectorAll('.view-dossier-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const speciesId = btn.getAttribute('data-species-id');
        const species = speciesData.find(s => s.id === speciesId);
        if (!species) return;

        lastActiveElement = btn;
        openSpeciesModal(species);
      });
    });
  }

  function openSpeciesModal(species) {
    if (!speciesModal) return;

    document.getElementById('modal-species-name').textContent = species.commonName;
    document.getElementById('modal-species-scientific').textContent = species.scientificName;
    document.getElementById('modal-species-class').textContent = species.class;
    document.getElementById('modal-species-status').textContent = species.status || 'Cataloged';
    document.getElementById('modal-species-diet').textContent = species.diet || 'N/A';
    document.getElementById('modal-species-habitat').textContent = species.habitat || 'N/A';
    document.getElementById('modal-species-range').textContent = species.range || 'N/A';
    document.getElementById('modal-species-lifespan').textContent = species.lifespan || 'N/A';
    document.getElementById('modal-species-weight').textContent = species.weight || 'N/A';
    document.getElementById('modal-species-summary').textContent = species.summary;

    const modalImg = document.getElementById('modal-species-img');
    if (modalImg) {
      modalImg.src = species.imageUrl;
      modalImg.alt = species.imageAlt || species.commonName;
    }

    const wikiLink = document.getElementById('modal-wiki-link');
    if (wikiLink) {
      wikiLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(species.wikipediaTitle || species.commonName)}`;
      wikiLink.textContent = `Read Complete Entry for ${species.commonName} on Wikipedia`;
    }

    speciesModal.showModal();
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  if (modalCloseBtn && speciesModal) {
    modalCloseBtn.addEventListener('click', () => {
      speciesModal.close();
      if (lastActiveElement) lastActiveElement.focus();
    });

    speciesModal.addEventListener('cancel', () => {
      if (lastActiveElement) lastActiveElement.focus();
    });

    // Close on backdrop click
    speciesModal.addEventListener('click', (e) => {
      const rect = speciesModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        speciesModal.close();
        if (lastActiveElement) lastActiveElement.focus();
      }
    });
  }

  // ----------------------------------------------------------------------------
  // Filter Buttons Interaction
  // ----------------------------------------------------------------------------
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      currentCategory = category;
      setActiveFilterButton(category);
      renderSpeciesCards();

      // If category has few cards loaded, stream initial batch for this category
      const currentFiltered = getFilteredSpecies();
      if (currentFiltered.length < 6 && categoryHasMore[currentCategory]) {
        fetchMoreFromWikimediaFeatured();
      }
    });
  });

  function setActiveFilterButton(category) {
    filterButtons.forEach(btn => {
      const btnCat = btn.getAttribute('data-category');
      if (btnCat === category) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // ----------------------------------------------------------------------------
  // Search Input Interaction
  // ----------------------------------------------------------------------------
  if (speciesSearchInput) {
    speciesSearchInput.addEventListener('input', () => {
      searchQuery = speciesSearchInput.value.trim().toLowerCase();
      renderSpeciesCards();
    });
  }

  // Helper escape function
  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Window resize observer for marquee calculations
  window.addEventListener('resize', () => {
    initCardMarquees(speciesGrid);
  });

  // Re-measure marquee once custom fonts (Poppins) are loaded and ready
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      initCardMarquees(speciesGrid);
    });
  }

  // Initial load
  loadSpeciesData();
});
