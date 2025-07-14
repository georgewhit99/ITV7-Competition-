const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

exports.handler = async (event) => {
  const { score } = JSON.parse(event.body);

  await pusher.trigger('score-channel', 'score-updated', { score });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, score })
  };
};

