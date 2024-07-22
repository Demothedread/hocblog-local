import { createWebflowClient } from '../utils/webflowUtils.js';

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
    const webflowClient = await createWebflowClient();

    const webflowResponse = await webflowClient.post(
      `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
      { fields: cmsData }
    );

    res.status(200).json({ message: 'Blog post created successfully', data: webflowResponse.data });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Server Error at Blog Step', error: error.message });
  }
};
