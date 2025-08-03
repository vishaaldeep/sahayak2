const axios = require('axios');

const DECENTRO_BASE_URL = process.env.DECENTRO_BASE_URL || 'https://staging.api.decentro.tech';
const DECENTRO_CLIENT_ID = process.env.DECENTRO_CLIENT_ID;
const DECENTRO_CLIENT_SECRET = process.env.DECENTRO_CLIENT_SECRET;

// Helper to generate a unique request ID
const generateRequestId = () => `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

// Function to get Decentro access token
const getAccessToken = async () => {
    try {
        const tokenUrl = `${DECENTRO_BASE_URL}/v2/auth/token`;

        console.log('Requesting Decentro access token from:', tokenUrl);
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
        'client_id': DECENTRO_CLIENT_ID,
        'client_secret': DECENTRO_CLIENT_SECRET,
        'module_name': 'COLLECT',
        'provider_name': 'decentro_in_house',
        ...headers
    };

    // Construct the full URL properly
    const fullUrl = url.startsWith('http') ? url : `${DECENTRO_BASE_URL}${url}`;
    
    console.log(`Making Decentro API call: ${method} ${fullUrl}`);
    
    try {
        const response = await axios({
            method,
            url: fullUrl,
            headers: defaultHeaders,
            data
        });
        return response.data;
    } catch (error) {
        console.error(`Error calling Decentro API (${method} ${fullUrl}):`, error.response ? error.response.data : error.message);
        throw new Error(`Decentro API call failed: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
};

const User = require('../Model/User');
const Wallet = require('../Model/Wallet');

// Create Virtual Account (Decentro Wallet)
const createVirtualAccount = async (userId, name, email, phone_number) => {
    const url = '/v2/payments/virtual_account/upi';
    const data = {
        reference_id: `VA_${userId}_${Date.now()}`,
        customer_mobile: phone_number,
        customer_email: email,
        customer_name: name,
        generate_qr: 0,
        generate_uri: 0
    };
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('Decentro createVirtualAccount API response:', response);
        
        if (response && response.data && response.data.upi_id) {
            // Update wallet with virtual account details
            await Wallet.findOneAndUpdate(
                { user_id: userId }, 
                { 
                    decentro_virtual_account_id: response.data.upi_id,
                    decentro_reference_id: response.data.reference_id,
                    decentro_account_details: response.data
                },
                { upsert: true }
            );
            console.log(`Virtual account created for user ${userId}`);
        }
        return response;
    } catch (error) {
        console.error('Error creating Decentro virtual account:', error.message);
        throw error;
    }
};

// Get Virtual Account Balance
const getVirtualAccountBalance = async (referenceId) => {
    const url = '/v2/payments/virtual_account/balance';
    const data = {
        reference_id: referenceId
    };
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('Virtual account balance response:', response);
        return response.data ? response.data.balance : 0;
    } catch (error) {
        console.error('Error fetching virtual account balance:', error.message);
        throw error;
    }
};

// Get Virtual Account Transactions
const getVirtualAccountTransactions = async (referenceId, fromDate, toDate) => {
    const url = '/v2/payments/virtual_account/transactions';
    const data = {
        reference_id: referenceId,
        from_date: fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        to_date: toDate || new Date().toISOString().split('T')[0]
    };
    
    try {
        const response = await callDecentroApi('POST', url, data);
        return response.data ? response.data.transactions : [];
    } catch (error) {
        console.error('Error fetching virtual account transactions:', error.message);
        throw error;
    }
};

// eNACH Mandate Registration
const createEnachMandate = async (mandateDetails) => {
    const url = '/v2/payments/enach/mandate';
    
    const data = {
        consumer: {
            name: mandateDetails.payer_name,
            account_number: mandateDetails.payer_account_number,
            account_type: mandateDetails.account_type || 'SAVINGS',
            reference_number: mandateDetails.reference_id,
            bank_code: mandateDetails.payer_bank_code || extractBankCodeFromIFSC(mandateDetails.payer_account_ifsc),
            mobile: mandateDetails.payer_mobile,
            email: mandateDetails.payer_email,
            bank_id: mandateDetails.payer_bank_id || extractBankIdFromIFSC(mandateDetails.payer_account_ifsc),
            pan: mandateDetails.payer_pan || 'ABCDE1234F' // Default PAN if not provided
        },
        reference_id: mandateDetails.reference_id,
        start_date: mandateDetails.start_date,
        end_date: mandateDetails.end_date,
        amount: parseInt(mandateDetails.amount),
        amount_rule: mandateDetails.amount_type === 'MAXIMUM' ? 'max' : 'fixed',
        category_code: mandateDetails.category_code || 'elec', // electricity/utility
        frequency: mandateDetails.frequency.toLowerCase(), // weekly, monthly, etc.
        authentication_mode: mandateDetails.authentication_mode || 'DebitCard'
    };
    
    console.log('Creating eNACH mandate with data:', JSON.stringify(data, null, 2));
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('eNACH mandate registration response:', response);
        return response;
    } catch (error) {
        console.error('Error creating eNACH mandate:', error.message);
        throw error;
    }
};

