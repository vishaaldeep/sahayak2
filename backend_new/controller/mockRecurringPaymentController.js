const RecurringPayment = require('../Model/RecurringPayment');
const User = require('../Model/User');
const Wallet = require('../Model/Wallet');
const WalletTransaction = require('../Model/WalletTransaction');

// Create recurring payment
const createRecurringPayment = async (req, res) => {
  try {
    const {
      employee_id,
      job_id,
      amount,
      frequency,
      interval_value = 1,
      description,
      end_date,
      max_payments,
      payment_method = 'UPI',
      bank_account
    } = req.body;

    const employer_id = req.user._id;

    // Validate employee exists
    const employee = await User.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate first payment date
    const startDate = new Date();
    const nextPaymentDate = new Date(startDate);
    
    switch (frequency) {
      case 'minutes':
        nextPaymentDate.setMinutes(nextPaymentDate.getMinutes() + interval_value);
        break;
      case 'hours':
        nextPaymentDate.setHours(nextPaymentDate.getHours() + interval_value);
        break;
      case 'daily':
        nextPaymentDate.setDate(nextPaymentDate.getDate() + interval_value);
        break;
      case 'weekly':
        nextPaymentDate.setDate(nextPaymentDate.getDate() + (interval_value * 7));
        break;
      case 'monthly':
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + interval_value);
        break;
    }

    // Create recurring payment record
    const recurringPayment = new RecurringPayment({
      employer_id,
      employee_id,
      seeker_id: employee_id, // For backward compatibility
      job_id,
      amount,
      frequency,
      interval_value,
      description: description || `Recurring payment for employee`,
      end_date,
      max_payments,
      payment_method,
      bank_account,
      next_payment_date: nextPaymentDate,
      start_date: startDate,
      status: 'active' // Set proper status
    });

    await recurringPayment.save();

    // Populate employee details for response
    await recurringPayment.populate('employee_id', 'name email phone_number');
    await recurringPayment.populate('employer_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Recurring payment flow created successfully',
      data: {
        recurring_payment: recurringPayment,
        decentro_response: {
          flow_id: recurringPayment.decentro_flow_id,
          status: 'SUCCESS',
          message: 'Payment flow created successfully',
          next_payment_date: nextPaymentDate
        }
      }
    });

  } catch (error) {
    console.error('Error creating recurring payment:', error);
    res.status(500).json({ 
      error: 'Failed to create recurring payment',
      details: error.message 
    });
  }
};

// Get recurring payments for employer
const getEmployerRecurringPayments = async (req, res) => {
  try {
    const employer_id = req.user._id;
    const { status, frequency } = req.query;

    const filter = { employer_id };
    if (status) filter.status = status;
    if (frequency) filter.frequency = frequency;

    const recurringPayments = await RecurringPayment.find(filter)
      .populate('employee_id', 'name email phone_number')
      .populate('job_id', 'title')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: recurringPayments,
      total: recurringPayments.length
    });

  } catch (error) {
    console.error('Error fetching recurring payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recurring payments',
      details: error.message 
    });
  }
};

// Get recurring payments for employee
const getEmployeeRecurringPayments = async (req, res) => {
  try {
    const employee_id = req.user._id;

    const recurringPayments = await RecurringPayment.find({ employee_id })
      .populate('employer_id', 'name email company_name')
      .populate('job_id', 'title')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: recurringPayments,
      total: recurringPayments.length
    });

  } catch (error) {
    console.error('Error fetching employee recurring payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recurring payments',
      details: error.message 
    });
  }
};

// Update recurring payment status
const updateRecurringPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employer_id = req.user._id;

    const recurringPayment = await RecurringPayment.findOne({
      _id: id,
      employer_id
    });

    if (!recurringPayment) {
      return res.status(404).json({ error: 'Recurring payment not found' });
    }

    recurringPayment.status = status;
    await recurringPayment.save();

    res.json({
      success: true,
      message: `Recurring payment ${status} successfully`,
      data: recurringPayment
    });

  } catch (error) {
    console.error('Error updating recurring payment:', error);
    res.status(500).json({ 
      error: 'Failed to update recurring payment',
      details: error.message 
    });
  }
};

