// update-score.js
const Pusher = require('pusher');
const axios = require('axios');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2021934',
  key: process.env.PUSHER_KEY || '34c3cbec9bc210bcb8c0',
  secret: process.env.PUSHER_SECRET || 'bf7971377aae56741385',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  // Add CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  // Check if environment variables are set
  if (!binId || !apiKey) {
    console.error('Missing JSONbin environment variables:', { binId: !!binId, apiKey: !!apiKey });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error - missing JSONbin credentials',
        details: 'JSONBIN_BIN_ID and JSONBIN_API_KEY must be set'
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { scoreData } = JSON.parse(event.body);
      console.log('Received score data for saving:', JSON.stringify(scoreData, null, 2));

      // Save to JSONbin for persistence
      const response = await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, scoreData, {
        headers: {
          "X-Master-Key": apiKey,
          "Content-Type": "application/json"
        }
      });

      console.log('JSONbin save response status:', response.status);

      // Send real-time update via Pusher
      await pusher.trigger('score-channel', 'score-updated', { scoreData });
      console.log('Pusher notification sent');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          scoreData,
          message: 'Data saved successfully'
        })
      };
    } catch (error) {
      console.error('Error in POST handler:', error.message);
      console.error('Error details:', error.response?.data || error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to save score data',
          details: error.message,
          jsonbinError: error.response?.data
        })
      };
    }
  }

  // GET request returns the current score from JSONbin
  if (event.httpMethod === 'GET') {
    try {
      console.log('Fetching data from JSONbin...');
      const response = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          "X-Master-Key": apiKey
        }
      });

      console.log('JSONbin fetch response status:', response.status);
      console.log('Retrieved data:', JSON.stringify(response.data.record, null, 2));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ scoreData: response.data.record })
      };
    } catch (error) {
      console.error('Error fetching from JSONbin:', error.message);
      console.error('Error details:', error.response?.data || error);
      
      // Return empty data structure if no data exists yet or if there's an error
      const defaultData = {
        rounds: [],
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Returning default data structure');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          scoreData: defaultData,
          warning: 'Using default data - JSONbin fetch failed',
          error: error.message
        })
      };
    }
  }

  return { 
    statusCode: 405, 
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
};