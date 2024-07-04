const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(helmet());

const PORT = process.env.PORT || 3000;
console.log(`Server is running on port ${PORT}`);
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`;
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DALLE_API_URL = 'https://api.openai.com/v1/images/generations';

// Retrieve the access token from the environment or a secure location
const WEBFLOW_ACCESS_TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;

app.disable('x-powered-by');

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
                max_tokens: 1500,
                temperature: 0.5
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('ChatGPT Response:', chatGptResponse.data);
        const blogContent = chatGptResponse.data.choices[0].message.content;
        console.log('Generated Blog Content:', blogContent);

        // Generate short summary
        const summaryPrompt = `Summarize the following blog post in 250 characters: ${blogContent}`;
        const summaryResponse = await axios.post(
            CHATGPT_API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: summaryPrompt }],
                max_tokens: 175,
                temperature: 0.4
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('ChatGPT Summary Response:', summaryResponse.data);
        const blogSummary = summaryResponse.data.choices[0].message.content;

        // Generate Image using DALL-E
        const dalleResponse = await axios.post(
            DALLE_API_URL,
            {
                prompt: `Create an image that captures the essence of the following blog post: ${blogSummary.slice(0, 100)}`,
                n: 1,
                size: '512x512',
                response_format: 'url',
                model: 'dall-e-2',
                style: 'vivid'
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('DALL-E Response:', dalleResponse.data);
        const imageUrl = dalleResponse.data.data[0].url;

        if (!imageUrl) {
            throw new Error('No image generated by DALL-E');
        }

        // Prepare data for Webflow CMS
        const cmsData = {
            fields: {
                name: `Blog Post About ${topic}`,
                slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
                'post-body': blogContent,
                'post-summary': blogSummary,
                'main-image': imageUrl,  // URL of the generated image
                tags: ['example', 'blog', 'post'],  // Add relevant tags here
            }
        };

        // Send data to Webflow CMS via API URL
        const webflowResponse = await axios.post(
            WEBFLOW_API_URL,
            { fields: cmsData.fields },
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'accept-version': '1.0.0'
                }
            }
        );

        console.log('Webflow Response:', webflowResponse.data);
        res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
    } catch (error) {
        console.error('Error processing request:', error);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
