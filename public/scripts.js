document.addEventListener('DOMContentLoaded', () => {
  const authButton = document.getElementById('authButton');
  const formSection = document.getElementById('formSection');
  const loading = document.getElementById('loading');
  const resultContainer = document.getElementById('resultContainer');

  authButton.addEventListener('click', async () => {
      resultContainer.innerText = '';
      loading.style.display = 'block';

      try {
          const response = await fetch('/verify-keys');
          const data = await response.json();
          loading.style.display = 'none';
          if (response.ok) {
              authButton.style.display = 'none';
              formSection.style.display = 'block';
              resultContainer.innerText = 'Authentication successful. API keys are valid.';
          } else {
              resultContainer.innerText = `Error: ${data.message}`;
          }
      } catch (error) {
          loading.style.display = 'none';
          resultContainer.innerText = 'An error occurred. Please try again.';
          console.error('Error:', error);
      }
  });

  document.getElementById('blogForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      resultContainer.innerText = '';
      loading.style.display = 'block';

      const topic = document.getElementById('topic').value;
      const length = document.getElementById('length').value;
      const comprehension = document.getElementById('comprehension').value;
      const tone = document.getElementById('tone').value;
      const destination = document.getElementById('destination').value;

      try {
          const response = await fetch('/generate-blog', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ topic, length, comprehension, tone, destination })
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
