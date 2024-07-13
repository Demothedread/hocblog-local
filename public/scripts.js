document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isAuthenticated = urlParams.get('authenticated');

  if (isAuthenticated) {
    const authButton = document.getElementById('authButton');
    authButton.textContent = 'Authenticated!';
    authButton.disabled = true;
    formSection.style.display = 'block';
  } else {
    window.location.href = '/auth'; // Redirect to OAuth sign-in page if not authenticated
  }
});
// Use event delegation to handle form submit
document.addEventListener('submit', async (event) => {
  if (event.target.id === 'blogForm') {
    event.preventDefault();
    const topic = document.getElementById('topic').value;
    const length = document.getElementById('length').value;
    const comprehension = document.getElementById('comprehension').value;
    const tone = document.getElementById('tone').value;

    try {
      const response = await fetch('/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, length, comprehension, tone })
      });

      if (!response.ok) {
        throw new Error('Failed to generate blog');
      }

      const data = await response.json();
      document.getElementById('result').innerText = data.message;
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

// Check authentication status and update UI accordingly
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isAuthenticated = urlParams.get('authenticated');

  if (isAuthenticated) {
    const authButton = document.getElementById('authButton');
    authButton.textContent = 'Authenticated!';
    authButton.disabled = true;
    formSection.style.display = 'block';
  }
});
);
