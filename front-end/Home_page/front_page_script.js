const searchInput = document.getElementById("searchscheme");
const resultsContainer = document.getElementById("results");
const suggestionsBox = createSuggestionsBox();
let debounceTimeout = null;
let allSchemes = [];
let fuse = null;

// =========================
// 1️⃣ UI Creation Functions
// =========================
function createSuggestionsBox() {
  const box = document.createElement("div");
  box.id = "suggestions";
  box.style.position = "absolute";
  box.style.top = searchInput.offsetHeight + "px";
  box.style.left = "0";
  box.style.backgroundColor = "#fff";
  box.style.color = "#000";
  box.style.border = "1px solid #ccc";
  box.style.borderRadius = "4px";
  box.style.maxHeight = "200px";
  box.style.overflowY = "auto";
  box.style.scrollbarWidth = "none";
  box.style.msOverflowStyle = "none";
  box.style.width = searchInput.offsetWidth + "px";
  box.style.zIndex = 1000;
  box.style.display = "none";
  box.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  box.style.fontSize = "14px";
  searchInput.parentNode.style.position = "relative";
  searchInput.parentNode.appendChild(box);
  return box;
}

// =========================
// 2️⃣ Data Functions
// =========================
async function loadAllSchemes() {
  try {
    const response = await fetch("http://localhost:3000/schemes");
    if (!response.ok) throw new Error("Failed to load schemes");
    const data = await response.json();
    allSchemes = Array.isArray(data.schemes) ? data.schemes : [];

    fuse = new Fuse(allSchemes, {
      keys: ["name"],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  } catch (error) {
    console.error("Error loading schemes:", error);
  }
}

async function fetchSchemeDetailsByName(name) {
  try {
    const response = await fetch(
      `http://localhost:3000/schemes/${encodeURIComponent(name)}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Unknown error" };
    }
    const data = await response.json();
    // return first item if array
    if (Array.isArray(data)) return data[0] || { error: "No scheme found" };
    return data;
  } catch {
    return { error: "Network error or server unreachable" };
  }
}

// =========================
// 3️⃣ UI Update Functions
// =========================
function showSuggestions(results) {
  if (!results.length) {
    suggestionsBox.style.display = "none";
    return;
  }
  suggestionsBox.innerHTML = results
    .slice(0, 8)
    .map(
      (result) =>
        `<div class="suggestion-item" style="padding:8px; cursor:pointer;">${result.item.name}</div>`
    )
    .join("");
  suggestionsBox.style.display = "block";

  document.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", async () => {
      searchInput.value = item.textContent;
      suggestionsBox.style.display = "none";
      searchInput.focus();
      await handleFormSubmit(new Event("submit"));
    });
  });
}

function showSchemeDetails(scheme) {
  resultsContainer.innerHTML = "";
  const docs = Array.isArray(scheme.documents) ? scheme.documents : [];
  const schemeDiv = document.createElement("div");
  schemeDiv.classList.add("scheme");
  schemeDiv.innerHTML = `
    <h2>${scheme.name || "Unnamed Scheme"}</h2>
    <p style="text-decoration:underline"><strong>Documents Required:</strong></p>
    <ul>
      ${
        docs.length
          ? docs.map((doc) => `<br><li>${doc}</li>`).join("")
          : "<li>No documents listed.</li>"
      }
    </ul>
  `;
  resultsContainer.appendChild(schemeDiv);
}

function showSearchResults(searchResults) {
  resultsContainer.innerHTML = `
    <p>Is this the scheme you are searching for?</p>
    <ul id="matchedSchemes" style="list-style:none; padding-left: 0;">
      ${searchResults
        .map(
          (result) =>
            `<li style="cursor:pointer; padding: 8px; border-bottom: 1px solid #ddd; color:#333; background:#fff; border-radius:4px; margin-bottom:6px;" class="matched-scheme-item">${result.item.name}</li>`
        )
        .join("")}
    </ul>
    <p style="margin-top: 10px; font-style: italic;">Click a scheme name to see details.</p>
  `;
  document.querySelectorAll(".matched-scheme-item").forEach((item) => {
    item.addEventListener("click", async () => {
      resultsContainer.innerHTML = "<p>Loading scheme details...</p>";
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
      suggestionsBox.style.display = "none";
      return;
    }
    const results = fuse.search(query);
    showSuggestions(results);
  }, 300);
}

async function handleFormSubmit(e) {
  if (e) e.preventDefault();
  suggestionsBox.style.display = "none";
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    resultsContainer.innerHTML = "<p>Please enter a scheme name to search.</p>";
    return;
  }
  if (!fuse) {
    resultsContainer.innerHTML =
      "<p>Loading data, please try again shortly...</p>";
    return;
  }

  // Exact match first
  const exactMatch = allSchemes.find(
    (s) => s.name.toLowerCase() === searchTerm.toLowerCase()
  );
  if (exactMatch) {
    resultsContainer.innerHTML = "<p>Loading scheme details...</p>";
    const schemeDetails = await fetchSchemeDetailsByName(exactMatch.name);
    if (schemeDetails.error) {
      resultsContainer.innerHTML = `<p>Error: ${schemeDetails.error}</p>`;
      return;
    }
    showSchemeDetails(schemeDetails);
    return;
  }

  // Fuzzy search fallback
  resultsContainer.innerHTML = "<p>Searching for best matches...</p>";
  const searchResults = fuse.search(searchTerm).slice(0, 5);
  if (!searchResults.length) {
    resultsContainer.innerHTML = `<p>No close matches found for "<strong>${searchTerm}</strong>". Try another search.</p>`;
    return;
  }
  showSearchResults(searchResults);
}
function showMessage(msg) {
  const notification = document.createElement("div");
  notification.textContent = msg;
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.left = "50%";
  notification.style.transform = "translateX(-50%)";
  notification.style.backgroundColor = "#4CAF50";
  notification.style.color = "#fff";
  notification.style.padding = "15px 25px";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "1000";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// =========================
// 5️⃣ Store Form (Right Panel)
// =========================
document.getElementById("storeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const schemeName = document.getElementById("newSchemeName").value.trim();
  if (!schemeName) {
    alert("Please enter a scheme name");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/schemes/request-scheme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: schemeName }),
    });

    const data = await res.json();
 if (res.ok) {
    showMessage("✅ Scheme request saved successfully!\nWe will Upload the Registration required Documents List soon.");


    document.getElementById("storeForm").reset();
  } else {
    alert(data.message || "Failed to save scheme");
  }
  } catch (err) {
    console.error("Error:", err);
    alert("⚠️ Could not connect to server");
  }
});

// =========================
// 6️⃣ Init
// =========================
function init() {
  loadAllSchemes();
  searchInput.addEventListener("input", handleSearchInput);
  document
    .getElementById("searchForm")
    .addEventListener("submit", handleFormSubmit);
  document.addEventListener("click", (e) => {
    if (e.target !== searchInput && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });
}

init();