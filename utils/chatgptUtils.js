import fs from 'fs';
import path from 'path';

export const generateChatGPTPrompt = (topic, length, comprehension, tone, destination) => {
  return `Generate a ${length} word ${destination} about ${topic} with a comprehension level of ${comprehension} and a tone of ${tone}.`;
};

export const saveToCSV = (data) => {
  const csvFilePath = path.join(__dirname, '../history/archive.csv');
  const csvHeaders = 'Title,Subtitle,Content,Summary,ImageURL,Keywords,Category,Date\n';
  const csvContent = `${data.title},${data.subtitle},${data.content},${data.summary},${data.imageUrl},${data.keywords.join('|')},${data.category},${new Date().toISOString()}\n`;

  // Check if the file exists
  if (!fs.existsSync(csvFilePath)) {
    // If the file doesn't exist, write the headers first
    fs.writeFileSync(csvFilePath, csvHeaders, 'utf8');
  }

  // Append the new content
  fs.appendFileSync(csvFilePath, csvContent, 'utf8');
};
