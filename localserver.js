const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files from the "public" directory

const PORT = process.env.PORT || 3000;
const WEBFLOW_HOOK_URL = 'https://hooks.webflow.com/logic/65050d3f9ffb9aca83de1724/XgCbqlNQAZ0';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

app.post('/generate-blog', async (req, res) => {
    const { topic, length, comprehension } = req.body;

    const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension.`;

    try {
        // Call ChatGPT API
        const chatGptResponse = await fetch(CHATGPT_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: prompt }]
            })
        });

        const chatGptData = await chatGptResponse.json();
        const blogContent = chatGptData.choices[0].message.content;

        // Log the generated blog content to the console
        console.log('Generated Blog Content:', blogContent);

        // Prepare data for Webflow CMS
        const cmsData = {
            name: `Blog Post About ${topic}`,
            slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
            'post-body': blogContent,
            'post-summary': blogContent.slice(0, 250),
            'main-image': 'https://example.com/image.jpg', // Update with actual image URL
            'thumbnail-image': 'https://example.com/thumbnail.jpg', // Update with actual image URL
            featured: false,
            color: '#000000',
            link: 'https://example.com', // Optional fields
            attachments: '',
            'additional-images': []
        };

        // Send data to Webflow CMS via hook URL
        const webflowResponse = await fetch(WEBFLOW_HOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cmsData)
        });

        const webflowData = await webflowResponse.json();

        res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
