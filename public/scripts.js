document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthenticated = urlParams.get('authenticated');

    const authSection = document.getElementById('authSection');
    const formSection = document.getElementById('formSection');
    const authButton = document.getElementById('authButton');

>>>>>>> 2883294 (snitches are bishes)
    if (isAuthenticated) {
        authButton.textContent = 'Authenticated!';
        authButton.disabled = true;
        formSection.style.display = 'block';
    } else {
        authButton.addEventListener('click', () => {
            window.location.href = '/auth';
        });
    }

    document.getElementById('blogForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const topic = document.getElementById('topic').value;
        const length = document.getElementById('length').value;
        const comprehension = document.getElementById('comprehension').value;

        fetch('/generate-blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, length, comprehension })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').innerText = data.message;
        })
        .catch(error => console.error('Error:', error));
    });
});
