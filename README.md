# Autoblogger

Autoblogger is an application that takes ChatGPT output and uses a Heroku server to auto-create blog posts for Webflow. It also has the capability to trigger a Zapier webhook with the "/export" listener.

## Prerequisites

- Node.js installed on your machine
- Heroku CLI installed for deploying the server to Heroku
- Webflow account for creating blog posts
- Zapier account for setting up webhooks

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone <repository_url>
   ```

2. Navigate to the project directory:

   ```bash
   cd autoblogger
   ```

3. Install dependencies using npm:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:

   ```txt
   WEBFLOW_CLIENT_ID=your_webflow_client_id
   WEBFLOW_CLIENT_SECRET=your_webflow_client_secret
   REDIRECT_URI=your_redirect_uri
   ```

## Configuration

1. Obtain the `WEBFLOW_CLIENT_ID`, `WEBFLOW_CLIENT_SECRET`, and `REDIRECT_URI` from your Webflow account and update the `.env` file accordingly.

## Running the App/Program

1. Start the server by running the following command:

   ```bash
   npm start
   ```

2. The server will start running on the specified port, and you can access it using a web browser or make requests to its endpoints.

## Usage Examples

1. To initiate the authentication flow with Webflow, navigate to `http://localhost:3000/auth` in your web browser.
2. After successful authentication, the server will handle the callback and obtain the access token from Webflow.
3. You can then use the obtained access token to create blog posts or trigger the Zapier webhook as per your requirements.

## Reinitialization

If you need to reinitialize the application due to changes in configuration or environment variables, follow these steps:

1. Stop the running server if it's currently active.
2. Make necessary changes to the `.env` file or any other configuration files.
3. Restart the server using the `npm start` command.

## Troubleshooting Common Issues

- If you encounter issues with starting the server, ensure that all dependencies are installed correctly by running `npm install`.
- Check the `.env` file for any typos or incorrect values in the environment variables.
- If there are errors related to Webflow or Zapier integration, double-check the API credentials and configurations.

By following these setup instructions and usage examples, you should be able to run the Autoblogger application successfully and utilize its features for auto-creating blog posts and triggering webhooks.
