document.addEventListener('DOMContentLoaded', () => {
    const lengthSelect = document.getElementById('length');
    const customLengthInput = document.getElementById('customLength');
  
    lengthSelect.addEventListener('change', () => {
      if (lengthSelect.value === 'custom') {
        customLengthInput.style.display = 'block';
      } else {
        customLengthInput.style.display = 'none';
      }
    });
  
    document.getElementById('contentForm').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const topic = document.getElementById('topic').value;
      const length = lengthSelect.value === 'custom' ? customLengthInput.value : lengthSelect.value;
      const comprehension = document.getElementById('comprehension').value;
      const tone = document.getElementById('tone').value;
      const destination = document.getElementById('destination').value;
  
      try {
        const response = await fetch('/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ topic, length, comprehension, tone, destination })
        });
        const data = await response.json();
        document.getElementById('result').innerText = data.message;
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'An error occurred. Please try again.';
      }
    });
  
    // Check if the user is authenticated and show/hide form accordingly
    const params = new URLSearchParams(window.location.search);
    if (params.get('authenticated')) {
      document.getElementById('authSection').style.display = 'none';
      document.getElementById('formSection').style.display = 'block';
    }
  });