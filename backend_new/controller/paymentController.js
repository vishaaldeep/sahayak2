const decentroService = require('../services/decentroService');
const User = require('../Model/User');
const Wallet = require('../Model/Wallet');

exports.createDecentroWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Internal wallet not found for user.' });
        }

        if (wallet.decentro_wallet_id) {
            return res.status(400).json({ message: 'Decentro wallet already exists for this user.' });
        }

        const decentroResponse = await decentroService.createWallet(userId, user.name, user.email, user.phone_number);
        res.status(200).json({ message: 'Decentro wallet creation initiated', data: decentroResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Decentro wallet', error: error.message });
    }
};

exports.fundWalletUpi = async (req, res) => {
    try {
        const { amount, virtualPaymentAddress, purpose } = req.body;
        const userId = req.user._id; // Assuming user is authenticated

        const wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet || !wallet.decentro_wallet_id) {
            return res.status(400).json({ message: 'Decentro wallet not linked to your internal wallet.' });
        }

        // Call Decentro service to initiate UPI collection
        const decentroResponse = await decentroService.initiateUpiCollection(
            wallet.decentro_wallet_id,
            amount,
            virtualPaymentAddress,
            purpose
        );

        res.status(200).json({ message: 'UPI collection initiated', data: decentroResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating UPI collection', error: error.message });
    }
};

exports.withdrawWalletUpi = async (req, res) => {
    try {
        const { amount, beneficiaryVpa, beneficiaryName } = req.body;
        const userId = req.user._id; // Assuming user is authenticated

        const wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet || !wallet.decentro_wallet_id) {
            return res.status(400).json({ message: 'Decentro wallet not linked to your internal wallet.' });
        }

        // Call Decentro service to initiate UPI payout
        const decentroResponse = await decentroService.initiateUpiPayout(
            wallet.decentro_wallet_id,
            amount,
            beneficiaryVpa,
            beneficiaryName
        );

        res.status(200).json({ message: 'UPI payout initiated', data: decentroResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating UPI payout', error: error.message });
    }
};