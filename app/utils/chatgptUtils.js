import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Configuration, OpenAIApi } from 'openai';

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateChatGPTPrompt = (topic, length, comprehension, tone, destination) => {
  return `Generate a ${length} word ${destination} about ${topic} with a comprehension level of ${comprehension} and a tone of ${tone}.`;
};

export const saveToCSV = (data) => {
  const csvDirPath = path.join(__dirname, '../history');
  const csvFilePath = path.join(csvDirPath, 'archive.csv');
  const csvHeaders = 'Title,Subtitle,Content,Summary,ImageURL,Keywords,Category,Date\n';
  const csvContent = `"${data.title}","${data.subtitle}","${data.content}","${data.summary}","${data.imageUrl}","${data.keywords.join('|')}","${data.category}","${new Date().toISOString()}"\n`;

  try {
    // Ensure the directory exists
    if (!fs.existsSync(csvDirPath)) {
      fs.mkdirSync(csvDirPath, { recursive: true });
    }

    // Check if the file exists and write headers if it doesn't
    if (!fs.existsSync(csvFilePath)) {
      fs.writeFileSync(csvFilePath, csvHeaders, 'utf8');
    }

    // Append the new content
    fs.appendFileSync(csvFilePath, csvContent, 'utf8');
  } catch (error) {
    console.error('Error saving to CSV:', error);
  }
};
