document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blogForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const topic = document.getElementById('topic').value;
    const length = document.getElementById('length').value;
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
      
      if (data.data) {
        // Display the generated content, summary, and image URL
        document.getElementById('result').innerHTML = `
          <h2>${data.data.title}</h2>
          <h3>${data.data.subtitle}</h3>
          <p>${data.data.content}</p>
          <p><strong>Summary:</strong> ${data.data.summary}</p>
          <img src="${data.data.imageUrl}" alt="Generated Image" />
        `;
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerText = 'An error occurred. Please try again.';
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blogForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const topic = document.getElementById('topic').value;
    const length = document.getElementById('length').value;
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
      
      if (data.data) {
        // Display the generated content, summary, and image URL
        document.getElementById('result').innerHTML = `
          <h2>${data.data.title}</h2>
          <h3>${data.data.subtitle}</h3>
          <p>${data.data.content}</p>
          <p><strong>Summary:</strong> ${data.data.summary}</p>
          <img src="${data.data.imageUrl}" alt="Generated Image" />
        `;
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerText = 'An error occurred. Please try again.';
    }
  });
});
