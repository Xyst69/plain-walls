/**
 * public/js/about.js
 * Handle custom inquiry / contact form submissions directly to MongoDB
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studioEnquiryForm');
  if (!form) return;

  const successBox = document.getElementById('enquirySuccessBox');
  const errorBox = document.getElementById('enquiryErrorBox');
  const submitBtn = document.getElementById('enquirySubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successBox.style.display = 'none';
    errorBox.style.display = 'none';

    const name = document.getElementById('enquiryName').value.trim();
    const email = document.getElementById('enquiryEmail').value.trim();
    const phone = document.getElementById('enquiryPhone').value.trim();
    const message = document.getElementById('enquiryMessage').value.trim();

    if (!name || name.length < 2) {
      errorBox.textContent = 'Please enter your name.';
      errorBox.style.display = 'block';
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorBox.textContent = 'Please enter a valid email address.';
      errorBox.style.display = 'block';
      return;
    }

    if (!message || message.length < 3) {
      errorBox.textContent = 'Please describe your inquiry or custom print request.';
      errorBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error recording inquiry');
      }

      form.reset();
      successBox.textContent = `Thank you, ${name}! Your inquiry has been saved. We will get back to you shortly.`;
      successBox.style.display = 'block';
      showToast('Enquiry sent successfully.');
    } catch (err) {
      errorBox.textContent = err.message || 'Failed to submit inquiry. Please try again.';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
    }
  });
});
