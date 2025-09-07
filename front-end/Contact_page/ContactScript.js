const form = document.getElementById("contactForm");
const responseMsg = document.getElementById("responseMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Disable the button to prevent multiple submissions
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    responseMsg.textContent = result.message || (res.ok ? "Message sent successfully!" : "Failed to send message.");
    responseMsg.style.color = result.success ? "green" : "red";

    if (result.success) form.reset();
  } catch (err) {
    console.error("Contact form error:", err);
    responseMsg.textContent = "Something went wrong! Please try again.";
    responseMsg.style.color = "red";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
  }
});
