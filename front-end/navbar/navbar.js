// Dynamically load navbar into placeholder
// This path works if Navbar folder is sibling of your page folder
fetch('../navbar/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading navbar:', error));
