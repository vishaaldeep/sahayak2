import React, { useState } from 'react';
import RatingModal from './RatingModal';

// Test component to verify rating modal works correctly
const TestRatingModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Test data - replace with actual IDs from your database
  const testData = {
    giver_user_id: '64a1b2c3d4e5f6789012345a',    // Replace with actual user ID
    receiver_user_id: '64a1b2c3d4e5f6789012345b',  // Replace with actual user ID
    job_id: '64a1b2c3d4e5f6789012345c',            // Replace with actual job ID
    role_of_giver: 'provider'                       // or 'seeker'
  };

  const handleRatingSubmitted = () => {
    console.log('✅ Rating submitted successfully!');
    alert('Rating submitted successfully!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Rating Modal</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Test Data:</h3>
        <pre className="text-sm">{JSON.stringify(testData, null, 2)}</pre>
        <p className="text-sm text-red-600 mt-2">
          ⚠️ Replace the IDs above with actual IDs from your database before testing
        </p>
      </div>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Open Rating Modal
      </button>

      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        giver_user_id={testData.giver_user_id}
        receiver_user_id={testData.receiver_user_id}
        job_id={testData.job_id}
        role_of_giver={testData.role_of_giver}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default TestRatingModal;