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
      employee_id: seeker_id, // For compatibility
      amount,
      frequency,
      next_payment_date,
      status: 'pending',
      description: `Recurring payment from ${employer.name} to ${seeker.name}`,
      interval_value: 1
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

    // Map frequency to Decentro format
    const frequencyMapping = {

      'daily': 'daily',
      'weekly': 'weekly', 
      'bi-weekly': 'fortnightly',
      'monthly': 'monthly'
    };
    
    const decentroFrequency = frequencyMapping[frequency] || 'monthly';
    
    // Calculate end date (1 year from start date by default)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    // Prepare eNACH mandate details for Decentro
    const mandateDetails = {
      reference_id: `ENACH_${newRecurringPayment._id.toString()}`,
      payer_name: employerBankDetails.account_holder_name,
      payer_mobile: employer.phone_number,
      payer_email: employer.email,
      payer_account_number: employerBankDetails.account_number,
      payer_account_ifsc: employerBankDetails.ifsc_code,
      payer_pan: employerBankDetails.pan || employer.pan || 'ABCDE1234F', // Use PAN from bank details or user
      account_type: employerBankDetails.account_type || 'SAVINGS',
      amount: amount.toString(),
      amount_type: 'MAXIMUM', // Can be FIXED or MAXIMUM
      frequency: decentroFrequency,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      category_code: 'elec', // Utility/electricity category
      authentication_mode: 'DebitCard' // or 'Netbanking'
    };

    try {
      const decentroMandateResponse = await decentroService.createEnachMandate(mandateDetails);

      // Update recurring payment record with Decentro details
      newRecurringPayment.decentro_mandate_id = decentroMandateResponse.data?.mandate_id || decentroMandateResponse.mandate_id;
      newRecurringPayment.decentro_mandate_details = decentroMandateResponse;
      newRecurringPayment.decentro_reference_id = mandateDetails.reference_id;
      
      // Check if mandate requires authentication
      if (decentroMandateResponse.data?.authentication_url) {
        newRecurringPayment.status = 'pending_authentication';
        newRecurringPayment.authentication_url = decentroMandateResponse.data.authentication_url;
      } else {
        newRecurringPayment.status = 'pending_approval';
      }
      
      await newRecurringPayment.save();

      res.status(201).json({
        message: 'eNACH mandate initiated successfully. Please complete authentication if required.',
        recurringPayment: newRecurringPayment,
        authentication_url: decentroMandateResponse.data?.authentication_url,
      });
    } catch (decentroError) {
      // If Decentro mandate initiation fails, revert or mark as failed
      newRecurringPayment.status = 'failed';
      newRecurringPayment.decentro_mandate_details = { error: decentroError.message };
      await newRecurringPayment.save();
      console.error('Decentro eNACH mandate initiation failed:', decentroError);
      return res.status(500).json({ message: 'Failed to initiate Decentro eNACH mandate', error: decentroError.message });
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

// Check eNACH mandate status
exports.checkMandateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const recurringPayment = await RecurringPayment.findById(id);
    
    if (!recurringPayment) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }
    
    if (!recurringPayment.decentro_reference_id) {
      return res.status(400).json({ message: 'No Decentro reference ID found' });
    }
    
    const mandateStatus = await decentroService.getEnachMandateStatus(recurringPayment.decentro_reference_id);
    
    // Update local status based on Decentro response
    if (mandateStatus.data?.status) {
      const statusMapping = {
        'ACTIVE': 'active',
        'PENDING': 'pending_approval',
        'REJECTED': 'failed',
        'CANCELLED': 'cancelled'
      };
      
      const newStatus = statusMapping[mandateStatus.data.status] || recurringPayment.status;
      if (newStatus !== recurringPayment.status) {
        recurringPayment.status = newStatus;
        recurringPayment.decentro_mandate_details = mandateStatus;
        await recurringPayment.save();
      }
    }
    
    res.status(200).json({
      message: 'Mandate status retrieved successfully',
      status: mandateStatus,
      recurringPayment
    });
  } catch (error) {
    console.error('Error checking mandate status:', error);
    res.status(500).json({ message: 'Error checking mandate status', error: error.message });
  }
};

