import axios from 'axios';
import { generateChatGPTPrompt, saveToCSV } from '../utils/chatgptUtils.js';

const prompt = generateChatGPTPrompt(topic, length, comprehension, tone, destination);

export const generateContent = async (req, res) => {
  const { topic, length, comprehension, tone, destination } = req.body;

  try {
    const chatGptResponse = await axios.post(
      process.env.CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 2800,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = chatGptResponse.data.choices[0].message.content;

    // Generate summary
    const summaryResponse = await axios.post(
      process.env.CHATGPT_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: `Summarize the following blog post in 250 characters: ${content}` }],
        max_tokens: 175,
        temperature: 0.4
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = summaryResponse.data.choices[0].message.content;
                                                                                                                                                                                                                                                                                                    
    // Generate image
    const imageResponse = await axios.post(
      process.env.DALLE_API_URL,
      {
        prompt: `Create an image that captures the essence of the following blog post: ${summary.slice(0, 100)}`,
        n: 1,
        size: '512x512',
        response_format: 'url',
        model: 'dall-e-2',
        style: 'vivid'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = imageResponse.data.data[0].url;

    const response = {
      title: `Blog Post About ${topic}`,
      subtitle: `Summary of ${topic}`,
      content,
      summary,
      imageUrl,
      keywords: ['example', 'blog', 'post'],
      category: 'General'
    };

    saveToCSV(response);

    res.status(200).json({ message: 'Content generated successfully', data: response });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};