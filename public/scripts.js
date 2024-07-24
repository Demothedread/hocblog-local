document.addEventListener('DOMContentLoaded', () => {
  const authLink = document.getElementById('authLink');
  const formSection = document.getElementById('formSection');
  const loading = document.getElementById('loading');
  const resultContainer = document.getElementById('resultContainer');

  const URL_PARAMS = new URLSearchParams(window.location.search);
  const authenticated = URL_PARAMS.get("authenticated");

  if (authenticated) {
      authLink.style.display = 'none';
      formSection.style.display = 'block';
  } else {
      formSection.style.display = 'none';
  }

  document.getElementById('blogForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      resultContainer.innerText = '';
      loading.style.display = 'block';

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
          const data = await response.json();
          loading.style.display = 'none';
          if (response.ok) {
              resultContainer.innerText = `Success: ${data.message}`;
          } else {
              resultContainer.innerText = `Error: ${data.message}`;
          }
      } catch (error) {
          loading.style.display = 'none';
          resultContainer.innerText = 'An error occurred. Please try again.';
          console.error('Error:', error);
      }
  });
});
