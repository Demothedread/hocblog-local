const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

const {
  PORT,
  WEBFLOW_COLLECTION_ID,
  WEBFLOW_SITE_ID,
  WEBFLOW_API_KEY,
  CHATGPT_API_URL,
  DALLE_API_URL,
  CHATGPT_API_KEY
} = process.env;

// Middleware to initialize the Webflow client
const webflowClientMiddleware = (req, res, next) => {
  req.webflow = axios.create({
    baseURL: `https://api.webflow.com/sites/${WEBFLOW_SITE_ID}`,
    headers: {
      Authorization: `Bearer ${WEBFLOW_API_KEY}`,
      'accept-version': '1.0.0',
      'Content-Type': 'application/json'
    }
  });
  next();
};

// Apply the Webflow client middleware
app.use(webflowClientMiddleware);

app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension, tone } = req.body;
  const prompt = `Generate a blog post about ${topic} with a length of ${length} words, written in a ${tone} tone, suitable for a ${comprehension} comprehension level.`;

  try {
    const chatGptResponse = await axios.post(
      CHATGPT_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: parseInt(length),
      },
      {
        headers: {
          Authorization: `Bearer ${CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const blogContent = chatGptResponse.data.choices[0].message.content;

    const cmsData = {
      fields: {
        name: `Blog Post About ${topic}`,
        'post-body': blogContent,
        'slug': `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        'published': true
      }
    };

    const webflowResponse = await req.webflow.post(
      `/collections/${WEBFLOW_COLLECTION_ID}/items`,
      { fields: cmsData }
    );

    res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
