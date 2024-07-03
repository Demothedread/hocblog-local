const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`;
const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;

app.post('/generate-blog', async (req, res) => {
  const { topic, title, slug, postSummary, mainImage, thumbnailImage, featured, color, link, attachments, additionalImages } = req.body;

  // Validate required fields
  if (!topic || !title || !slug) {
    return res.status(400).json({ error: 'Missing required fields: topic, title, or slug' });
  }

  const prompt = `Generate a blog post about ${topic} with the following details: ${JSON.stringify(req.body)}`;

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
        name: title,
        slug: slug,
        'post-body': blogContent,
        'post-summary': postSummary || blogContent.slice(0, 250),
        'main-image': mainImage || '',
        'thumbnail-image': thumbnailImage || '',
        'featured': featured || false,
        color: color || '',
        link: link || '',
        attachments: attachments || '',
        'additional-images': additionalImages || ''
      }
    };

    // Send data to Webflow CMS
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

    res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully' });
  } catch (error) {
    console.error('Error processing request:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
