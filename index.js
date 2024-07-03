const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const WEBFLOW_HOOK_URL = 'https://hooks.webflow.com/logic/65050d3f9ffb9aca83de1724/XgCbqlNQAZ0';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DALLE_API_URL = 'https://api.openai.com/v1/images/generations';

app.post('/generate-blog', async (req, res) => {
    const { topic, length, comprehension } = req.body;
    const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension.`;

    try {
        // Call ChatGPT API to generate blog post
        const chatGptResponse = await axios.post(
            CHATGPT_API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 1024,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const blogContent = chatGptResponse.data.choices[0].message.content;
        console.log('Generated Blog Content:', blogContent);

        // Generate short summary
        const summaryPrompt = `Summarize the following blog post in 250 characters: ${blogContent}`;
        const summaryResponse = await axios.post(
            CHATGPT_API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: summaryPrompt }],
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const blogSummary = summaryResponse.data.choices[0].message.content;

        // Generate Image using DALL-E
        const dalleResponse = await axios.post(
            DALLE_API_URL,
            {
                prompt: `Create an image that captures the essence of the following blog post: ${blogContent}`,
                n: 1,
                size: '1024x1024'
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const imageUrl = dalleResponse.data.data[0].url;

        // Prepare data for Webflow CMS
        const cmsData = {
            fields: {
                name: `Blog Post About ${topic}`,
                slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
                'post-body': blogContent,
                'post-summary': blogSummary,
                'main-image': imageUrl,
                'thumbnail-image': imageUrl,
                featured: false,
                color: '#000000',
                link: 'https://example.com', // Optional fields
                attachments: '',
                'additional-images': []
            }
        };

        // Send data to Webflow CMS via hook URL
        const webflowResponse = await axios.post(
            WEBFLOW_HOOK_URL,
            cmsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
