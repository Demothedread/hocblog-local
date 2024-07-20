# Autoblogger

Autoblogger is an application that allows users to generate content using ChatGPT and publish it directly to Webflow CMS. The app can also create tweets, Instagram posts, WordPress posts, and Word documents, but this guide focuses on generating blog posts for Webflow CMS.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Endpoints](#endpoints)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- Generate blog posts using ChatGPT.
- Publish generated content directly to Webflow CMS.
- Supports other content destinations: Twitter, Instagram, WordPress, and Word documents.
- Secure OAuth2 authentication with Webflow.

## Installation

### Prerequisites

- Node.js and npm installed
- A Webflow account
- Heroku account for hosting the server
- Webflow CMS API token
- ChatGPT API key

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/autoblogger.git
   cd autoblogger
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   WEBFLOW_COLLECTION_ID=your_webflow_collection_id
   CHATGPT_API_URL=https://api.openai.com/v1/chat/completions
   WEBFLOW_CLIENT_ID=your_webflow_client_id
   WEBFLOW_CLIENT_SECRET=your_webflow_client_secret
   REDIRECT_URI=https://hocblog-f5e15700baff.herokuapp.com/callback
   CHATGPT_API_KEY=your_chatgpt_api_key
   WEBFLOW_API_TOKEN=your_webflow_api_token
   ```

4. Deploy the server to Heroku:

   ```bash
   heroku create
   git push heroku main
   heroku config:set $(cat .env | xargs)
   ```

5. Host the client-side code on Webflow:
   - Create a new project on Webflow.
   - Add the `index.html` and `scripts.js` content to your Webflow site.
   - Ensure the form action points to your Heroku app URL.

## Usage

1. Visit the client-side homepage hosted on Webflow at `https://www.hocomnia.com/autoblogger`.
2. Authenticate with Webflow by clicking the "Authenticate" button.
3. Fill out the form with the required details (topic, length, comprehension level, tone).
4. Click "Generate" to create a blog post.
5. The generated content will be published to your Webflow CMS collection.

## Configuration

### Environment Variables

Ensure the following environment variables are set correctly in your `.env` file:

- `PORT`: The port the server will run on.
- `WEBFLOW_COLLECTION_ID`: The ID of your Webflow CMS collection.
- `CHATGPT_API_URL`: The API URL for ChatGPT.
- `WEBFLOW_CLIENT_ID`: Your Webflow client ID for OAuth.
- `WEBFLOW_CLIENT_SECRET`: Your Webflow client secret for OAuth.
- `REDIRECT_URI`: The redirect URI set in your Webflow app configuration.
- `CHATGPT_API_KEY`: Your ChatGPT API key.
- `WEBFLOW_API_TOKEN`: Your Webflow API token.

## Endpoints

### Authentication

- **GET `/auth`**: Initiates the OAuth flow with Webflow.
- **GET `/callback`**: Handles the OAuth callback from Webflow.

### Content Generation

- **POST `/generate-blog`**: Generates a blog post using ChatGPT and publishes it to Webflow CMS.

## Troubleshooting

### Common Issues

1. **Bad Redirect_URI**:
   - Ensure the redirect URI in your Webflow app settings matches the one in your `.env` file and OAuth requests.
   - The redirect URI should be URL-encoded.

2. **Authentication Failures**:
   - Check the validity of your Webflow client ID, client secret, and API token.
   - Ensure the OAuth flow is correctly implemented and the `access_token` is being stored and used correctly.

3. **Deployment Issues**:
   - Ensure all environment variables are correctly set in Heroku.
   - Check the Heroku logs for errors: `heroku logs --tail`.

### Logs and Debugging

- Use `console.log` statements in your server and client code to trace issues.
- Check the server logs for errors using Heroku CLI: `heroku logs --tail`.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

By following this README, you should be able to set up and use the Autoblogger app to generate and publish blog posts to Webflow CMS seamlessly. For any issues or contributions, please refer to the [Contributing](#contributing) section
