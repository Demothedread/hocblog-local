const fetch = import('node-fetch');

const url = 'https://api.webflow.com/v2/collections/650723382c25db9b7cdbe29c/items';
const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: 'Bearer fbd0a47e0a852d54ed76d55c06218659beff8e6ab04bea872e59e3281cf81800'
  },
  body: JSON.stringify({isArchived: false, isDraft: false}),
  fields: [
    { name: "Post Body", type: "RichText" },
    {
      name: "Post Summary",
      type: "PlainText",
      helpText: "A summary of the blog post that appears on blog post grid",
      validations: { singleLine: false },
    },
    { name: "Main Image", type: "ImageRef" },
    {
      name: "Thumbnail image",
      type: "ImageRef",
      helpText:
        "Smaller version of main image that is used on blog post grid",
    },
    { name: "Featured?", type: "Bool" },
    { name: "Color", type: "Color" },
  ],
  title: "New Blog Post",
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));