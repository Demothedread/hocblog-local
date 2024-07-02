/*/const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY; // Use environment variables for API keys
const WEBFLOW_API_URL = process.env.WEBFLOW_API_URL;
const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;

app.post('/webhook', async (req, res) => {
  const formData = req.body;

  // Check if 'topic' is provided in the formData
  if (!formData.topic) {
    return res.status(400).send('Missing required field: topic');
  }

  const prompt = `Generate a blog post about ${formData.topic} with the following details: ${JSON.stringify(formData)}`;

  try {
    // Call ChatGPT API
    const chatGptResponse = await axios.post(
      CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
        },
      }
    );

    const blogContent = chatGptResponse.data.choices[0].message.content;

    // Define required fields
    const requiredFields = [
      'title',
      'slug',
      { field: 'postBody', minLength: 10, maxLength: 1000 },
      { field: 'post-summary', minLength: 10, maxLength: 250 }
    ];

    // Validate required fields
    for (const field of requiredFields) {
      if (typeof field === 'string' && !formData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
      if (typeof field === 'object') {
        const fieldValue = formData[field.field];
        if (!fieldValue || fieldValue.length < field.minLength || fieldValue.length > field.maxLength) {
          throw new Error(`Field ${field.field} must be between ${field.minLength} and ${field.maxLength} characters`);
        }
      }
    }

    const cmsData = {
      fields: {
        name: formData.title,
        slug: formData.slug,
        'post-body': blogContent,
        'post-summary': formData.postSummary || '', // Optional field
        'main-image': formData.mainImage || '',     // Optional field
        'thumbnail-image': formData.thumbnailImage || '', // Optional field
        'featured': formData.featured || false,     // Optional field with default value
        color: formData.color || '',                // Optional field
        'link': formData.link || '',
        'attachments': formData.attachments || '',
        'additional-images': formData.additionalImages || ''
      },
    };

    // Call Webflow API to create a new CMS item
    const webflowResponse = await axios.post(
      WEBFLOW_API_URL,
      cmsData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WEBFLOW_API_KEY}`,
          'accept-version': '1.0.0',
        },
      }
    );

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});/*/

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`;
const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-blog', async (req, res) => {
  const { topic } = req.body;

  const prompt = `Generate a blog post about ${topic}`;

  try {
    // Call ChatGPT API
    const chatGptResponse = await axios.post(
      CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
        },
      }
    );

    const blogContent = chatGptResponse.data.choices[0].message.content;

    // Prepare data for Webflow CMS
    const cmsData = {
      fields: {
        name: `Blog Post About ${topic}`,
        slug: `blog-post-about-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        'post-body': blogContent,
        'post-summary': blogContent.slice(0, 250),
        'main-image': 'https://example.com/image.jpg', // Update with actual image URL
        'thumbnail-image': 'https://example.com/thumbnail.jpg', // Update with actual image URL
        'featured': false,
        color: '#000000'
      }
    };

    // Create CMS item on Webflow
    const webflowResponse = await axios.post(
      WEBFLOW_API_URL,
      { fields: cmsData.fields },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WEBFLOW_API_KEY}`,
          'accept-version': '1.0.0',
        },
      }
    );

    res.status(200).send('Blog post generated and added to Webflow CMS successfully');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

