const Pusher = require('pusher');

let latestScore = {};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2021934',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { scoreData } = JSON.parse(event.body);
    latestScore = scoreData;

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
  }

  // GET request returns the current score
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ scoreData: latestScore })
    };
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