// Helper function to extract bank code from IFSC
const extractBankCodeFromIFSC = (ifsc) => {
    if (!ifsc || ifsc.length < 4) return 'HDFC'; // Default
    return ifsc.substring(0, 4);
};

// Helper function to extract bank ID from IFSC (simplified mapping)
const extractBankIdFromIFSC = (ifsc) => {
    if (!ifsc || ifsc.length < 4) return 'HDFC'; // Default
    
    const bankMapping = {
        'HDFC': 'HDFC',
        'ICIC': 'ICIC',
        'SBIN': 'SBI',
        'AXIS': 'AXIS',
        'PUNB': 'PNB',
        'UBIN': 'UBI',
        'CNRB': 'CNB',
        'BARB': 'BOB',
        'IOBA': 'IOB',
        'ALLA': 'ALB'
    };
    
    const bankCode = ifsc.substring(0, 4);
    return bankMapping[bankCode] || bankCode;
};

// Check eNACH Mandate Status
const getEnachMandateStatus = async (referenceId) => {
    const url = `/v2/payments/enach/mandate/${referenceId}`;
    
    try {
        const response = await callDecentroApi('GET', url);
        return response;
    } catch (error) {
        console.error('Error getting eNACH mandate status:', error.message);
        throw error;
    }
};

// Execute eNACH Payment
const executeEnachPayment = async (mandateId, amount, referenceId) => {
    const url = '/v2/payments/enach/payment';
    const data = {
        mandate_id: mandateId,
        amount: parseInt(amount),
        reference_id: referenceId,
        category_code: 'elec' // Utility/electricity category
    };
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('eNACH payment execution response:', response);
        return response;
    } catch (error) {
        console.error('Error executing eNACH payment:', error.message);
        throw error;
    }
};

// UPI Payout (for withdrawals and salary payments)
const initiateUpiPayout = async (payoutDetails) => {
    const url = '/v2/payments/upi/payout';
    const data = {
        reference_id: payoutDetails.reference_id,
        payee_account: payoutDetails.payee_account,
        amount: parseInt(payoutDetails.amount),
        purpose_message: payoutDetails.purpose_message || 'Payment transfer',
        beneficiary_name: payoutDetails.beneficiary_name,
        generate_qr: 0
    };
    
    console.log('Initiating UPI payout with data:', JSON.stringify(data, null, 2));
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('UPI payout response:', response);
        return response;
    } catch (error) {
        console.error('Error initiating UPI payout:', error.message);
        throw error;
    }
};

// NEFT/IMPS Payout (alternative to UPI for bank account transfers)
const initiateBankPayout = async (payoutDetails) => {
    const url = '/v2/payments/bank/payout';
    const data = {
        reference_id: payoutDetails.reference_id,
        beneficiary_account_number: payoutDetails.account_number,
        beneficiary_ifsc: payoutDetails.ifsc_code,
        beneficiary_name: payoutDetails.beneficiary_name,
        amount: parseInt(payoutDetails.amount),
        purpose_message: payoutDetails.purpose_message || 'Salary payment',
        transfer_mode: 'IMPS' // or 'NEFT'
    };
    
    console.log('Initiating bank payout with data:', JSON.stringify(data, null, 2));
    
    try {
        const response = await callDecentroApi('POST', url, data);
        console.log('Bank payout response:', response);
        return response;
    } catch (error) {
        console.error('Error initiating bank payout:', error.message);
        throw error;
    }
};

module.exports = {
    createVirtualAccount,
    getVirtualAccountBalance,
    getVirtualAccountTransactions,
    createEnachMandate,
    getEnachMandateStatus,
    executeEnachPayment,
    initiateUpiPayout,
    initiateBankPayout,
    // Legacy functions for backward compatibility
    createWallet: createVirtualAccount,
    initiateEmandate: createEnachMandate
};