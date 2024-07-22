import express from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const {
  WEBFLOW_CLIENT_ID,
  WEBFLOW_CLIENT_SECRET,
  PORT = 3000,
  WEBFLOW_COLLECTION_ID,
  CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions',
  DALLE_API_URL = 'https://api.openai.com/v1/images/generations',
  CHATGPT_API_KEY,
  REDIRECT_URI,
  WEBFLOW_API_TOKEN
} = process.env;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Middleware to verify authentication and initialize Webflow client
app.use(async (req, res, next) => {
  try {
    const webflowAccessToken = req.cookies.webflow_access_token || WEBFLOW_API_TOKEN;

    if (!webflowAccessToken) {
      return res.status(401).json({ message: 'User not authenticated due to lack of access token' });
    }

    req.webflowClient = axios.create({
      baseURL: 'https://api.webflow.com',
      headers: {
        'Authorization': `Bearer ${webflowAccessToken}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0',
      }
    });

    next();
  } catch (error) {
    console.error('Error initializing Webflow client:', error);
    res.status(500).json({ message: 'Failed to initialize Webflow client' });
  }
});

// Route to initiate OAuth authentication with Webflow
app.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: REDIRECT_URI,
    scope: 'collections:write collections:read cms:read cms:write forms:write forms:read pages:write pages:read sites:write sites:read',
    state,
  });
  console.log('Redirecting to:', authorizationUri);
  res.redirect(authorizationUri);
});

// Callback route to handle OAuth redirect and token exchange
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: REDIRECT_URI,
  };

  try {
    let accessToken = req.cookies.webflow_access_token;

    if (!accessToken) {
      const result = await oauth2.getToken(options);
      accessToken = result.token.access_token;
      console.log('Access Token received:', accessToken);
      res.cookie('webflow_access_token', accessToken, { httpOnly: true });
    } else {
      console.log('Using existing access token');
    }

    res.redirect('https://www.hocomnia.com/autoblogger/?authenticated=true');
  } catch (error) {
    console.error('Access Token Error:', error.message);
    res.status(500).json('Authentication failed due to Access Token Error');
  }
});

// Route to generate blog post using ChatGPT and create Webflow CMS item
app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension, tone } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension and a tone of ${tone}.`;

  console.log('Generating blog with prompt:', prompt);

  try {
    // Generate blog content with ChatGPT
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

    // Generate blog summary with ChatGPT
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

    // Generate image using DALL-E
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
      name: `Blog Post About ${topic}`,
      slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
      'post-body': blogContent,
      'post-summary': blogSummary,
      'main-image': imageUrl,
      tags: ['example', 'blog', 'post'],
      isArchived: false,
      isDraft: false
    };

    // Create new item in Webflow CMS
    const webflowResponse = await req.webflowClient.post(`/collections/${WEBFLOW_COLLECTION_ID}/items`, {
      fields: cmsData
    });

    console.log('Webflow Response:', webflowResponse.data);
    res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
