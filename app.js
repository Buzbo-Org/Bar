const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkoablqg';

// Google Analytics Helper
function trackGAEvent(action, category, label) {
  if (typeof gtag === 'function') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  } else {
    console.log(`[GA Event Tracked] Action: ${action}, Category: ${category}, Label: ${label}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal DOM Elements
  const modalReadMore = document.getElementById('modal-read-more');
  const modalWaitlist = document.getElementById('modal-waitlist');
  
  // CTA Button DOM Elements
  const btnReadMore = document.getElementById('btn-read-more');
  const btnWaitlist = document.getElementById('btn-waitlist');
  const btnFollow = document.getElementById('btn-follow');

  // Modal Inner CTA Button DOM Elements
  const modalBtnWaitlist = document.getElementById('modal-btn-waitlist');
  const modalBtnFollow = document.getElementById('modal-btn-follow');
  
  // Close Button DOM Elements
  const closeButtons = document.querySelectorAll('.modal-close');
  
  // Waitlist Form Elements
  const waitlistForm = document.getElementById('waitlist-form');
  const submitButton = waitlistForm.querySelector('button[type="submit"]');
  const submitBtnText = submitButton.querySelector('.btn-text');
  const successMsg = document.getElementById('status-success');
  const errorMsg = document.getElementById('status-error');

  // Open Read More Modal
  btnReadMore.addEventListener('click', (e) => {
    e.preventDefault();
    modalReadMore.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    trackGAEvent('click_read_more', 'CTA Clicks', 'Read More Button');
  });

  // Open Waitlist Modal
  btnWaitlist.addEventListener('click', (e) => {
    e.preventDefault();
    modalWaitlist.classList.add('active');
    document.body.style.overflow = 'hidden';
    trackGAEvent('click_waitlist_open', 'CTA Clicks', 'Waitlist Open Button');
  });

  // Open Waitlist Modal from inside Read More modal
  modalBtnWaitlist.addEventListener('click', (e) => {
    e.preventDefault();
    modalReadMore.classList.remove('active'); // Close current modal
    // Slight timeout to let transition finish before opening the next
    setTimeout(() => {
      modalWaitlist.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, 250);
    trackGAEvent('click_modal_waitlist_open', 'CTA Clicks', 'Modal Join Waitlist Button');
  });

  // Track Instagram Follow click
  btnFollow.addEventListener('click', () => {
    trackGAEvent('click_follow_instagram', 'CTA Clicks', 'Instagram Link');
  });

  // Track Instagram Follow click inside modal
  modalBtnFollow.addEventListener('click', () => {
    trackGAEvent('click_modal_follow_instagram', 'CTA Clicks', 'Modal Instagram Link');
  });

  // Close Modals (clicking close icon or clicking outside the card)
  closeButtons.forEach(button => {
    button.addEventListener('click', closeAllModals);
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
  });

  // Esc key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  function closeAllModals() {
    modalReadMore.classList.remove('active');
    modalWaitlist.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
  }

  // Formspree Form Submission Handler
  waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // Retrieve inputs
    const nameInput = document.getElementById('waitlist-name').value.trim();
    const emailInput = document.getElementById('waitlist-email').value.trim();

    // Basic Validation
    if (!nameInput || !emailInput) {
      errorMsg.textContent = 'Please fill out both Name and Email.';
      errorMsg.style.display = 'block';
      return;
    }

    // Update UI to Loading State
    submitButton.disabled = true;
    const originalBtnText = submitBtnText.textContent;
    submitBtnText.textContent = 'Submitting...';

    // Formspree Submission Request
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput
        })
      });

      if (response.ok) {
        // Success
        successMsg.style.display = 'block';
        waitlistForm.reset();
        trackGAEvent('waitlist_signup_success', 'Form Submissions', 'Waitlist Signup');
        
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          closeAllModals();
          // Reset states after modal transition
          setTimeout(() => {
            successMsg.style.display = 'none';
            submitButton.disabled = false;
            submitBtnText.textContent = originalBtnText;
          }, 400);
        }, 2000);
      } else {
        // Formspree error
        const data = await response.json();
        if (data && data.errors && data.errors.length > 0) {
          errorMsg.textContent = data.errors.map(err => err.message).join(', ');
        } else {
          errorMsg.textContent = 'Oops! There was a problem submitting your form.';
        }
        errorMsg.style.display = 'block';
        submitButton.disabled = false;
        submitBtnText.textContent = originalBtnText;
        trackGAEvent('waitlist_signup_error', 'Form Submissions', 'Waitlist Error');
      }
    } catch (err) {
      // Network error
      console.error('Submission error:', err);
      errorMsg.textContent = 'Network error. Please check your connection and try again.';
      errorMsg.style.display = 'block';
      submitButton.disabled = false;
      submitBtnText.textContent = originalBtnText;
      trackGAEvent('waitlist_signup_network_error', 'Form Submissions', 'Waitlist Network Error');
    }
  });
});