// Execute a payment for an active mandate
exports.executePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    const recurringPayment = await RecurringPayment.findById(id).populate('seeker_id');
    
    if (!recurringPayment) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }
    
    if (recurringPayment.status !== 'active') {
      return res.status(400).json({ message: 'Mandate is not active' });
    }
    
    const paymentAmount = amount || recurringPayment.amount;
    const paymentReference = `PAY_${recurringPayment._id}_${Date.now()}`;
    
    // Step 1: Execute eNACH payment (collect money from employer)
    const paymentResult = await decentroService.executeEnachPayment(
      recurringPayment.decentro_mandate_id,
      paymentAmount,
      paymentReference
    );
    
    // Step 2: Transfer money to employee's account
    try {
      // Get employee's bank details
      const seekerBankDetails = await UserBankDetails.findOne({ user_id: recurringPayment.seeker_id._id });
      
      if (!seekerBankDetails) {
        console.error('Employee bank details not found for payout');
        return res.status(400).json({ message: 'Employee bank details not found for payout' });
      }
      
      // Create payout to employee
      const payoutReference = `PAYOUT_${recurringPayment._id}_${Date.now()}`;
      let payoutResult;
      
      // Try UPI payout first if UPI VPA is available
      if (seekerBankDetails.upi_vpa) {
        const upiPayoutDetails = {
          reference_id: payoutReference,
          payee_account: seekerBankDetails.upi_vpa,
          amount: paymentAmount,
          purpose_message: `Salary payment from employer`,
          beneficiary_name: seekerBankDetails.account_holder_name
        };
        
        try {
          payoutResult = await decentroService.initiateUpiPayout(upiPayoutDetails);
        } catch (upiError) {
          console.log('UPI payout failed, trying bank transfer:', upiError.message);
          // Fallback to bank transfer
          const bankPayoutDetails = {
            reference_id: payoutReference + '_BANK',
            account_number: seekerBankDetails.account_number,
            ifsc_code: seekerBankDetails.ifsc_code,
            beneficiary_name: seekerBankDetails.account_holder_name,
            amount: paymentAmount,
            purpose_message: `Salary payment from employer`
          };
          payoutResult = await decentroService.initiateBankPayout(bankPayoutDetails);
        }
      } else {
        // Use bank transfer if no UPI VPA
        const bankPayoutDetails = {
          reference_id: payoutReference,
          account_number: seekerBankDetails.account_number,
          ifsc_code: seekerBankDetails.ifsc_code,
          beneficiary_name: seekerBankDetails.account_holder_name,
          amount: paymentAmount,
          purpose_message: `Salary payment from employer`
        };
        payoutResult = await decentroService.initiateBankPayout(bankPayoutDetails);
      }
      
      // Update next payment date
      recurringPayment.next_payment_date = calculateNextPaymentDate(recurringPayment.frequency);
      recurringPayment.last_payment_date = new Date();
      recurringPayment.last_payment_amount = paymentAmount;
      recurringPayment.last_payment_reference = paymentReference;
      recurringPayment.last_payout_reference = payoutReference;
      await recurringPayment.save();
      
      res.status(200).json({
        message: 'Payment executed and transferred to employee successfully',
        paymentResult,
        payoutResult,
        nextPaymentDate: recurringPayment.next_payment_date
      });
      
    } catch (payoutError) {
      console.error('Error in employee payout:', payoutError);
      // Payment was collected but payout failed - this needs manual intervention
      res.status(207).json({ // 207 = Multi-Status
        message: 'Payment collected from employer but payout to employee failed. Manual intervention required.',
        paymentResult,
        payoutError: payoutError.message,
        status: 'partial_success'
      });
    }
    
  } catch (error) {
    console.error('Error executing payment:', error);
    res.status(500).json({ message: 'Error executing payment', error: error.message });
  }
};
