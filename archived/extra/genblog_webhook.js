// Using async/await for improved readability and error handling

const axios = require('axios');
const fetch = require('node-fetch');

// Function to make GET request using axios
async function makeGetRequest() {
  try {
    const response = await axios.get('https://api.webflow.com/v2/token/introspect', {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer 34926062b8b482e1d863f6477b2b7ecc8165fc68c4e0ffcc8225f41091f72c35'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Function to make POST request using node-fetch
async function makePostRequest() {
  try {
    const response = await fetch('https://api.webflow.com/v2/sites/65050d3f9ffb9aca83de1724/webhooks', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer 34926062b8b482e1d863f6477b2b7ecc8165fc68c4e0ffcc8225f41091f72c35'
      },
      body: JSON.stringify({ triggerType: 'form_submission' })
    });
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error('error:', error);
  }
}

// Call the functions to make the requests
makeGetRequest();
makePostRequest();
