/* ══════════════════════════════════════════════════
   mapping.js — F95 Branch Locator & Leaflet Map
   
   Responsibilities:
   1. Fetch branch data from branches.json
   2. Initialise Leaflet map (OpenStreetMap tiles)
   3. Populate #branch-select dropdown dynamically
   4. On branch select → flyTo + update #branch-info-panel
   5. Smart directions button (Apple Maps / Google Maps)
   6. Mobile scroll-guard overlay
   
   Dependencies: Leaflet.js (loaded in contact.html)
   Data source:  branches.json (same directory)
══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────── */
  const BRANCHES_JSON  = 'script/branches.json';   /* path relative to contact.html */
  const DEFAULT_BRANCH = 1;                 /* id of the branch shown on page load */
  const MAP_ZOOM_DEFAULT = 11;              /* zoom when showing the default branch */
  const MAP_ZOOM_FLY     = 14;             /* zoom when flying to a selected branch */
  const MAP_TILE_URL     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const MAP_ATTRIBUTION  = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

  /* ── State ──────────────────────────────────────── */
  let map           = null;   /* Leaflet map instance */
  let branches      = [];     /* loaded branch objects */
  let markers       = {};     /* { branchId: leaflet marker } */
  let activeMarker  = null;   /* currently highlighted marker */
  let activeBranch  = null;   /* currently selected branch object */

  /* ── Custom marker icons ──────────────────────────
     Two icon variants: main centre (blue) & plant (navy)  */
  function makeIcon(type) {
    const colour = type === 'main' ? '#00AEEF' : '#0A2351';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
        <filter id="shadow" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.28)"/>
        </filter>
        <path d="M16 2C9.37 2 4 7.37 4 14c0 9.5 12 26 12 26S28 23.5 28 14C28 7.37 22.63 2 16 2z"
          fill="${colour}" filter="url(#shadow)"/>
        <circle cx="16" cy="14" r="5.5" fill="white" opacity="0.92"/>
      </svg>`;
    return L.divIcon({
      html: svg,
      className: 'f95-map-marker',
      iconSize:   [32, 42],
      iconAnchor: [16, 42],
      popupAnchor:[0, -44]
    });
  }

  /* Active (larger) icon for the selected branch */
  function makeActiveIcon(type) {
    const colour = type === 'main' ? '#00AEEF' : '#0A2351';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
        <filter id="shadow2" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.32)"/>
        </filter>
        <path d="M20 2C11.16 2 4 9.16 4 18c0 12 16 32 16 32S36 30 36 18C36 9.16 28.84 2 20 2z"
          fill="${colour}" filter="url(#shadow2)"/>
        <circle cx="20" cy="18" r="7" fill="white" opacity="0.95"/>
        <circle cx="20" cy="18" r="3.5" fill="${colour}" opacity="0.85"/>
      </svg>`;
    return L.divIcon({
      html: svg,
      className: 'f95-map-marker f95-map-marker--active',
      iconSize:   [40, 52],
      iconAnchor: [20, 52],
      popupAnchor:[0, -54]
    });
  }

  /* ── Initialise Leaflet Map ───────────────────────── */
  function initMap(defaultBranch) {
    map = L.map('branch-map', {
      center:          [defaultBranch.lat, defaultBranch.lng],
      zoom:            MAP_ZOOM_DEFAULT,
      scrollWheelZoom: false,      /* off by default — avoids hijacking page scroll */
      tap:             false,      /* avoids double-fire on iOS */
      zoomControl:     true,
    });

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    /* Enable scroll zoom only once the map is clicked/focused */
    map.on('click', () => { map.scrollWheelZoom.enable(); });
    map.getContainer().addEventListener('mouseleave', () => {
      map.scrollWheelZoom.disable();
    });
  }

  /* ── Add all branch markers ─────────────────────── */
  function addMarkers() {
    branches.forEach(branch => {
      const icon   = makeIcon(branch.type);
      const marker = L.marker([branch.lat, branch.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="map-popup-name">${branch.name}</div>
           <div class="map-popup-type">${branch.typeLabel}</div>`,
          { maxWidth: 240, closeButton: false }
        );

      /* Clicking a map marker syncs the dropdown */
      marker.on('click', () => {
        const select = document.getElementById('branch-select');
        if (select) {
          select.value = String(branch.id);
          select.dispatchEvent(new Event('change'));
        }
      });

      markers[branch.id] = marker;
    });
  }

  /* ── Populate <select> dropdown ─────────────────── */
  function populateDropdown() {
    const select = document.getElementById('branch-select');
    if (!select) return;

    select.innerHTML = '';  /* clear loading placeholder */

    /* Group: Main Centres */
    const mainGroup = document.createElement('optgroup');
    mainGroup.label = '🏥 Main Centres';
    const plantGroup = document.createElement('optgroup');
    plantGroup.label = '🏭 Industrial Plant Centres';

    branches.forEach(branch => {
      const opt       = document.createElement('option');
      opt.value       = String(branch.id);
      opt.textContent = branch.shortName;
      if (branch.type === 'main') mainGroup.appendChild(opt);
      else                         plantGroup.appendChild(opt);
    });

    select.appendChild(mainGroup);
    select.appendChild(plantGroup);

    /* Set default selection */
    select.value = String(DEFAULT_BRANCH);
  }

  /* ── Update Info Panel ───────────────────────────── */
  function updateInfoPanel(branch) {
    const panel = document.getElementById('branch-info-panel');
    if (!panel) return;

    /* Build phone link */
    const phoneRaw   = branch.phone || '';
    const phoneClean = phoneRaw.replace(/\s/g, '');
    const phoneHTML  = phoneRaw
      ? `<a href="tel:${phoneClean}">${phoneRaw}</a>`
      : '<span style="color:var(--gray-mid)">Not available</span>';

    /* Build email link */
    const emailHTML = branch.email
      ? `<a href="mailto:${branch.email}">${branch.email}</a>`
      : '<span style="color:var(--gray-mid)">Not available</span>';

    const typeBadgeClass = branch.type === 'main' ? 'type-main' : 'type-plant';
    const typeIcon       = branch.type === 'main' ? '🏥' : '🏭';

    panel.innerHTML = `
      <div class="bip-type-badge ${typeBadgeClass}">
        ${typeIcon} ${branch.typeLabel}
      </div>
      <div class="bip-name">${branch.name}</div>
      <div class="bip-address">${branch.address}</div>

      <div class="bip-row">
        <span class="bip-row-icon">📞</span>
        <div class="bip-row-content">
          <span class="bip-row-label">Phone</span>
          <span class="bip-row-value">${phoneHTML}</span>
        </div>
      </div>

      <div class="bip-row">
        <span class="bip-row-icon">✉️</span>
        <div class="bip-row-content">
          <span class="bip-row-label">Email</span>
          <span class="bip-row-value">${emailHTML}</span>
        </div>
      </div>

      <div class="bip-row">
        <span class="bip-row-icon">🕐</span>
        <div class="bip-row-content">
          <span class="bip-row-label">Hours</span>
          <span class="bip-row-value">${branch.hours || 'Contact for hours'}</span>
        </div>
      </div>

      <div class="bip-sessions-pill">
        ${branch.sessions || ''}
      </div>
    `;

    /* Add class to trigger the top accent bar animation */
    panel.classList.add('has-data');
  }

  /* ── Update active marker ────────────────────────── */
  function updateActiveMarker(branch) {
    /* Reset the previously active marker */
    if (activeMarker && activeBranch) {
      activeMarker.setIcon(makeIcon(activeBranch.type));
    }

    /* Set new active marker */
    const newMarker = markers[branch.id];
    if (newMarker) {
      newMarker.setIcon(makeActiveIcon(branch.type));
      newMarker.openPopup();
      activeMarker = newMarker;
      activeBranch = branch;
    }
  }

  /* ── Fly map to branch ───────────────────────────── */
  function flyToBranch(branch) {
    map.flyTo([branch.lat, branch.lng], MAP_ZOOM_FLY, {
      duration: 1.4,
      easeLinearity: 0.3
    });
  }

  /* ── Smart Directions Button ─────────────────────
     Detects Apple device (iOS/macOS) vs everything else.
     Apple:  maps://?q=LAT,LNG        → opens Apple Maps
     Others: google.com/maps/search/… → opens Google Maps  */
  function buildDirectionsUrl(lat, lng, name) {
    const isApple = /iPhone|iPad|iPod|Mac/.test(navigator.userAgent) &&
                    !/Windows/.test(navigator.userAgent);
    if (isApple) {
      return `maps://?q=${encodeURIComponent(name)}&ll=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  function bindDirectionsBtn(branch) {
    const btn = document.getElementById('directions-btn');
    if (!btn) return;

    btn.disabled = false;

    /* Remove previous listener by cloning */
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      const url = buildDirectionsUrl(branch.lat, branch.lng, branch.name);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ── Handle branch selection ─────────────────────── */
  function selectBranch(branchId) {
    const branch = branches.find(b => b.id === Number(branchId));
    if (!branch) return;

    updateInfoPanel(branch);
    flyToBranch(branch);
    updateActiveMarker(branch);
    bindDirectionsBtn(branch);
  }

  /* ── Wire up dropdown change event ─────────────────*/
  function wireDropdown() {
    const select = document.getElementById('branch-select');
    if (!select) return;

    select.addEventListener('change', () => {
      selectBranch(select.value);
    });
  }

  /* ── Mobile overlay logic ────────────────────────── */
  function wireMapOverlay() {
    const overlay = document.getElementById('mapOverlay');
    if (!overlay) return;

    overlay.addEventListener('click', () => {
      overlay.classList.add('hidden');
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    });
  }

  /* ── Main init ───────────────────────────────────── */
  async function init() {
    try {
      const response = await fetch(BRANCHES_JSON);
      if (!response.ok) throw new Error(`Could not load ${BRANCHES_JSON} (${response.status})`);
      branches = await response.json();

      if (!branches || branches.length === 0) {
        throw new Error('branches.json is empty');
      }

      /* Find default branch */
      const defaultBranch = branches.find(b => b.id === DEFAULT_BRANCH) || branches[0];

      /* 1. Init map */
      initMap(defaultBranch);

      /* 2. Add all markers */
      addMarkers();

      /* 3. Populate dropdown */
      populateDropdown();

      /* 4. Wire up change event */
      wireDropdown();

      /* 5. Wire mobile overlay */
      wireMapOverlay();

      /* 6. Select default branch */
      selectBranch(defaultBranch.id);

    } catch (err) {
      console.error('[mapping.js] Failed to initialise branch locator:', err);

      /* Graceful degradation — show a helpful error in the info panel */
      const panel = document.getElementById('branch-info-panel');
      if (panel) {
        panel.innerHTML = `
          <div style="text-align:center; padding:24px; color:var(--gray-mid);">
            <div style="font-size:2rem; margin-bottom:10px;">⚠️</div>
            <div style="font-family:'Nunito',sans-serif; font-weight:700; color:var(--navy); margin-bottom:6px;">
              Could not load branch data
            </div>
            <div style="font-size:0.82rem; line-height:1.6;">
              Please ensure <code>branches.json</code> is present in the same folder as <code>contact.html</code>.
            </div>
          </div>`;
      }

      const select = document.getElementById('branch-select');
      if (select) {
        select.innerHTML = '<option value="">Error loading centres</option>';
        select.disabled  = true;
      }
    }
  }

  /* ── Boot when DOM is ready ─────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(); /* IIFE — avoids polluting global scope */
