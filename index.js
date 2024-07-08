const express = require('express');
const fetch = require('node-fetch');
const helmet = require('helmet'); // Import helmet for middleware setup
const axios = require('axios'); // Import axios for making HTTP requests
const querystring = require('querystring'); // Import querystring for URL encoding

require('dotenv').config();

const app = express();

// Middleware setup
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Environment variables
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

/**
 * Logs the server's port number.
 * @param {Number} PORT - The server's port number.
 */
function logServerPort(PORT) {
  console.log(`Server is running on port ${PORT}`);
}

logServerPort(PORT);

// OAuth server setup
app.get('/auth', async (req, res) => {
  const authUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${WEBFLOW_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write`;
  res.redirect(authUrl);
});

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

    res.send(`<html><body><h1>Access Token: ${access_token}</h1><p>Ali Baba says Open</p></body></html>`);
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).send('Error getting access token');
  }
});

// Disable x-powered-by header for security
app.disable('x-powered-by');

// Webhook endpoint for exporting data
app.post('/webhook', async (req, res) => {
  const { text } = req.body;

  if (text.startsWith('/export')) {
    const dataToExport = text.replace('/export', '').trim();

    try {
      await axios.post(ZAPIER_WEBHOOK_URL, { data: dataToExport });
      res.status(200).send('Data exported successfully.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to export data.');
    }
  } else {
    res.status(200).send('No export command found.');
  }
});

// Endpoint for generating blog posts
app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension.`;
  const { topic, length, comprehension } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension.`;

  try {
    // Call ChatGPT API to generate blog post
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

    console.log('ChatGPT Response:', chatGptResponse.data);
    const blogContent = chatGptResponse.data.choices[0].message.content;
    console.log('Generated Blog Content:', blogContent);
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
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('ChatGPT Summary Response:', summaryResponse.data);
    const blogSummary = summaryResponse.data.choices[0].message.content;
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
  console.log(`Server is running on port ${PORT}`);
});
      