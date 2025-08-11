const schemeSelect = document.getElementById('schemeSelect');
const resultsContainer = document.getElementById('results');

// Function to fetch all scheme names and populate the dropdown
async function loadSchemeNames() {
  try {
    const response = await fetch('http://localhost:3000/schemes/');
    if (!response.ok) {
      throw new Error('Failed to load scheme names');
    }
    const schemeNames = await response.json();

    // Clear existing options except the placeholder
    schemeSelect.innerHTML = '<option value="">Select a scheme</option>';

    // Add options dynamically
    schemeNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      schemeSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading scheme names:', error);
  }
}

// Call loadSchemeNames on page load
window.addEventListener('DOMContentLoaded', loadSchemeNames);

// Handle form submit
document.getElementById('searchForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const selectedScheme = schemeSelect.value;

  resultsContainer.innerHTML = '';

  if (!selectedScheme) {
    resultsContainer.innerHTML = '<p>Please select a scheme.</p>';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/schemes/${encodeURIComponent(selectedScheme)}`);

    if (!response.ok) {
      const errorData = await response.json();
      resultsContainer.innerHTML = `<p>Error: ${errorData.error}</p>`;
      return;
    }

    const schemes = await response.json();

    if (schemes.length === 0) {
      resultsContainer.innerHTML = '<p>No schemes found.</p>';
      return;
    }

    schemes.forEach(scheme => {
      const schemeDiv = document.createElement('div');
      schemeDiv.classList.add('scheme');
      schemeDiv.innerHTML = `
        <h2>${scheme.name}</h2>
        <p><strong>Documents Required:</strong></p>
        <ul>
          ${scheme.documents.map(doc => `<li>${doc}</li>`).join('')}
        </ul>
      `;
      resultsContainer.appendChild(schemeDiv);
    });

  } catch (error) {
    console.error('Error fetching scheme details:', error);
    resultsContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
});
