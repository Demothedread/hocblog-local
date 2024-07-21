import express from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Webflow from 'webflow-api';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import App from './webflow.js';

// Load environment variables
dotenv.config();

const {
  WEBFLOW_CLIENT_ID,
  WEBFLOW_CLIENT_SECRET,
  SERVER_HOST,
  PORT = 3000,
  WEBFLOW_COLLECTION_ID,
  CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions',
  DALLE_API_URL = 'https://api.openai.com/v1/images/generations',
  CHATGPT_API_KEY,
  WEBFLOW_API_TOKEN,
  WEBFLOW_API_URL,
  ZAPIER_WEBHOOK_URL
} = process.env;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webflowApp = new App(WEBFLOW_CLIENT_ID, WEBFLOW_CLIENT_SECRET);

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

// Route to initiate OAuth authentication with Webflow
app.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: REDIRECT_URI,
    scope: [
      'collections:write',
      'collections:read',
      'assets:write',
      'assets:read',
      'forms:write',
      'forms:read',
      'pages:write',
      'pages:read',
      'sites:write',
      'sites:read',
      'ecommerce:write',
      'ecommerce:read',
      'user:write',
      'user:read',
      'workspace:write',
      'workspace:read',
      'components:read',
      'subscriptions:read',
      'activity:read',
      'user:read',
    ].join(' '),
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

    res.redirect('/?authenticated=true');
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

    const webflowAccessToken = req.cookies.webflow_access_token || WEBFLOW_API_TOKEN;

    if (!webflowAccessToken) {
      console.error('User not authenticated');
      return res.status(401).json({ message: 'User not authenticated due to lack of access token' });
    }

    // Create new item in Webflow CMS
    const webflowResponse = await axios.post(
      WEBFLOW_API_URL,
      { fields: cmsData },
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
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});

// Instantiate Fastify server
const fastifyServer = Fastify({
  logger: true,
});

// Webhook route
fastifyServer.post("/webhook", async (req, reply) => {
  try {
    const valid = webflowApp.verifyRequest(req.headers, req.body);
    if (!valid) return reply.status(401).send("Invalid request");

    const { site } = req.body;
    const token = await webflowApp.data.get(site);
    const webflow = new Webflow({ token });
    const user = await webflow.get("/user");

    reply.statusCode = 200;
    reply.send(user);
  } catch (error) {
    console.error('Webhook error:', error.message);
    reply.status(500).send('Internal Server Error');
  }
});

// Serve static files in Fastify
fastifyServer.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

fastifyServer.get("/", async (req, reply) => {
  await reply.sendFile("index.html");
});

fastifyServer.get("/auth", async (req, reply) => {
  const { code } = req.query;
  if (code) {
    try {
      const token = await webflowApp.install(code);
      await webflowApp.storeToken(token);
      reply.sendFile("index.html");
    } catch (error) {
      console.error('Auth error:', error.message);
      reply.status(500).send('Internal Server Error');
    }
  } else {
    const installUrl = webflowApp.installUrl();
    reply.redirect(installUrl);
  }
});

fastifyServer.get("/sites", async (req, reply) => {
  try {
    const token = await webflowApp.getToken();
    const webflow = new Webflow({ token });
    const sites = await webflow.get("/beta/sites");
    reply.send(sites);
  } catch (error) {
    console.error('Sites error:', error.message);
    reply.status(500).send('Internal Server Error');
  }
});

// Start Fastify server
fastifyServer.listen({ port: PORT, host: "localhost" }, (err) => {
  if (err) {
    console.error('Fastify server error:', err.message);
    throw err;
  }
  console.log(`Fastify server is running on http://localhost:${PORT}`);
});
