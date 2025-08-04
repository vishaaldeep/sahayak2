import React, { useState } from 'react';
import AIAssessmentModal from './AIAssessmentModal';

const TestAIModal = () => {
  const [showModal, setShowModal] = useState(false);

  const mockAssessment = {
    recommendation: 'TAKE A CHANCE',
    total_score: 72,
    confidence: 'Medium',
    skills_assessment: {
      score: 75,
      weight: 30,
      details: {
        matched_skills: 3,
        total_required: 4,
        verified_skills: 2,
        average_experience: 2.5
      }
    },
    experience_assessment: {
      score: 68,
      weight: 25,
      details: {
        total_jobs: 2,
        total_experience_years: 3,
        job_stability: 'Good',
        current_employment: true
      }
    },
    assessment_history: {
      score: 80,
      weight: 20,
      details: {
        total_assessments: 3,
        average_score: 78,
        pass_rate: 100,
        assessment_trend: 'Improving'
      }
    },
    reliability_assessment: {
      score: 85,
      weight: 15,
      details: {
        false_accusations: 0,
        true_abuse_reports: 0,
        reliability_rating: 'High',
        risk_level: 'Low'
      }
    },
    strengths: [
      'Strong learning ability demonstrated through assessment performance',
      'Good reliability with no concerning reports',
      'Relevant experience in similar roles'
    ],
    concerns: [
      'Limited formal experience in required skills',
      'Skills gap in advanced techniques'
    ],
    suggestions: [
      'Proceed with structured interview focusing on learning ability',
      'Consider probation period with skills training',
      'Assess cultural fit and growth mindset'
    ],
    processing_time_ms: 1250
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">AI Assessment Modal Test</h2>
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
      >
        Test AI Assessment Modal
      </button>

      <AIAssessmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        assessment={mockAssessment}
      />
    </div>
  );
};

export default TestAIModal;