const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
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
  CHATGPT_API_KEY,
  ACCESS_TOKEN,
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  WORDPRESS_API_URL,
  WORDPRESS_API_TOKEN,
  INSTAGRAM_API_URL,
  INSTAGRAM_ACCESS_TOKEN
} = process.env;

const WEBFLOW_API_URL = `https://api.webflow.com/collections/${WEBFLOW_COLLECTION_ID}/items`;

// Initialize SQLite database
const db = new sqlite3.Database('./logs.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to database');
  }
});

// Create table for logging
db.run(`CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT,
  topic TEXT,
  summary TEXT,
  endpoint TEXT,
  link TEXT,
  additional_info TEXT
)`);

const logCall = (topic, summary, endpoint, link, additional_info) => {
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO logs (timestamp, topic, summary, endpoint, link, additional_info) VALUES (?, ?, ?, ?, ?, ?)`, 
    [timestamp, topic, summary, endpoint, link, additional_info], (err) => {
      if (err) {
        console.error('Error logging call', err);
      } else {
        console.log('Call logged successfully');
      }
  });
};

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
  try {
    const state = Math.random().toString(36).substring(7);
    const authorizationUri = oauth2.authorizeURL({
      redirect_uri: `${REDIRECT_URI}/callback`,
      scope: 'all',
      state,
    });

    console.log('Redirecting to:', authorizationUri);
    res.redirect(authorizationUri);
  } catch (error) {
    console.error('Error constructing authorization URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: `${REDIRECT_URI}/callback`,
  };

  try {
    const accessToken = await oauth2.getToken(options);
    console.log('Access Token received:', accessToken.token.access_token);
    res.cookie('webflow_access_token', accessToken.token.access_token, { httpOnly: true });
    res.redirect('/?authenticated=true');
  } catch (error) {
    console.error('Access Token Error:', error.message);
    res.status(500).json('Authentication failed');
  }
});

app.post('/create-webhook', async (req, res) => {
  const { event, url } = req.body;

  try {
    const response = await axios.post(`https://api.webflow.com/sites/${WEBFLOW_SITE_ID}/webhooks`, {
      triggerType: event,
      url,
    }, {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Webhook created:', response.data);
    res.status(200).json({ message: 'Webhook created successfully', webhook: response.data });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension, tone, contentDestination } = req.body;
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

    const cmsData = {
      name: `Blog Post About ${topic}`,
      slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
      'post-body': blogContent,
      'post-summary': blogSummary,
      'main-image': imageUrl,
      tags: ['example', 'blog', 'post']
    };

    let link = '';
    switch (contentDestination) {
      case 'Twitter':
        await postToTwitter(blogSummary);
        link = 'Twitter URL';
        break;
      case 'Webflow':
        await postToWebflow(cmsData);
        link = 'Webflow URL';
        break;
      case 'WordPress':
        await postToWordPress(cmsData);
        link = 'WordPress URL';
        break;
      case 'Instagram':
        await postToInstagram(blogSummary, imageUrl);
        link = 'Instagram URL';
        break;
      case 'Word':
        link = await exportToWord(cmsData);
        break;
      default:
        throw new Error('Unsupported content destination');
    }

    // Log the call
    logCall(topic, blogSummary, contentDestination, link, JSON.stringify(cmsData));

    res.status(200).json({ message: `Content generated and posted to ${contentDestination} successfully` });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

const postToTwitter = async (content) => {
  const Twitter = require('twitter');

  const client = new Twitter({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET,
    access_token_key: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  });

  try {
    const tweet = await client.post('statuses/update', { status: content });
    console.log('Tweet posted successfully:', tweet);
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw error;
  }
};

const postToWebflow = async (cmsData) => {
  const webflowAccessToken = req.cookies.webflow_access_token || ACCESS_TOKEN;

  if (!webflowAccessToken) {
    throw new Error('User not authenticated');
  }

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
};

const postToWordPress = async (cmsData) => {
  const response = await axios.post(
    WORDPRESS_API_URL,
    {
      title: cmsData.name,
      content: cmsData['post-body'],
      status: 'publish'
    },
    {
      headers: {
        'Authorization': `Bearer ${WORDPRESS_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('WordPress Response:', response.data);
};

const postToInstagram = async (content, imageUrl) => {
  const response = await axios.post(
    INSTAGRAM_API_URL,
    {
      caption: content,
      image_url: imageUrl
    },
    {
      headers: {
        'Authorization': `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Instagram Response:', response.data);
};

const exportToWord = async (cmsData) => {
  const doc = new Document();
  doc.addSection({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: cmsData.name,
            bold: true,
            size: 32,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: cmsData['post-summary'],
            italics: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: cmsData['post-body'],
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Image URL: ${cmsData['main-image']}`,
            size: 24,
            color: 'blue',
          }),
        ],
      }),
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = `./BlogPost_${Date.now()}.docx`;
  fs.writeFileSync(filePath, buffer);

  console.log('Word document created successfully');
  return filePath;
};

app.get('/logs', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving logs', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      res.status(200).json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
