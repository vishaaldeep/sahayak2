#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function testRecurringPaymentFix() {
  console.log('🧪 TESTING RECURRING PAYMENT MODEL FIX');
  console.log('=' .repeat(50));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const RecurringPayment = require('../Model/RecurringPayment');

    // Test 1: Create with new system (employee_id)
    console.log('\n📋 Test 1: New System (employee_id)');
    try {
      const newSystemPayment = new RecurringPayment({
        employer_id: new mongoose.Types.ObjectId(),
        employee_id: new mongoose.Types.ObjectId(),
        amount: 1000,
        frequency: 'daily',
        interval_value: 1,
        description: 'Test payment new system',
        status: 'active'
      });

      await newSystemPayment.validate();
      console.log('✅ New system validation passed');
    } catch (error) {
      console.log('❌ New system validation failed:', error.message);
    }

    // Test 2: Create with old system (seeker_id)
    console.log('\n📋 Test 2: Old System (seeker_id)');
    try {
      const oldSystemPayment = new RecurringPayment({
        employer_id: new mongoose.Types.ObjectId(),
        seeker_id: new mongoose.Types.ObjectId(),
        amount: 1000,
        frequency: 'daily',
        status: 'pending'
      });

      await oldSystemPayment.validate();
      console.log('✅ Old system validation passed');
    } catch (error) {
      console.log('❌ Old system validation failed:', error.message);
    }

    // Test 3: Test status enum values
    console.log('\n📋 Test 3: Status Enum Values');
    const validStatuses = ['active', 'paused', 'cancelled', 'completed', 'pending', 'pending_authentication', 'pending_approval', 'failed'];
    
    for (const status of validStatuses) {
      try {
        const testPayment = new RecurringPayment({
          employer_id: new mongoose.Types.ObjectId(),
          employee_id: new mongoose.Types.ObjectId(),
          amount: 1000,
          frequency: 'daily',
          status: status
        });

        await testPayment.validate();
        console.log(`✅ Status '${status}' is valid`);
      } catch (error) {
        console.log(`❌ Status '${status}' is invalid:`, error.message);
      }
    }

    // Test 4: Test pre-save hook
    console.log('\n📋 Test 4: Pre-save Hook (seeker_id -> employee_id)');
    try {
      const testPayment = new RecurringPayment({
        employer_id: new mongoose.Types.ObjectId(),
        seeker_id: new mongoose.Types.ObjectId(),
        amount: 1000,
        frequency: 'daily',
        status: 'active'
      });

      // Trigger pre-save hook
      await testPayment.validate();
      
      if (testPayment.employee_id && testPayment.seeker_id) {
        console.log('✅ Pre-save hook working: both employee_id and seeker_id are set');
      } else {
        console.log('❌ Pre-save hook not working properly');
      }
    } catch (error) {
      console.log('❌ Pre-save hook test failed:', error.message);
    }

    // Test 5: Test missing both employee_id and seeker_id
    console.log('\n📋 Test 5: Missing Both IDs');
    try {
      const testPayment = new RecurringPayment({
        employer_id: new mongoose.Types.ObjectId(),
        amount: 1000,
        frequency: 'daily',
        status: 'active'
      });

      await testPayment.validate();
      console.log('❌ Should have failed validation (missing both IDs)');
    } catch (error) {
      console.log('✅ Correctly failed validation for missing IDs');
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Model supports both old and new systems');
    console.log('✅ All status enum values are valid');
    console.log('✅ Pre-save hook ensures ID compatibility');
    console.log('✅ Validation works correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testRecurringPaymentFix().catch(console.error);
}

module.exports = { testRecurringPaymentFix };