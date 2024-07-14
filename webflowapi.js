
import { WebflowClient } from 'webflow-api';

const token = 'WEBFLOW_API_KEY=8b64d6a90290b17c35303f7638a725f5617b0082282f90bbc2ecb1afa713d911';
const webflow = new WebflowClient({ accessToken: token });

(async () => {
  try {
    const sites = await webflow.sites.list();
    console.log(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
})();