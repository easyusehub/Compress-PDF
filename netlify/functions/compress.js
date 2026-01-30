const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  try {
    const apiKey = process.env.ILOVEPDF_API_KEY;
    if(!apiKey) throw new Error("API key missing");

    const { fileUrl } = JSON.parse(event.body);

    const form = new FormData();
    form.append("task", "compress");
    form.append("file", fileUrl);

    const response = await fetch("https://api.ilovepdf.com/v1/compress", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadUrl: data.file.url })
    };
  } catch(err){
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
