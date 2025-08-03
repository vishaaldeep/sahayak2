const cron = require('node-cron');
const RecurringPayment = require('../Model/RecurringPayment');
const decentroService = require('./decentroService');
const UserBankDetails = require('../Model/UserBankDetails');

class PaymentScheduler {
    constructor() {
        this.isRunning = false;
        this.retryAttempts = 3;
        this.retryDelay = 30 * 60 * 1000; // 30 minutes
    }

    // Start the payment scheduler
    start() {
        if (this.isRunning) {
            console.log('Payment scheduler is already running');
            return;
        }

        console.log('🚀 Starting automatic payment scheduler...');
        
        // Run every hour to check for due payments
        this.scheduledTask = cron.schedule('0 * * * *', async () => {
            await this.processDuePayments();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        // Run every 30 minutes to retry failed payments
        this.retryTask = cron.schedule('*/30 * * * *', async () => {
            await this.retryFailedPayments();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        this.isRunning = true;
        console.log('✅ Payment scheduler started successfully');
    }

    // Stop the payment scheduler
    stop() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
        }
        if (this.retryTask) {
            this.retryTask.stop();
        }
        this.isRunning = false;
        console.log('⏹️ Payment scheduler stopped');
    }

    // Process all due payments
    async processDuePayments() {
        try {
            console.log('🔍 Checking for due payments...');
            
            const now = new Date();
            const duePayments = await RecurringPayment.find({
                status: 'active',
                next_payment_date: { $lte: now }
            }).populate('seeker_id employer_id');

            console.log(`Found ${duePayments.length} due payments`);

            for (const payment of duePayments) {
                await this.executeAutomaticPayment(payment);
            }

        } catch (error) {
            console.error('Error processing due payments:', error);
        }
    }

    // Execute a single automatic payment
    async executeAutomaticPayment(recurringPayment) {
        try {
            console.log(`💰 Processing automatic payment for ${recurringPayment._id}`);

            const paymentReference = `AUTO_PAY_${recurringPayment._id}_${Date.now()}`;

            // Step 1: Execute eNACH payment (collect money from employer)
            const paymentResult = await decentroService.executeEnachPayment(
                recurringPayment.decentro_mandate_id,
                recurringPayment.amount,
                paymentReference
            );

            // Step 2: Transfer money to employee's account
            const seekerBankDetails = await UserBankDetails.findOne({ 
                user_id: recurringPayment.seeker_id._id 
            });

            if (!seekerBankDetails) {
                throw new Error('Employee bank details not found');
            }

            const payoutReference = `AUTO_PAYOUT_${recurringPayment._id}_${Date.now()}`;
            let payoutResult;

            // Try UPI first, then bank transfer
            if (seekerBankDetails.upi_vpa) {
                try {
                    payoutResult = await decentroService.initiateUpiPayout({
                        reference_id: payoutReference,
                        payee_account: seekerBankDetails.upi_vpa,
                        amount: recurringPayment.amount,
                        purpose_message: 'Automatic salary payment',
                        beneficiary_name: seekerBankDetails.account_holder_name
                    });
                } catch (upiError) {
                    console.log('UPI failed, trying bank transfer');
                    payoutResult = await decentroService.initiateBankPayout({
                        reference_id: payoutReference + '_BANK',
                        account_number: seekerBankDetails.account_number,
                        ifsc_code: seekerBankDetails.ifsc_code,
                        beneficiary_name: seekerBankDetails.account_holder_name,
                        amount: recurringPayment.amount,
                        purpose_message: 'Automatic salary payment'
                    });
                }
            } else {
                payoutResult = await decentroService.initiateBankPayout({
                    reference_id: payoutReference,
                    account_number: seekerBankDetails.account_number,
                    ifsc_code: seekerBankDetails.ifsc_code,
                    beneficiary_name: seekerBankDetails.account_holder_name,
                    amount: recurringPayment.amount,
                    purpose_message: 'Automatic salary payment'
                });
            }

            // Update payment record
            recurringPayment.last_payment_date = new Date();
            recurringPayment.last_payment_amount = recurringPayment.amount;
            recurringPayment.last_payment_reference = paymentReference;
            recurringPayment.last_payout_reference = payoutReference;
            recurringPayment.next_payment_date = this.calculateNextPaymentDate(
                recurringPayment.frequency
            );
            recurringPayment.retry_count = 0; // Reset retry count on success

            await recurringPayment.save();

            console.log(`✅ Automatic payment completed for ${recurringPayment._id}`);

        } catch (error) {
            console.error(`❌ Automatic payment failed for ${recurringPayment._id}:`, error.message);
            
            // Mark for retry
            recurringPayment.retry_count = (recurringPayment.retry_count || 0) + 1;
            recurringPayment.last_error = error.message;
            recurringPayment.last_retry_date = new Date();

            if (recurringPayment.retry_count >= this.retryAttempts) {
                recurringPayment.status = 'failed';
                console.log(`❌ Payment ${recurringPayment._id} marked as failed after ${this.retryAttempts} attempts`);
            }

            await recurringPayment.save();
        }
    }

    // Retry failed payments
    async retryFailedPayments() {
        try {
            const now = new Date();
            const retryTime = new Date(now.getTime() - this.retryDelay);

            const failedPayments = await RecurringPayment.find({
                status: 'active',
                retry_count: { $gt: 0, $lt: this.retryAttempts },
                last_retry_date: { $lte: retryTime }
            }).populate('seeker_id employer_id');

            console.log(`🔄 Found ${failedPayments.length} payments to retry`);

            for (const payment of failedPayments) {
                await this.executeAutomaticPayment(payment);
            }

        } catch (error) {
            console.error('Error retrying failed payments:', error);
        }
    }

    // Calculate next payment date based on frequency
    calculateNextPaymentDate(frequency) {
        const now = new Date();
        switch (frequency) {
            case 'daily':
                now.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                now.setDate(now.getDate() + 7);
                break;
            case 'bi-weekly':
                now.setDate(now.getDate() + 14);
                break;
            case 'monthly':
                now.setMonth(now.getMonth() + 1);
                break;
            default:
                now.setMonth(now.getMonth() + 1);
                break;
        }
        return now;
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay
        };
    }
}

// Export singleton instance
module.exports = new PaymentScheduler();