// update-score.js
const Pusher = require('pusher');
const axios = require('axios');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2021934',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  if (event.httpMethod === 'POST') {
    const { scoreData } = JSON.parse(event.body);

    try {
      // Save to JSONbin for persistence
      await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, scoreData, {
        headers: {
          "X-Master-Key": apiKey,
          "Content-Type": "application/json"
        }
      });

      // Send real-time update via Pusher
      await pusher.trigger('score-channel', 'score-updated', { scoreData });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ success: true, scoreData })
      };
    } catch (error) {
      console.error('Error saving to JSONbin:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'Failed to save score data' })
      };
    }
  }

  // GET request returns the current score from JSONbin
  if (event.httpMethod === 'GET') {
    try {
      const response = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          "X-Master-Key": apiKey
        }
      });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ scoreData: response.data.record })
      };
    } catch (error) {
      console.error('Error fetching from JSONbin:', error);
      // Return empty data structure if no data exists yet
      const defaultData = {
        rounds: [],
        lastUpdated: new Date().toISOString()
      };
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ scoreData: defaultData })
      };
    }
  }

  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};