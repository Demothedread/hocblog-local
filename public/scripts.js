document.addEventListener('DOMContentLoaded', () => {
  const webflowAccessToken = getCookie('webflow_access_token');
  const authSection = document.getElementById('authSection');
  const formSection = document.getElementById('formSection');
  const authLink = document.getElementById('authLink');

  if (webflowAccessToken) {
    const authMessage = document.createElement('p');
    authMessage.textContent = 'Webflow side has been authenticated';
    authSection.appendChild(authMessage);
    authLink.style.display = 'none';
    formSection.style.display = 'block';
  }

  document.getElementById('blogForm').addEventListener('submit', async (event) => {
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
      const data = await response.json();
      document.getElementById('result').innerText = data.message;
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}