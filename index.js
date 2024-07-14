const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

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

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

const oauth2 = new AuthorizationCode({
  client: {
    id: WEBFLOW_CLIENT_ID,
    secret: WEBFLOW_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://api.webflow.com',
    authorizeHost: 'https://webflow.com',
    authorizePath: '/oauth/authorize',
    tokenPath: '/oauth/access_token',
  },
});

app.get('/auth', (req, res) => {
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: REDIRECT_URI,
    scope: 'all',
    state: Math.random().toString(36).substring(7),
  });

  console.log('Redirecting to:', authorizationUri);
  res.redirect(authorizationUri);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: REDIRECT_URI,
  };

  try {
    const accessToken = await oauth2.getToken(options);
    console.log('Access Token received:', accessToken.token.access_token);
    res.cookie('webflow_access_token', accessToken.token.access_token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Access Token Error:', error.message);
    res.status(500).json('Authentication failed');
  }
});

app.get('/dashboard', (req, res) => {
  const token = req.cookies.webflow_access_token;
  if (!token) {
    return res.redirect('/auth');
  }

  console.log('Authenticated with token:', token);
  res.send('Authenticated! You can now interact with Webflow API.');
});

// Webhook and Blog Generation Routes
app.post('/webhook', async (req, res) => {
  const { text } = req.body;

  if (text.startsWith('/export')) {
    const dataToExport = text.replace('/export', '').trim();

    try {
      await axios.post(ZAPIER_WEBHOOK_URL, { data: dataToExport });
      console.log('Data exported successfully');
      res.status(200).send('Data exported successfully.');
    } catch (error) {
      console.error('Failed to export data:', error);
      res.status(500).send('Failed to export data.');
    }
  } else {
    res.status(200).send('No export command found.');
  }
});

app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension, tone } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension and a tone of ${tone}.`;

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

    const blogContent = chatGptResponse.data.choices[0].message.content;
    console.log('Blog content generated:', blogContent);

    // Generate summary
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
    console.log('Blog summary generated:', blogSummary);

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
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = dalleResponse.data.data[0].url;
    console.log('Image URL generated:', imageUrl);

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
        'main-image': imageUrl,
        tags: ['example', 'blog', 'post'],
      }
    };

    const webflowAccessToken = req.cookies.webflow_access_token;

    if (!webflowAccessToken) {
      console.error('User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Send data to Webflow CMS via API URL
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
  console.log(`Server is running on http://localhost:${PORT}`);
});