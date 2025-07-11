const { Counter, collectDefaultMetrics, register } = require('prom-client');

// Start collecting default metrics
collectDefaultMetrics();

// Create a counter for login attempts
const loginCounter = new Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'], // 'success' or 'failed'
});

// Initialize counters to 0
loginCounter.inc({ status: 'success' }, 0);
loginCounter.inc({ status: 'failed' }, 0);

module.exports = {
  loginCounter,
  register
};
