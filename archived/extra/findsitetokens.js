
import { WebflowClient } from 'webflow-api';

const token = process.env.WEBFLOW_API_TOKEN;
const webflow = new WebflowClient({ accessToken: token });

(async () => {
  try {
    const sites = await webflow.sites.list();
    console.log(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
});