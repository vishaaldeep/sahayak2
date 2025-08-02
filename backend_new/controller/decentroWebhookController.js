const RecurringPayment = require('../Model/RecurringPayment');

exports.handleDecentroWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received Decentro Webhook:', JSON.stringify(webhookData, null, 2));

    // TODO: Implement robust webhook validation (e.g., verify signature, IP whitelist)
    // Decentro webhooks typically include a signature for verification to ensure authenticity.
    // You should compare this signature with one generated using your shared secret.

    // Extract relevant information from the webhook data
    // The exact fields will depend on Decentro's webhook payload structure.
    // For e-mandates, you'd typically look for mandate status updates.
    const decentroMandateId = webhookData.mandateId; // Placeholder - adjust to actual field name
    const newStatus = webhookData.status; // Placeholder - adjust to actual field name
    const transactionDetails = webhookData; // Store the full webhook data for debugging/auditing

    if (!decentroMandateId || !newStatus) {
      return res.status(400).json({ message: 'Missing required webhook data (mandateId or status)' });
    }

    // Find the recurring payment by Decentro mandate ID and update its status
    const updatedPayment = await RecurringPayment.findOneAndUpdate(
      { decentro_mandate_id: decentroMandateId },
      { status: newStatus, decentro_mandate_details: transactionDetails },
      { new: true }
    );

    if (!updatedPayment) {
      console.warn(`Recurring payment with Decentro Mandate ID ${decentroMandateId} not found.`);
      return res.status(404).json({ message: 'Recurring payment not found for the given mandate ID' });
    }

    console.log(`Updated recurring payment ${updatedPayment._id} to status: ${newStatus}`);
    res.status(200).json({ message: 'Webhook received and processed successfully' });
  } catch (error) {
    console.error('Error processing Decentro webhook:', error);
    res.status(500).json({ message: 'Failed to process webhook', error: error.message });
  }
};
