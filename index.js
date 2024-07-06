const express = require('express');
const helmet = require('helmet');
<<<<<<< HEAD
const axios = require('axios');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
=======
>>>>>>> df20308 (added it)
require('dotenv').config();

// index.js

// Require the oauth.js for authentication
const oauth = require('./oauth');

// Your main application logic here
const express = require('express');
const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory
app.use(cookieParser());

<<<<<<< HEAD
const {
  PORT = 3000,
  ZAPIER_WEBHOOK_URL,
  WEBFLOW_COLLECTION_ID,
  CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions',
  DALLE_API_URL = 'https://api.openai.com/v1/images/generations',
  WEBFLOW_CLIENT_ID,
  WEBFLOW_CLIENT_SECRET,
  REDIRECT_URI,
  CHATGPT_API_KEY
} = process.env;

const WEBFLOW_API_URL = `https://api.webflow.com/collections/${WEBFLOW_COLLECTION_ID}/items`;

// OAuth Routes
app.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7); // Generate a random state value for CSRF protection
  const authUrl = `https://webflow.com/oauth/authorize?client_id=${WEBFLOW_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&state=${state}`;
  res.redirect(authUrl);
});
=======
// Add Cache-Control headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // adjust the max-age value as needed
  next();
});

const PORT = process.env.PORT || 3000;
console.log(`Server is running on port ${PORT}`);
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`;
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DALLE_API_URL = 'https://api.openai.com/v1/images/generations';

app.disable('x-powered-by');
>>>>>>> df20308 (added it)

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post('https://api.webflow.com/oauth/access_token', querystring.stringify({
      client_id: WEBFLOW_CLIENT_ID,
      client_secret: WEBFLOW_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    }));

    const { access_token } = response.data;
    console.log(`Access Token: ${access_token}`);

    res.cookie('webflow_access_token', access_token, { httpOnly: true });
    res.redirect('/?authenticated=true'); // Redirect to the index.html page with an authenticated flag
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).send('Error getting access token');
  }
});

// Webhook and Blog Generation Routes
app.post('/webhook', async (req, res) => {
  const { text } = req.body;

  if (text.startsWith('/export')) {
    const dataToExport = text.replace('/export', '').trim();

    try {
<<<<<<< HEAD
      await axios.post(ZAPIER_WEBHOOK_URL, { data: dataToExport });
      res.status(200).send('Data exported successfully.');
=======
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
                    'Authorization': `Bearer ${process.env.WEBFLOW_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'accept-version': '1.0.0'
                }
            }
        );

        console.log('Webflow Response:', webflowResponse.data);
        res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
>>>>>>> df20308 (added it)
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to export data.');
    }
  } else {
    res.status(200).send('No export command found.');
  }
});

app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension.`;

  try {
    const chatGptResponse = await axios.post(
      CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 2050,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const blogContent = chatGptResponse.data.choices[0].message.content;

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
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const blogSummary = summaryResponse.data.choices[0].message.content;

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
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = dalleResponse.data.data[0].url;

    if (!imageUrl) {
      throw new Error('No image generated by DALL-E');
    }

    const cmsData = {
      fields: {
        name: `Blog Post About ${topic}`,
        slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        'post-body': blogContent,
        'post-summary': blogSummary,
        'main-image': imageUrl,
        tags: ['example', 'blog', 'post'],
      }
    };

    const webflowAccessToken = req.cookies.webflow_access_token;

    if (!webflowAccessToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const webflowResponse = await axios.post(
      WEBFLOW_API_URL,
      { fields: cmsData.fields },
      {
        headers: {
          'Authorization': `Bearer ${webflowAccessToken}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0'
        }
      }
    );

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
<<<<<<< HEAD
  console.log(`Server is running on port ${PORT}`);
=======
    console.log(`Server is running on port ${PORT}`);
>>>>>>> df20308 (added it)
});