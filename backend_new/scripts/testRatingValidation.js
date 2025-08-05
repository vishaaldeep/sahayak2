// Test script to validate rating API payload
console.log('🧪 Testing Rating API Validation Logic...\n');

// Simulate the validation logic from the controller
function validateRatingPayload(body) {
    const { giver_user_id, receiver_user_id, rating, comments, job_id, role_of_giver } = body;
    
    console.log('📝 Received payload:', JSON.stringify(body, null, 2));
    
    const missingFields = [];
    if (!giver_user_id) missingFields.push('giver_user_id');
    if (!receiver_user_id) missingFields.push('receiver_user_id');
    if (!rating) missingFields.push('rating');
    if (!job_id) missingFields.push('job_id');
    if (!role_of_giver) missingFields.push('role_of_giver');

    if (missingFields.length > 0) {
        return {
            valid: false,
            error: {
                message: 'Missing required rating fields.',
                missingFields: missingFields,
                requiredFields: ['giver_user_id', 'receiver_user_id', 'rating', 'job_id', 'role_of_giver']
            }
        };
    }

    // Validate rating value
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return {
            valid: false,
            error: {
                message: 'Rating must be a number between 1 and 5.',
                providedRating: rating,
                ratingType: typeof rating
            }
        };
    }

    // Validate role_of_giver
    if (!['seeker', 'provider'].includes(role_of_giver)) {
        return {
            valid: false,
            error: {
                message: 'role_of_giver must be either "seeker" or "provider".',
                providedRole: role_of_giver
            }
        };
    }

    return { valid: true, message: 'Payload is valid!' };
}

// Test cases
const testCases = [
    {
        name: 'Empty payload',
        payload: {}
    },
    {
        name: 'Missing rating',
        payload: {
            giver_user_id: '64a1b2c3d4e5f6789012345a',
            receiver_user_id: '64a1b2c3d4e5f6789012345b',
            job_id: '64a1b2c3d4e5f6789012345c',
            role_of_giver: 'seeker'
        }
    },
    {
        name: 'Rating as string',
        payload: {
            giver_user_id: '64a1b2c3d4e5f6789012345a',
            receiver_user_id: '64a1b2c3d4e5f6789012345b',
            rating: '5', // String instead of number
            job_id: '64a1b2c3d4e5f6789012345c',
            role_of_giver: 'seeker'
        }
    },
    {
        name: 'Invalid role',
        payload: {
            giver_user_id: '64a1b2c3d4e5f6789012345a',
            receiver_user_id: '64a1b2c3d4e5f6789012345b',
            rating: 5,
            job_id: '64a1b2c3d4e5f6789012345c',
            role_of_giver: 'admin' // Invalid role
        }
    },
    {
        name: 'Valid payload',
        payload: {
            giver_user_id: '64a1b2c3d4e5f6789012345a',
            receiver_user_id: '64a1b2c3d4e5f6789012345b',
            rating: 5,
            comments: 'Great work!',
            job_id: '64a1b2c3d4e5f6789012345c',
            role_of_giver: 'seeker'
        }
    }
];

// Run tests
testCases.forEach((testCase, index) => {
    console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
    console.log('=' .repeat(50));
    
    const result = validateRatingPayload(testCase.payload);
    
    if (result.valid) {
        console.log('✅ VALID:', result.message);
    } else {
        console.log('❌ INVALID:', JSON.stringify(result.error, null, 2));
    }
});

console.log('\n🎯 Common Issues and Solutions:');
console.log('=' .repeat(50));
console.log('1. Rating as string: Make sure to send rating as number, not string');
console.log('2. Missing Content-Type: Add "Content-Type: application/json" header');
console.log('3. Invalid JSON: Validate your JSON payload format');
console.log('4. Missing fields: Ensure all required fields are present');
console.log('5. Wrong role: Use "seeker" or "provider" only');

console.log('\n📋 Correct curl example:');
console.log('curl -X POST http://localhost:5000/api/ratings \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
console.log('  -d \'{"giver_user_id":"64a1b2c3d4e5f6789012345a","receiver_user_id":"64a1b2c3d4e5f6789012345b","rating":5,"comments":"Great work!","job_id":"64a1b2c3d4e5f6789012345c","role_of_giver":"seeker"}\'');

console.log('\n✅ Test completed!');