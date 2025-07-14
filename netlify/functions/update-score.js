const Pusher = require('pusher');

let latestScore = 0;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { score } = JSON.parse(event.body);
    latestScore = score;

    await pusher.trigger('score-channel', 'score-updated', { score });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, score })
    };
  }

  // GET request returns the current score
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ score: latestScore })
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};