const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files from the "public" directory

const PORT = process.env.PORT || 3000;
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`;
const CHATGPT_API_URL = 'https://api.openai.com/v1/

app.post('/api/chatgpt', async (req, res) => {
    const { topic } = req.body;

    try {
        // Call ChatGPT API
        const chatGptResponse = await fetch(CHATGPT_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: `Please provide information about ${topic} in JSON format.`,
                max_tokens: 150
            })
        });

        const chatGptData = await chatGptResponse.json();
        const chatGptOutput = chatGptData.choices[0].text.trim();

        // Insert ChatGPT output into Webflow CMS
        const webflowResponse = await fetch(WEBFLOW_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                'Content-Type': 'application/json',
                'accept-version': '1.0.0'
            },
            body: JSON.stringify({
                fields: {
                    name: topic,
                    description: chatGptOutput
                }
            })
        });

        const webflowData = await webflowResponse.json();

        res.status(200).json({ message: 'Data inserted into Webflow CMS successfully', webflowData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
