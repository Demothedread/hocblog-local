import axios from 'axios';

export const createBlogPost = async (req, res) => {
  const { title, slug, postBody, postSummary, mainImage } = req.body;

  const cmsData = {
    name: title,
    slug,
    'post-body': postBody,
    'post-summary': postSummary,
    'main-image': mainImage,
    isArchived: false,
    isDraft: false,
  };

  try {
    const webflowAccessToken = req.cookies.webflow_access_token || process.env.WEBFLOW_API_TOKEN;

    if (!webflowAccessToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const webflowResponse = await axios.post(
      `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
      { fields: cmsData },
      {
        headers: {
          'Authorization': `Bearer ${webflowAccessToken}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0',
        },
      }
    );

    res.status(200).json({ message: 'Blog post created successfully', data: webflowResponse.data });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};