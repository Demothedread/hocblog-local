import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

console.log('ChatGPT API key:', process.env.CHATGPT_API_KEY; 'chatgpt_API_URL:', process.env.CHATGPT_API_URL);

import { generateChatGPTPrompt, saveToCSV } from '../utils/chatgptUtils.js';

export const generateContentHandler = async (req, res) => {
  try {
    const { topic, length, comprehension, tone, destination } = req.body;

    // Validate input and handle potential edge cases
    if (!topic || !length || !comprehension || !tone || !destination) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const prompt = generateChatGPTPrompt(topic, length, comprehension, tone, destination);

    // Make all necessary API requests concurrently for improved performance
    const [chatGptResponse, summaryResponse, imageResponse] = await Promise.all([
      axios.post(process.env.CHATGPT_API_URL, {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 2800,
        temperature: 0.5
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
        console.log('ChatGPT response:', chatGptResponse.data);
      }),
      axios.post(process.env.CHATGPT_API_URL, {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: `Summarize the following blog post in 250 characters: ${prompt}` }],
        max_tokens: 175,
        temperature: 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }),
      console.log('ChatGPT response:', chatGptResponse.data);
      axios.post(process.env.DALLE_API_URL, {
        prompt: `Create an image that captures the essence of the following blog post: ${prompt.slice(0, 100)}`,
        n: 1,
        size: '512x512',
        response_format: 'url',
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
    ]);
    console.log('DALL-E response:', imageResponse.data);
    // Extract data from responses
    const content = chatGptResponse.data.choices[0].message.content;
    const summary = summaryResponse.data.choices[0].message.content;
    const imageUrl = imageResponse.data.data[0].url;

    // Construct response object
    const response = {
      title: `Blog Post About ${topic}`,
      subtitle: `Summary of ${topic}`,
      content,
      summary,
      imageUrl,
      keywords: ['example', 'blog', 'post'],
      category: 'General'
    };

    // Save to CSV and send successful response
    saveToCSV(response);
    res.status(200).json({ message: 'Content generated successfully', data: response });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: 'OPENAI-side Server Error', error: error.message });
  }
};
