/**
 * FaunaScope - Global Animal Species Database & Field Observation Portal
 * Page 1 JavaScript: Species Discovery & Geolocation Sighting Form
 * Adheres strictly to WCAG 2.1 AA/AAA accessibility and W3C Geolocation standards
 * Zero emojis - Pure professional scientific UI
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------------------------------
  // 1. Hero Quick Search Handler (Redirects to Species Directory with query)
  // ----------------------------------------------------------------------------
  const heroSearchForm = document.getElementById('hero-species-form');
  const heroSearchInput = document.getElementById('hero-species-search');

  if (heroSearchForm && heroSearchInput) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = heroSearchInput.value.trim();
      if (query.length > 0) {
        window.location.href = `adoption.html?search=${encodeURIComponent(query)}`;
      } else {
        window.location.href = 'adoption.html';
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 2. Wildlife & Species Sighting Geolocation Form Integration
  // ----------------------------------------------------------------------------
  const sightingForm = document.getElementById('wildlife-sighting-form');
  const geoBtn = document.getElementById('geo-btn');
  const latInput = document.getElementById('sighting-lat');
  const lngInput = document.getElementById('sighting-lng');
  const geoStatus = document.getElementById('geo-status');
  const formFeedback = document.getElementById('form-feedback');

  if (geoBtn && latInput && lngInput && geoStatus) {
    geoBtn.addEventListener('click', () => {
      if (!('geolocation' in navigator)) {
        updateGeoStatus('Geolocation is not supported by your current browser. Please enter landmark coordinates manually.', 'error');
        return;
      }

      // Accessible state announcement
      geoBtn.disabled = true;
      geoBtn.setAttribute('aria-busy', 'true');
      updateGeoStatus('Contacting satellite positioning. Acquiring high-accuracy GPS coordinates...', 'info');

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const accuracy = Math.round(position.coords.accuracy);

          latInput.value = lat;
          lngInput.value = lng;

          // Remove any previous invalid indicator
          latInput.removeAttribute('aria-invalid');
          lngInput.removeAttribute('aria-invalid');

          geoBtn.disabled = false;
          geoBtn.removeAttribute('aria-busy');
          updateGeoStatus(`Coordinates pinned: Latitude ${lat}, Longitude ${lng} (Estimated accuracy: within ${accuracy} meters).`, 'success');

          // Highlight the inputs briefly
          latInput.focus();
        },
        (error) => {
          geoBtn.disabled = false;
          geoBtn.removeAttribute('aria-busy');

          let errorMsg = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please allow location access in your browser or enter coordinates manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location signal unavailable. Please ensure GPS / network location is active.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out. Please click Pin My Location again or enter manually.';
              break;
          }
          updateGeoStatus(errorMsg, 'error');
        },
        geoOptions
      );
    });
  }

  function updateGeoStatus(message, type) {
    if (!geoStatus) return;
    geoStatus.textContent = message;
    geoStatus.className = 'status-msg';

    if (type === 'success') {
      geoStatus.classList.add('status-success');
    } else if (type === 'error') {
      geoStatus.classList.add('status-error');
    } else {
      geoStatus.classList.add('status-info');
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Client-Side Accessible Form Validation & Submission
  // ----------------------------------------------------------------------------
  if (sightingForm) {
    sightingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      let firstInvalidField = null;

      // Required fields verification
      const requiredInputs = sightingForm.querySelectorAll('input[required], select[required]');

      requiredInputs.forEach((input) => {
        const errorSpan = document.getElementById(`${input.id}-error`);
        const value = input.value.trim();

        if (!value) {
          isValid = false;
          input.setAttribute('aria-invalid', 'true');
          if (errorSpan) {
            errorSpan.classList.add('visible');
          }
          if (!firstInvalidField) {
            firstInvalidField = input;
          }
        } else {
          input.removeAttribute('aria-invalid');
          if (errorSpan) {
            errorSpan.classList.remove('visible');
          }
        }
      });

      // Email format verification if present
      const emailInput = document.getElementById('observer-email');
      if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailError = document.getElementById('observer-email-error');
        if (!emailRegex.test(emailInput.value.trim())) {
          isValid = false;
          emailInput.setAttribute('aria-invalid', 'true');
          if (emailError) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.add('visible');
          }
          if (!firstInvalidField) firstInvalidField = emailInput;
        }
      }

      if (!isValid) {
        if (formFeedback) {
          formFeedback.className = 'status-box status-error visible';
          formFeedback.textContent = 'Please correct the highlighted form errors before submitting your sighting report.';
        }
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }

      // Process valid submission
      const observerName = document.getElementById('observer-name')?.value.trim() || 'Anonymous Observer';
      const speciesName = document.getElementById('species-name')?.value.trim() || 'Unidentified Species';
      const speciesClass = document.getElementById('species-class')?.value || 'Not Specified';
      const habitat = document.getElementById('sighting-habitat')?.value || 'Not Specified';
      const latVal = latInput?.value || 'N/A';
      const lngVal = lngInput?.value || 'N/A';
      const landmark = document.getElementById('sighting-landmark')?.value.trim() || 'Local Area';

      const observationId = 'OBS-' + Math.floor(100000 + Math.random() * 900000);

      // Persist to Full-Stack Backend REST API with localStorage offline fallback
      const sightingPayload = {
        id: observationId,
        observerName: observerName,
        observerEmail: document.getElementById('observer-email')?.value.trim() || 'observer@nature.org',
        classification: document.getElementById('observer-role')?.value || 'Citizen Scientist',
        speciesObserved: speciesName,
        taxonomicClass: speciesClass,
        habitatType: habitat,
        dateTime: document.getElementById('sighting-datetime')?.value || new Date().toISOString(),
        latitude: latVal,
        longitude: lngVal,
        landmark: landmark,
        fieldNotes: document.getElementById('sighting-notes')?.value.trim() || 'No additional notes'
      };

      // Asynchronous POST to backend REST API
      fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sightingPayload)
      }).catch(apiErr => {
        console.warn('Backend API unavailable, using client-side cache:', apiErr);
      });

      // Persist in local storage for offline resilience
      try {
        const existingSightings = JSON.parse(localStorage.getItem('faunascope_sightings') || '[]');
        existingSightings.push(sightingPayload);
        localStorage.setItem('faunascope_sightings', JSON.stringify(existingSightings));
      } catch (err) {
        // Continue gracefully if storage is restricted
      }

      // Display accessible confirmation
      if (formFeedback) {
        formFeedback.className = 'status-box status-success visible';
        formFeedback.innerHTML = `
          <strong>Field Observation Logged Successfully!</strong><br>
          Record Reference: <strong>${observationId}</strong><br>
          Species: <strong>${speciesName}</strong> (${speciesClass})<br>
          Coordinates: <strong>${latVal}, ${lngVal}</strong> (${landmark})<br>
          Thank you, ${observerName}. Your sighting has been registered into the citizen biodiversity database.
        `;
        formFeedback.focus();
      }

      // Reset form
      sightingForm.reset();
      if (geoStatus) {
        geoStatus.textContent = '';
      }
    });

    // Inline cleanup on user input
    sightingForm.addEventListener('input', (e) => {
      const target = e.target;
      if (target.hasAttribute('aria-invalid')) {
        target.removeAttribute('aria-invalid');
        const errorSpan = document.getElementById(`${target.id}-error`);
        if (errorSpan) {
          errorSpan.classList.remove('visible');
        }
      }
    });
  }
});

