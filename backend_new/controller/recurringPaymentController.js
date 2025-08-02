const RecurringPayment = require('../Model/RecurringPayment');
const User = require('../Model/User');
const UserBankDetails = require('../Model/UserBankDetails');
const decentroService = require('../services/decentroService');

// Helper function to calculate next payment date
const calculateNextPaymentDate = (frequency) => {
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
      break;
  }
  return now;
};

// Create a new recurring payment and initiate Decentro e-mandate
exports.createRecurringPayment = async (req, res) => {
  try {
    const { employer_id, seeker_id, amount, frequency } = req.body;

    // Basic validation
    if (!employer_id || !seeker_id || !amount || !frequency) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if employer and seeker exist
    const employer = await User.findById(employer_id);
    const seeker = await User.findById(seeker_id);

    if (!employer || !seeker) {
      return res.status(404).json({ message: 'Employer or Seeker not found' });
    }

    // Calculate initial next payment date
    const next_payment_date = calculateNextPaymentDate(frequency);

    // Create recurring payment record in our DB (status: pending)
    const newRecurringPayment = new RecurringPayment({
      employer_id,
      seeker_id,
      amount,
      frequency,
      next_payment_date,
      status: 'pending',
    });
    await newRecurringPayment.save();

    // Fetch bank details for employer and seeker
    const employerBankDetails = await UserBankDetails.findOne({ user_id: employer_id });
    const seekerBankDetails = await UserBankDetails.findOne({ user_id: seeker_id });

    if (!employerBankDetails) {
      return res.status(400).json({ message: 'Employer bank details not found. Please add them first.' });
    }
    if (!seekerBankDetails) {
      return res.status(400).json({ message: 'Seeker bank details not found. Please add them first.' });
    }

    // Prepare mandate details for Decentro
    const mandateDetails = {
      reference_id: `MANDATE_${newRecurringPayment._id.toString()}`,
      payer_name: employerBankDetails.account_holder_name,
      payer_account_number: employerBankDetails.account_number,
      payer_ifsc_code: employerBankDetails.ifsc_code,
      payer_upi_vpa: employerBankDetails.upi_vpa, // Optional, if UPI mandate
      payee_name: seekerBankDetails.account_holder_name,
      payee_account_number: seekerBankDetails.account_number,
      payee_ifsc_code: seekerBankDetails.ifsc_code,
      payee_upi_vpa: seekerBankDetails.upi_vpa, // Optional, if UPI mandate
      amount: amount.toString(),
      frequency: frequency, // Decentro might have specific enum values for frequency
      start_date: new Date().toISOString().split('T')[0], // Today's date
      // end_date: 'YYYY-MM-DD', // Optional: if mandate has an end date
      purpose: `Wage payment for ${seeker.name}`,
      // Add other required fields as per Decentro's e-mandate registration API
    };

    try {
      const decentroMandateResponse = await decentroService.initiateEmandate(mandateDetails);

      // Update recurring payment record with Decentro details
      newRecurringPayment.decentro_mandate_id = decentroMandateResponse.mandateId; // Adjust based on actual Decentro response field
      newRecurringPayment.decentro_mandate_details = decentroMandateResponse;
      newRecurringPayment.status = 'active'; // Assuming immediate activation, adjust if Decentro requires approval flow
      await newRecurringPayment.save();

      res.status(201).json({
        message: 'Recurring payment initiated and Decentro e-mandate setup successfully.',
        recurringPayment: newRecurringPayment,
      });
    } catch (decentroError) {
      // If Decentro mandate initiation fails, revert or mark as failed
      newRecurringPayment.status = 'failed';
      newRecurringPayment.decentro_mandate_details = { error: decentroError.message };
      await newRecurringPayment.save();
      console.error('Decentro e-mandate initiation failed:', decentroError);
      return res.status(500).json({ message: 'Failed to initiate Decentro e-mandate', error: decentroError.message });
    }
  } catch (error) {
    console.error('Error in createRecurringPayment:', error);
    res.status(500).json({ message: 'Error creating recurring payment', error: error.message });
  }
};

// Get all recurring payments for an employer
exports.getEmployerRecurringPayments = async (req, res) => {
  try {
    const { employer_id } = req.params;
    const payments = await RecurringPayment.find({ employer_id }).populate('seeker_id');
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employer recurring payments', error: error.message });
  }
};

// Get all recurring payments for a seeker
exports.getSeekerRecurringPayments = async (req, res) => {
  try {
    const { seeker_id } = req.params;
    const payments = await RecurringPayment.find({ seeker_id }).populate('employer_id');
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seeker recurring payments', error: error.message });
  }
};

// Update recurring payment status (e.g., from Decentro webhook)
exports.updateRecurringPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decentro_mandate_id, decentro_mandate_details } = req.body;

    const updatedPayment = await RecurringPayment.findByIdAndUpdate(
      id,
      { status, decentro_mandate_id, decentro_mandate_details },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }

    res.status(200).json({ message: 'Recurring payment updated successfully', updatedPayment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating recurring payment status', error: error.message });
  }
};
