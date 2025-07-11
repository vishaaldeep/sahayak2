
const Retell = require('retell-sdk');

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

const handleRetellAuth = async (req, res) => {
  try {
    const response = await retell.call.createWebCall({
      agent_id: 'agent_cddbdef68cf6796ee7258beaee',
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Retell call' });
  }
};

module.exports = { handleRetellAuth };
