import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import axios from 'axios';
import Webflow from 'webflow-api';
import Bottleneck from 'bottleneck';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000,
});

const webflowApi = new Webflow({ token: process.env.WF_API_KEY });

app.post('/generate-blog', async (req, res) => {
  const { topic, length, comprehension, tone } = req.body;

  const prompt = `Generate a blog post about ${topic} with a length of ${length} words, targeting an audience with ${comprehension} comprehension level and a ${tone} tone.`;

  try {
    const chatGptResponse = await axios.post(
      process.env.CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: length === 'Custom' ? 3000 : parseInt(length, 10),
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const blogContent = chatGptResponse.data.choices[0].message.content;

    const response = {
      title: `Blog Post About ${topic}`,
      subtitle: `Summary of ${topic}`,
      content: blogContent,
      summary: blogContent.split('\n')[0], // First paragraph as summary
      imageUrl: '', // Placeholder for now
      keywords: ['example', 'blog', 'post'],
      category: 'General',
    };

    saveToCSV(response);

    // Generate image
    const imageResponse = await axios.post(
      process.env.DALLE_API_URL,
      {
        prompt: `Create an image that captures the essence of the following blog post: ${response.summary.slice(0, 100)}`,
        n: 1,
        size: '512x512',
        response_format: 'url',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    response.imageUrl = imageResponse.data.data[0].url;

    const webflowResponse = await createBlogPost(response);

    res.status(200).json({ message: 'Blog post generated and added to Webflow CMS successfully', webflowData: webflowResponse });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

async function createBlogPost(blogData) {
  try {
    return await webflowApi.createItem({
      collectionId: process.env.WEBFLOW_COLLECTION_ID,
      fields: {
        name: blogData.title,
        slug: blogData.title.toLowerCase().replace(/\s+/g, '-'),
        'post-body': blogData.content,
        'post-summary': blogData.summary,
        'main-image': blogData.imageUrl,
        tags: blogData.keywords,
        _archived: false,
        _draft: false,
      },
    });
  } catch (err) {
    console.error('Error creating blog post in Webflow:', err);
    throw err;
  }
}

function saveToCSV(data) {
  const fs = require('fs');
  const path = require('path');
  const csvFilePath = path.join(__dirname, 'history/archive.csv');
  const csvHeaders = 'Title,Subtitle,Content,Summary,ImageURL,Keywords,Category,Date\n';
  const csvContent = `${data.title},${data.subtitle},${data.content},${data.summary},${data.imageUrl},${data.keywords.join('|')},${data.category},${new Date().toISOString()}\n`;

  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, csvHeaders, 'utf8');
  }

  fs.appendFileSync(csvFilePath, csvContent, 'utf8');
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
