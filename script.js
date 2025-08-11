 const schemeSelect = document.getElementById('schemeSelect');
    const resultsContainer = document.getElementById('results');

    // Load scheme names and populate select
    async function loadSchemeNames() {
      try {
        const response = await fetch('https://documentfinder-com.onrender.com/schemes/');
;
        if (!response.ok) throw new Error('Failed to load scheme names');
        const schemeNames = await response.json();

        schemeSelect.innerHTML = '<option value="">Select a scheme</option>';

        schemeNames.forEach(scheme => {
          // If backend returns objects with a name property:
          const name = scheme.name || scheme;
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          schemeSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error loading scheme names:', error);
        resultsContainer.innerHTML = '<p>Failed to load schemes. Please try again later.</p>';
      }
    }

    window.addEventListener('DOMContentLoaded', loadSchemeNames);

    document.getElementById('searchForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const selectedScheme = schemeSelect.value;
      if (!selectedScheme) {
        resultsContainer.innerHTML = '<p>Please select a scheme.</p>';
        return;
      }

      resultsContainer.innerHTML = '<p>Loading...</p>';

      try {
        const response = await fetch(`https://documentfinder-com.onrender.com/schemes/${encodeURIComponent(selectedScheme)}`);


        if (!response.ok) {
          const errorData = await response.json();
          resultsContainer.innerHTML = `<p>Error: ${errorData.error}</p>`;
          return;
        }

        const schemes = await response.json();

        if (!schemes || schemes.length === 0) {
          resultsContainer.innerHTML = '<p>No schemes found.</p>';
          return;
        }

        resultsContainer.innerHTML = ''; // Clear loading

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