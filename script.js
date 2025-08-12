const searchInput = document.getElementById('searchscheme');
const resultsContainer = document.getElementById('results');
const suggestionsBox = createSuggestionsBox();
let debounceTimeout = null;
let allSchemes = [];
let fuse = null;

// =========================
// 1️⃣ UI Creation Functions
// =========================
function createSuggestionsBox() {
  const box = document.createElement('div');
  box.id = 'suggestions';
  box.style.position = 'absolute';
  box.style.top = searchInput.offsetHeight + 'px';
  box.style.left = '0';
  box.style.backgroundColor = '#fff';
  box.style.color = '#000';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '4px';
  box.style.maxHeight = '200px';
  box.style.overflowY = 'auto';
  box.style.scrollbarWidth = 'none';
  box.style.msOverflowStyle = 'none';
  box.style.width = searchInput.offsetWidth + 'px';
  box.style.zIndex = 1000;
  box.style.display = 'none';
  box.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  box.style.fontSize = '14px';
  box.style.cssText += `::-webkit-scrollbar { display: none; }`;

  searchInput.parentNode.style.position = 'relative';
  searchInput.parentNode.appendChild(box);

  return box;
}

// =========================
// 2️⃣ Data Functions
// =========================
async function loadAllSchemes() {
  try {
    const response = await fetch('http://localhost:3000/schemes/');
    if (!response.ok) throw new Error('Failed to load schemes');
    allSchemes = await response.json();

    const isObjects = allSchemes.length > 0 && typeof allSchemes[0] === 'object' && allSchemes[0].name !== undefined;

    fuse = new Fuse(allSchemes, isObjects ? {
      keys: ['name'],
      threshold: 0.1,
      ignoreLocation: true,
      minMatchCharLength: 1,
    } : {
      threshold: 0.1,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });

  } catch (error) {
    console.error('Error loading schemes:', error);
  }
}

async function fetchSchemeDetailsByName(name) {
  try {
    const response = await fetch(`http://localhost:3000/schemes/${encodeURIComponent(name)}`);
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Unknown error' };
    }
    return await response.json();
  } catch {
    return { error: 'Network error or server unreachable' };
  }
}

// =========================
// 3️⃣ UI Update Functions
// =========================
function showSuggestions(results) {
  if (!results.length) {
    suggestionsBox.style.display = 'none';
    return;
  }

  suggestionsBox.innerHTML = results
    .slice(0, 8)
    .map(result => {
      const name = (result.item && result.item.name) || result.item || result.name || result;
      return `<div class="suggestion-item" style="padding:8px; cursor:pointer;">${name}</div>`;
    })
    .join('');

  suggestionsBox.style.display = 'block';

  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.textContent;
      suggestionsBox.style.display = 'none';
      searchInput.focus();
    });
  });
}

function showSchemeDetails(schemeDetails) {
  resultsContainer.innerHTML = '';
  const schemesArray = Array.isArray(schemeDetails) ? schemeDetails : [schemeDetails];
  schemesArray.forEach(scheme => {
    const docs = Array.isArray(scheme.documents) ? scheme.documents : [];
    const schemeDiv = document.createElement('div');
    schemeDiv.classList.add('scheme');
    schemeDiv.innerHTML = `
      <h2>${scheme.name || 'Unnamed Scheme'}</h2>
      <p style="text-decoration:underline"><strong>Documents Required:</strong></p>
      <ul>
        ${docs.length ? docs.map(doc => `<li>${doc}</li>`).join('') : '<li>No documents listed.</li>'}
      </ul>
    `;
    resultsContainer.appendChild(schemeDiv);
  });
}

function showSearchResults(searchResults) {
  resultsContainer.innerHTML = `
    <p>Is this the scheme you are searching for?</p>
    <ul id="matchedSchemes" style="list-style:none; padding-left: 0;">
      ${searchResults.map(result => {
        const name = (result.item && result.item.name) || result.item || result.name || result;
        return `<li style="cursor:pointer; padding: 8px; border-bottom: 1px solid #ddd; color:#333; background:#fff; border-radius:4px; margin-bottom:6px;" class="matched-scheme-item">${name}</li>`;
      }).join('')}
    </ul>
    <p style="margin-top: 10px; font-style: italic;">Click a scheme name to see details.</p>
  `;

  document.querySelectorAll('.matched-scheme-item').forEach(item => {
    item.addEventListener('click', async () => {
      resultsContainer.innerHTML = '<p>Loading scheme details...</p>';
      const schemeDetails = await fetchSchemeDetailsByName(item.textContent);

      if (schemeDetails.error) {
        resultsContainer.innerHTML = `<p>Error: ${schemeDetails.error}</p>`;
        return;
      }

      showSchemeDetails(schemeDetails);
    });
  });
}

// =========================
// 4️⃣ Event Handlers
// =========================
function handleSearchInput() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (!query || !fuse) {
      suggestionsBox.style.display = 'none';
      return;
    }
    const results = fuse.search(query);
    showSuggestions(results);
  }, 300);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  suggestionsBox.style.display = 'none';

  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    resultsContainer.innerHTML = '<p>Please enter a scheme name to search.</p>';
    return;
  }

  if (!fuse) {
    resultsContainer.innerHTML = '<p>Loading data, please try again shortly...</p>';
    return;
  }

  // 🔹 1. Check for exact match first
  const exactMatch = allSchemes.find(s => {
    const name = s.name || s;
    return name.toLowerCase() === searchTerm.toLowerCase();
  });

  if (exactMatch) {
    resultsContainer.innerHTML = '<p>Loading scheme details...</p>';
    const schemeDetails = await fetchSchemeDetailsByName(exactMatch.name || exactMatch);

    if (schemeDetails.error) {
      resultsContainer.innerHTML = `<p>Error: ${schemeDetails.error}</p>`;
      return;
    }

    showSchemeDetails(schemeDetails);
    return;
  }

  // 🔹 2. If no exact match, do normal fuzzy search
  resultsContainer.innerHTML = '<p>Searching for best matches...</p>';
  const searchResults = fuse.search(searchTerm).slice(0, 5);

  if (!searchResults.length) {
    resultsContainer.innerHTML = `<p>No close matches found for "<strong>${searchTerm}</strong>". Try another search.</p>`;
    return;
  }

  showSearchResults(searchResults);
}

// =========================
// 5️⃣ Init
// =========================
function init() {
  loadAllSchemes();
  searchInput.addEventListener('input', handleSearchInput);
  document.getElementById('searchForm').addEventListener('submit', handleFormSubmit);
  document.addEventListener('click', e => {
    if (e.target !== searchInput && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

init();
