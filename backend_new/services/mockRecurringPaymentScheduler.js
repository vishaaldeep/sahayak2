const cron = require('node-cron');
const { processDuePayments } = require('../controller/mockRecurringPaymentController');

class MockRecurringPaymentScheduler {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Mock recurring payment scheduler is already running');
      return;
    }

    // Run every minute to check for due payments
    this.task = cron.schedule('* * * * *', async () => {
      try {
        const result = await processDuePayments();
        if (result.processed > 0) {
          console.log(`💰 Processed ${result.processed} recurring payments at ${result.timestamp}`);
        }
      } catch (error) {
        console.error('❌ Error in recurring payment scheduler:', error);
      }
    }, {
      scheduled: false
    });

    this.task.start();
    this.isRunning = true;
    console.log('🚀 Mock recurring payment scheduler started (runs every minute)');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log('⏹️ Mock recurring payment scheduler stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: 'Every minute',
      lastRun: new Date()
    };
  }

  // Manual trigger for testing
  async triggerNow() {
    try {
      console.log('🔄 Manually triggering recurring payment processing...');
      const result = await processDuePayments();
      console.log(`✅ Manual trigger completed: ${result.processed} payments processed`);
      return result;
    } catch (error) {
      console.error('❌ Manual trigger failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const mockRecurringPaymentScheduler = new MockRecurringPaymentScheduler();

module.exports = mockRecurringPaymentScheduler;