const axios = require("axios");

exports.handler = async () => {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  try {
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data.record)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch score" })
    };
  }
};