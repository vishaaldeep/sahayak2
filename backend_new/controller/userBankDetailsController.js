const UserBankDetails = require('../Model/UserBankDetails');

// Create or update user bank details
exports.createOrUpdateUserBankDetails = async (req, res) => {
  try {
    const { user_id, account_number, ifsc_code, bank_name, account_holder_name, upi_vpa } = req.body;

    if (!user_id || !account_number || !ifsc_code || !bank_name || !account_holder_name) {
      return res.status(400).json({ message: 'Missing required bank details fields' });
    }

    const existingDetails = await UserBankDetails.findOne({ user_id });

    if (existingDetails) {
      // Update existing details
      existingDetails.account_number = account_number;
      existingDetails.ifsc_code = ifsc_code;
      existingDetails.bank_name = bank_name;
      existingDetails.account_holder_name = account_holder_name;
      existingDetails.upi_vpa = upi_vpa;
      await existingDetails.save();
      res.status(200).json({ message: 'User bank details updated successfully', userBankDetails: existingDetails });
    } else {
      // Create new details
      const newUserBankDetails = new UserBankDetails({
        user_id,
        account_number,
        ifsc_code,
        bank_name,
        account_holder_name,
        upi_vpa,
      });
      await newUserBankDetails.save();
      res.status(201).json({ message: 'User bank details created successfully', userBankDetails: newUserBankDetails });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating or updating user bank details', error: error.message });
  }
};

// Get user bank details by user_id
exports.getUserBankDetails = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userBankDetails = await UserBankDetails.findOne({ user_id });

    if (!userBankDetails) {
      return res.status(404).json({ message: 'User bank details not found' });
    }

    res.status(200).json(userBankDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user bank details', error: error.message });
  }
};
