document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blogForm').addEventListener('submit', async (event) => {
    event.preventDefault();

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
      document.getElementById('result').innerText = data.message;
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerText = 'An error occurred dumbo. Please try again.';
    }
  });
});
