import { createWebflowClient } from '../utils/webflowUtils.js';

const webflowClientMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.webflow_access_token || process.env.WEBFLOW_API_TOKEN;

    if (!accessToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    req.webflowClient = createWebflowClient(accessToken);
    next();
  } catch (error) {
    console.error('Error initializing Webflow client:', error);
    res.status(500).json({ message: 'Failed to initialize Webflow client' });
  }
};

export default webflowClientMiddleware;