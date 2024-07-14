// Import required modules and libraries
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config(); // Load environment variables from .env file

// Create an Express application
const app = express();

// Apply middleware for security and request handling
app.use(helmet()); // Set secure HTTP headers
app.use(express.json()); // Parse incoming request bodies in JSON format
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies attached to the client request

// Destructure environment variables with default values
const {
  PORT = 3000,
  ZAPIER_WEBHOOK_URL,
  WEBFLOW_COLLECTION_ID,
  CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions',
  DALLE_API_URL = 'https://api.openai.com/v1/images/generations',
  WEBFLOW_CLIENT_ID,
  WEBFLOW_CLIENT_SECRET,
  REDIRECT_URI,
  CHATGPT_API_KEY,
  ACCESS_TOKEN
} = process.env;

// Construct Webflow API URL using environment variable
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${WEBFLOW_COLLECTION_ID}/items`;

// Set Cache-Control header for all routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

// Log server start message
console.log(`Server is running on port ${PORT}`);

// Route for initiating authentication flow
app.get('/auth', (req, res) => {
  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  // Construct and redirect to the authorization URL
  const authUrl = `https://webflow.com/oauth/authorize?client_id=${WEBFLOW_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&state=${state}`;
  res.redirect(authUrl);
});

// Route for handling callback after authentication
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Retrieve access token using the authorization code
    const response = await axios.post('https://api.webflow.com/oauth/access_token', querystring.stringify({
      client_id: WEBFLOW_CLIENT_ID,
      client_secret: WEBFLOW_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    }));

    // Extract access token from the response and set it as a cookie
    const { access_token } = response.data;
    console.log(`Access Token: ${access_token}`);
    res.cookie('webflow_access_token', access_token, { httpOnly: true });
    res.redirect('/?authenticated=true');
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).send('Error getting access token');
  }
});

// Route for handling webhook and data export
app.post('/webhook', async (req, res) => {
  const { text } = req.body;

  if (text.startsWith('/export')) {
    // Extract data to be exported and send it to Zapier webhook
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

// Route for generating a blog post
app.post('/generate-blog', async (req, res) => {
  // Extract parameters for generating the blog post
   const { topic, length, comprehension, tone } = req.body;
   const prompt = `Generate a blog post about ${topic} with a length of ${length} for an audience with ${comprehension} level of comprehension and a tone of ${tone}.`;

  try {
    // Call ChatGPT API to generate the blog content
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

    // Extract the generated blog content from the API response
    const blogContent = chatGptResponse.data.choices[0].message.content;

    // Generate summary for the blog post
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

    // Extract the summarized content from the summary response
    const blogSummary = summaryResponse.data.choices[0].message.content;

    // Generate an image related to the blog post using DALL-E
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

    // Check if an image was generated by DALL-E
    if (dalleResponse.data.url) {
      const imageUrl = dalleResponse.data.url;
    }
      else { 
      throw new Error('No image generated by DALL-E');
    }

    // Prepare data for Webflow CMS
    const cmsData = {
      fields: {
        name: `Blog Post About ${topic}`,
        slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        'post-body': blogContent,
        'post-summary': blogSummary,
        'main-image': imageUrl, // Variable imageUrl is not defined here
        tags: ['example', 'blog', 'post'],
      }
    };

    // Retrieve Webflow access token from the client's cookies
    const webflowAccessToken = req.cookies.webflow_access_token;

    // Handle unauthenticated user attempting to generate a blog post
    if (!webflowAccessToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Send data to Webflow CMS via the API URL
    try {
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

      // Log Webflow API response and send success message
      console.log('Webflow Response:', webflowResponse.data);
      res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
    } catch (error) {
      // Log and handle errors from the Webflow API request
      console.error('Error processing request:', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
      }
      res.status(500).json({ message: 'Internal Server Error', error: error.message });

      // Log data to console if Webflow API fails
      console.log('Blog Data:', {
        topic,
        blogContent,
        blogSummary,
        imageUrl
      });
    }
  } catch (error) {
    // Log and handle errors from the blog post generation process
    console.error('Error generating blog post:', error);
    res.status(500).send('Error generating blog post');
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});