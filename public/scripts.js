document.addEventListener('DOMContentLoaded', () => {
    const webflowAccessToken = getCookie('webflow_access_token');
    const authLink = document.getElementById('authLink');
    const formSection = document.getElementById('formSection');

    if (webflowAccessToken) {
        const authMessage = document.createElement('p');
        authMessage.textContent = 'Webflow side has been authenticated';
        authLink.style.display = 'none';
        formSection.style.display = 'block';
    } else {
        formSection.style.display = 'none';
    }

    document.getElementById('blogForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const topic = document.getElementById('topic').value;
        const length = document.getElementById('length').value;
        const comprehension = document.getElementById('comprehension').value;
        const tone = document.getElementById('tone').value;
        const contentDestination = 'Webflow';

        try {
            const response = await fetch(`https://hocblog-f5e15700baff.herokuapp.com/generate-blog`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, length, comprehension, tone, contentDestination })
            });
            const data = await response.json();
            document.getElementById('result').innerText = data.message;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerText = 'An error occurred. Please try again.';
        }
    });

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
