const RecurringPayment = require('../Model/RecurringPayment');
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transaction');

exports.handleDecentroWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received Decentro Webhook:', JSON.stringify(webhookData, null, 2));

    // TODO: Implement robust webhook validation (e.g., verify signature, IP whitelist)
    // Decentro webhooks typically include a signature for verification to ensure authenticity.
    
    const eventType = webhookData.event_type || webhookData.type;
    
    switch (eventType) {
      case 'MANDATE_STATUS_UPDATE':
      case 'mandate_status_update':
        await handleMandateStatusUpdate(webhookData);
        break;
        
      case 'PAYMENT_STATUS_UPDATE':
      case 'payment_status_update':
        await handlePaymentStatusUpdate(webhookData);
        break;
        
      case 'VIRTUAL_ACCOUNT_CREDIT':
      case 'virtual_account_credit':
        await handleVirtualAccountCredit(webhookData);
        break;
        
      default:
        console.log('Unknown webhook event type:', eventType);
    }

    res.status(200).json({ message: 'Webhook received and processed successfully' });
  } catch (error) {
    console.error('Error processing Decentro webhook:', error);
    res.status(500).json({ message: 'Failed to process webhook', error: error.message });
  }
};

// Handle eNACH mandate status updates
const handleMandateStatusUpdate = async (webhookData) => {
  const referenceId = webhookData.reference_id;
  const mandateId = webhookData.mandate_id;
  const status = webhookData.status;
  
  if (!referenceId && !mandateId) {
    console.warn('No reference_id or mandate_id in mandate status webhook');
    return;
  }
  
  // Map Decentro status to our internal status
  const statusMapping = {
    'ACTIVE': 'active',
    'PENDING': 'pending_approval',
    'REJECTED': 'failed',
    'CANCELLED': 'cancelled',
    'EXPIRED': 'failed'
  };
  
  const internalStatus = statusMapping[status] || 'pending';
  
  // Find and update the recurring payment
  const query = referenceId 
    ? { decentro_reference_id: referenceId }
    : { decentro_mandate_id: mandateId };
    
  const updatedPayment = await RecurringPayment.findOneAndUpdate(
    query,
    { 
      status: internalStatus,
      decentro_mandate_id: mandateId || updatedPayment?.decentro_mandate_id,
      decentro_mandate_details: webhookData 
    },
    { new: true }
  );
  
  if (updatedPayment) {
    console.log(`Updated recurring payment ${updatedPayment._id} to status: ${internalStatus}`);
  } else {
    console.warn(`Recurring payment not found for reference_id: ${referenceId} or mandate_id: ${mandateId}`);
  }
};

// Handle payment execution status updates
const handlePaymentStatusUpdate = async (webhookData) => {
  const referenceId = webhookData.reference_id;
  const status = webhookData.status;
  const amount = parseFloat(webhookData.amount);
  
  console.log(`Payment status update: ${referenceId} - ${status} - Amount: ${amount}`);
  
  // You can add logic here to track individual payment executions
  // For example, create a payment history record
};

// Handle virtual account credit notifications
const handleVirtualAccountCredit = async (webhookData) => {
  const referenceId = webhookData.reference_id;
  const amount = parseFloat(webhookData.amount);
  const transactionId = webhookData.transaction_id;
  
  if (!referenceId || !amount) {
    console.warn('Missing reference_id or amount in virtual account credit webhook');
    return;
  }
  
  // Find wallet by reference ID
  const wallet = await Wallet.findOne({ decentro_reference_id: referenceId });
  
  if (!wallet) {
    console.warn(`Wallet not found for reference_id: ${referenceId}`);
    return;
  }
  
  // Update wallet balance
  wallet.balance += amount;
  await wallet.save();
  
  // Create transaction record
  await Transaction.create({
    wallet_id: wallet._id,
    amount: amount,
    type: 'credit',
    status: 'completed',
    description: 'Virtual account credit',
    external_transaction_id: transactionId,
    source: 'decentro_virtual_account'
  });
  
  console.log(`Added ₹${amount} to wallet ${wallet._id} from virtual account credit`);
};
