const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test data - Replace with actual IDs from your database
const TEST_DATA = {
    giver_user_id: '64a1b2c3d4e5f6789012345a',    // Replace with actual user ID
    receiver_user_id: '64a1b2c3d4e5f6789012345b',  // Replace with actual user ID
    rating: 5,
    comments: 'Excellent work! Very professional.',
    job_id: '64a1b2c3d4e5f6789012345c',            // Replace with actual job ID
    role_of_giver: 'seeker'
};

async function testRatingAPI() {
    console.log('🧪 Testing Rating API...\n');

    // Test 1: Empty payload (should fail)
    console.log('📝 Test 1: Empty payload');
    console.log('=' .repeat(40));
    try {
        const response = await axios.post(`${API_BASE_URL}/ratings`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        console.log('❌ Unexpected success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Expected 400 error:', error.response.data);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }

    console.log('\n');

    // Test 2: Valid payload (should succeed)
    console.log('📝 Test 2: Valid payload');
    console.log('=' .repeat(40));
    console.log('Payload:', JSON.stringify(TEST_DATA, null, 2));
    
    try {
        const response = await axios.post(`${API_BASE_URL}/ratings`, TEST_DATA, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ API Error:', error.response.data);
            console.log('Status:', error.response.status);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }

    console.log('\n');

    // Test 3: Missing Content-Type header
    console.log('📝 Test 3: Missing Content-Type header');
    console.log('=' .repeat(40));
    try {
        const response = await axios.post(`${API_BASE_URL}/ratings`, TEST_DATA, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
                // Missing Content-Type header
            }
        });
        console.log('❌ Unexpected success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Expected error (missing Content-Type):', error.response.data);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }

    console.log('\n');

    // Test 4: Rating as string (should fail)
    console.log('📝 Test 4: Rating as string');
    console.log('=' .repeat(40));
    const invalidData = { ...TEST_DATA, rating: '5' }; // String instead of number
    try {
        const response = await axios.post(`${API_BASE_URL}/ratings`, invalidData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        console.log('❌ Unexpected success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Expected validation error:', error.response.data);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }
}

// Instructions
console.log('🎯 Rating API Test Script');
console.log('=' .repeat(50));
console.log('Before running this script:');
console.log('1. Replace TEST_TOKEN with your actual JWT token');
console.log('2. Replace user IDs and job ID with actual IDs from your database');
console.log('3. Make sure your server is running on localhost:5000');
console.log('4. Run: node testRatingAPI.js');
console.log('=' .repeat(50));
console.log('');

// Check if token is set
if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set TEST_TOKEN to your actual JWT token before running tests');
    console.log('You can get a token by logging in through your frontend or API');
    process.exit(1);
}

// Run tests
testRatingAPI().catch(console.error);