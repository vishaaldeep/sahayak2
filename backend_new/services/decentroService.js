const axios = require('axios');

const DECENTRO_BASE_URL = process.env.DECENTRO_BASE_URL || 'https://staging.api.decentro.tech'; // Use Decentro's sandbox or production URL
const DECENTRO_CLIENT_ID = process.env.DECENTRO_CLIENT_ID;
const DECENTRO_CLIENT_SECRET = process.env.DECENTRO_CLIENT_SECRET;
const DECENTRO_MODULE = 'CORE'; // Or 'PAYMENTS' depending on the API call

// Helper to generate a unique request ID
const generateRequestId = () => `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

// Function to get Decentro access token
const getAccessToken = async () => {
    try {
        const tokenUrl = `${DECENTRO_BASE_URL}/v2/auth/token`;

        console.log('Requesting Decentro access token from:', tokenUrl);
        console.log('DECENTRO_CLIENT_ID:', DECENTRO_CLIENT_ID);
        console.log('DECENTRO_CLIENT_SECRET:', DECENTRO_CLIENT_SECRET);
        const response = await axios.post(tokenUrl,
            {
                'grant_type': 'client_credentials',
                'client_id': DECENTRO_CLIENT_ID,
                'client_secret': DECENTRO_CLIENT_SECRET,

            },
            {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

        console.log('Decentro access token response:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Decentro access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get Decentro access token');
    }
};

// Generic Decentro API call helper
const callDecentroApi = async (method, url, data = {}, headers = {}) => {
    const accessToken = await getAccessToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'decentro-api-request-id': generateRequestId(),
        'decentro-api-process-id': generateRequestId(), // For idempotency
        'decentro-api-module': DECENTRO_MODULE,
        ...headers
    };

    try {
        const response = await axios({
            method,
            url: `${DECENTRO_BASE_URL}${url}`,
            headers: defaultHeaders,
            data
        });
        return response.data;
    } catch (error) {
        console.error(`Error calling Decentro API (${method} ${url}):`, error.response ? error.response.data : error.message);
        throw new Error(`Decentro API call failed: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
};

const User = require('../Model/User'); // Import User model
const Wallet = require('../Model/Wallet'); // Import Wallet model

// Wallet Creation (Example - adjust endpoint and payload as per Decentro docs)
const createWallet = async (userId, name, email, phone_number) => {
    const url = '/v2/accounts/wallet'; // Placeholder URL
    const data = {
        reference_id: `WALLET_CREATE_${userId}`, // Unique ID for this request
        mobile: phone_number,
        name: name,
        // Add other required fields as per Decentro's wallet creation API
    };
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('Decentro createWallet API response:', response);
        // Assuming Decentro returns a wallet ID in response.data.wallet_id
        if (response && response.wallet_id) {
            await Wallet.findOneAndUpdate({ user_id: userId }, { decentro_wallet_id: response.wallet_id });
            console.log(`Decentro wallet created and ID saved for user ${userId} in Wallet model`);
        }
        return response;
    } catch (error) {
        console.error('Error creating Decentro wallet:', error.message);
        throw error;
    }
};

// Placeholder to get Decentro wallet balance
const getWalletBalance = async (decentroWalletId) => {
    const url = `/v2/accounts/wallet/${decentroWalletId}/balance`; // Placeholder URL
    try {
        const response = await callDecentroApi('GET', url);
        // Assuming Decentro returns balance in response.data.balance
        return response.balance;
    } catch (error) {
        console.error('Error fetching Decentro wallet balance:', error.message);
        throw error;
    }
};

// Placeholder for UPI collection (fund wallet)
const initiateUpiCollection = async (userId, amount, virtualPaymentAddress, purpose) => {
    const url = '/v2/payments/upi/collection'; // Placeholder URL
    const data = {
        reference_id: `UPI_COLLECT_${userId}_${Date.now()}`,
        amount: amount,
        payer_vpa: virtualPaymentAddress, // VPA of the user making the payment
        purpose: purpose,
        // Add other required fields like payee_vpa (your virtual account), expiry_time etc.
    };
    return callDecentroApi('POST', url, data);
};

// Placeholder for UPI payout (withdraw from wallet)
const initiateUpiPayout = async (userId, amount, beneficiaryVpa, beneficiaryName) => {
    const url = '/v2/payments/upi/payout'; // Placeholder URL
    const data = {
        reference_id: `UPI_PAYOUT_${userId}_${Date.now()}`,
        amount: amount,
        beneficiary_vpa: beneficiaryVpa,
        beneficiary_name: beneficiaryName,
        // Add other required fields like sender_account, remarks etc.
    };
    return callDecentroApi('POST', url, data);
};

const initiateEmandate = async (mandateDetails) => {
    const url = '/v2/mandate/register'; // Placeholder URL for e-mandate registration
    // You will need to populate `mandateDetails` with all required fields
    // as per Decentro's e-mandate registration API documentation.
    // This typically includes payer details, payee details, amount, frequency,
    // start/end dates, and a unique reference ID.
    try {
        const response = await callDecentroApi('POST', url, mandateDetails);
        console.log('Decentro initiateEmandate API response:', response);
        return response;
    } catch (error) {
        console.error('Error initiating Decentro e-mandate:', error.message);
        throw error;
    }
};

module.exports = {
    createWallet,
    initiateUpiCollection,
    initiateUpiPayout,
    initiateEmandate,
    // Add other Decentro functions here
};
