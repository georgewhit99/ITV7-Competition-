const axios = require("axios");

exports.handler = async (event) => {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  const newScore = JSON.parse(event.body);

  try {
    await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, newScore, {
      headers: {
        "X-Master-Key": apiKey,
        "Content-Type": "application/json"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Score updated" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update score" })
    };
  }
};