// Process due payments (called by scheduler)
const processDuePayments = async () => {
  try {
    console.log('🔄 Processing due recurring payments...');

    const duePayments = await RecurringPayment.find({
      status: 'active',
      next_payment_date: { $lte: new Date() }
    }).populate('employee_id employer_id');

    console.log(`Found ${duePayments.length} due payments`);

    for (const payment of duePayments) {
      try {
        // Process the payment (mock)
        const paymentRecord = await payment.processPayment();
        
        // Create wallet transaction for employee
        await createWalletTransaction(payment, paymentRecord);
        
        console.log(`✅ Processed payment: ${paymentRecord.payment_id} for ${payment.amount}`);
        
      } catch (error) {
        console.error(`❌ Failed to process payment ${payment._id}:`, error);
        
        // Record failed payment
        payment.payment_history.push({
          amount: payment.amount,
          status: 'failed',
          payment_date: new Date(),
          failure_reason: error.message
        });
        await payment.save();
      }
    }

    return {
      processed: duePayments.length,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Error in processDuePayments:', error);
    throw error;
  }
};

// Create wallet transaction for successful payment
const createWalletTransaction = async (recurringPayment, paymentRecord) => {
  try {
    // Find or create employee wallet
    let wallet = await Wallet.findOne({ user_id: recurringPayment.employee_id._id });
    
    if (!wallet) {
      wallet = new Wallet({
        user_id: recurringPayment.employee_id._id,
        balance: 0
      });
    }

    // Update wallet balance
    wallet.balance += recurringPayment.amount;
    await wallet.save();

    // Create transaction record
    const transaction = new WalletTransaction({
      user_id: recurringPayment.employee_id._id,
      type: 'credit',
      amount: recurringPayment.amount,
      description: `Recurring payment: ${recurringPayment.description}`,
      status: 'completed',
      transaction_id: paymentRecord.transaction_id,
      metadata: {
        recurring_payment_id: recurringPayment._id,
        employer_id: recurringPayment.employer_id._id,
        employer_name: recurringPayment.employer_id.name,
        payment_frequency: recurringPayment.frequency,
        payment_method: recurringPayment.payment_method,
        decentro_flow_id: recurringPayment.decentro_flow_id,
        payment_record_id: paymentRecord.payment_id
      }
    });

    await transaction.save();

    console.log(`💰 Wallet transaction created: ${transaction.transaction_id}`);
    
    return transaction;

  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    throw error;
  }
};

// Get payment history for a specific recurring payment
const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user._id;

    // Check if user is employer or employee for this payment
    const recurringPayment = await RecurringPayment.findOne({
      _id: id,
      $or: [
        { employer_id: user_id },
        { employee_id: user_id }
      ]
    }).populate('employee_id employer_id');

    if (!recurringPayment) {
      return res.status(404).json({ error: 'Recurring payment not found' });
    }

    res.json({
      success: true,
      data: {
        recurring_payment: recurringPayment,
        payment_history: recurringPayment.payment_history,
        summary: {
          total_payments: recurringPayment.total_payments_made,
          total_amount: recurringPayment.total_amount_paid,
          next_payment: recurringPayment.next_payment_date,
          status: recurringPayment.status
        }
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment history',
      details: error.message 
    });
  }
};

// Manual payment trigger (for testing)
const triggerManualPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const employer_id = req.user._id;

    const recurringPayment = await RecurringPayment.findOne({
      _id: id,
      employer_id,
      status: 'active'
    }).populate('employee_id employer_id');

    if (!recurringPayment) {
      return res.status(404).json({ error: 'Active recurring payment not found' });
    }

    // Process payment immediately
    const paymentRecord = await recurringPayment.processPayment();
    
    // Create wallet transaction
    const transaction = await createWalletTransaction(recurringPayment, paymentRecord);

    res.json({
      success: true,
      message: 'Manual payment processed successfully',
      data: {
        payment_record: paymentRecord,
        transaction: transaction,
        next_payment_date: recurringPayment.next_payment_date
      }
    });

  } catch (error) {
    console.error('Error processing manual payment:', error);
    res.status(500).json({ 
      error: 'Failed to process manual payment',
      details: error.message 
    });
  }
};

module.exports = {
  createRecurringPayment,
  getEmployerRecurringPayments,
  getEmployeeRecurringPayments,
  updateRecurringPaymentStatus,
  processDuePayments,
  getPaymentHistory,
  triggerManualPayment
};