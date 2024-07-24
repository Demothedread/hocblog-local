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
    const webflowClient = await createWebflowClient(req.cookies.webflow_access_token);

    const webflowResponse = await webflowClient.post(
      `/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
      { fields: cmsData }
    );

    res.status(200).json({ message: 'Blog post created successfully', data: webflowResponse.data });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
