document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('blogForm').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const topic = document.getElementById('topic').value;
      const length = document.getElementById('length').value;
      const comprehension = document.getElementById('comprehension').value;
      const tone = document.getElementById('tone').value;
      const contentDestination = document.getElementById('contentDestination').value;
  
      let endpoint = '';
      switch (contentDestination) {
        case 'Blog':
          endpoint = '/generate-blog';
          break;
        case 'Twitter':
          endpoint = '/generate-tweet';
          break;
        case 'Instagram':
          endpoint = '/generate-post';
          break;
        case 'Word':
          endpoint = '/generate-doc';
          break;
        default:
          alert('Invalid content destination');
          return;
      }
  
      try {
        const response = await fetch(endpoint, {
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
        document.getElementById('result').innerText = 'An error occurred. Please try again.';
      }
    });
  
    // Check for access token and display authentication message
    const webflowAccessToken = getCookie('webflow_access_token');
  
    if (webflowAccessToken) {
      const authSection = document.getElementById('authSection');
      const authMessage = document.createElement('p');
      authMessage.textContent = 'Webflow side has been authenticated';
      authSection.appendChild(authMessage);
  
      document.getElementById('formSection').style.display = 'block';
    }
  });
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  