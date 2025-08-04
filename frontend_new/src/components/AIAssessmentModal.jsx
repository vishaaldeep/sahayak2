import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssessmentModal = ({ isOpen, onClose, assessment }) => {
  if (!assessment) return null;

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'STRONGLY RECOMMENDED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TAKE A CHANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RISKY':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NOT RECOMMENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'STRONGLY RECOMMENDED':
        return '🟢';
      case 'TAKE A CHANCE':
        return '🟡';
      case 'RISKY':
        return '🟠';
      case 'NOT RECOMMENDED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🤖</div>
                    <div>
                      <h3 className="text-lg font-medium text-white">AI Hiring Assessment</h3>
                      <p className="text-purple-100 text-sm">Comprehensive candidate analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-96 overflow-y-auto">
                {/* Overall Recommendation */}
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${getRecommendationColor(assessment.recommendation)}`}>
                    <span className="text-2xl mr-2">{getRecommendationIcon(assessment.recommendation)}</span>
                    <div>
                      <div className="font-bold text-lg">{assessment.recommendation}</div>
                      <div className="text-sm opacity-75">
                        Score: <span className={`font-bold ${getScoreColor(assessment.total_score)}`}>{assessment.total_score}%</span> | 
                        Confidence: {assessment.confidence}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessment Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Skills Assessment */}
                  {assessment.skills_assessment && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        🎯 Skills Assessment ({assessment.skills_assessment.weight}%)
                      </h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{assessment.skills_assessment.score}%</div>
                      {assessment.skills_assessment.details && (
                        <div className="text-sm text-blue-700 space-y-1">
                          <div>Matched Skills: {assessment.skills_assessment.details.matched_skills}/{assessment.skills_assessment.details.total_required}</div>
                          <div>Verified Skills: {assessment.skills_assessment.details.verified_skills}</div>
                          <div>Avg Experience: {assessment.skills_assessment.details.average_experience} years</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Experience Assessment */}
                  {assessment.experience_assessment && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        💼 Experience Assessment ({assessment.experience_assessment.weight}%)
                      </h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">{assessment.experience_assessment.score}%</div>
                      {assessment.experience_assessment.details && (
                        <div className="text-sm text-green-700 space-y-1">
                          <div>Total Jobs: {assessment.experience_assessment.details.total_jobs}</div>
                          <div>Experience: {assessment.experience_assessment.details.total_experience_years} years</div>
                          <div>Job Stability: {assessment.experience_assessment.details.job_stability}</div>
                          <div>Currently Employed: {assessment.experience_assessment.details.current_employment ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assessment History */}
                  {assessment.assessment_history && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                        📊 Assessment History ({assessment.assessment_history.weight}%)
                      </h4>
                      <div className="text-2xl font-bold text-purple-600 mb-2">{assessment.assessment_history.score}%</div>
                      {assessment.assessment_history.details && (
                        <div className="text-sm text-purple-700 space-y-1">
                          <div>Total Assessments: {assessment.assessment_history.details.total_assessments}</div>
                          <div>Average Score: {assessment.assessment_history.details.average_score}%</div>
                          <div>Pass Rate: {assessment.assessment_history.details.pass_rate}%</div>
                          <div>Trend: {assessment.assessment_history.details.assessment_trend}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reliability Assessment */}
                  {assessment.reliability_assessment && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        ⚖️ Reliability Assessment ({assessment.reliability_assessment.weight}%)
                      </h4>
                      <div className="text-2xl font-bold text-yellow-600 mb-2">{assessment.reliability_assessment.score}%</div>
                      {assessment.reliability_assessment.details && (
                        <div className="text-sm text-yellow-700 space-y-1">
                          <div>False Accusations: {assessment.reliability_assessment.details.false_accusations}</div>
                          <div>True Abuse Reports: {assessment.reliability_assessment.details.true_abuse_reports}</div>
                          <div>Reliability Rating: {assessment.reliability_assessment.details.reliability_rating}</div>
                          <div>Risk Level: {assessment.reliability_assessment.details.risk_level}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Strengths and Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {assessment.strengths && assessment.strengths.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                        💪 Strengths
                      </h4>
                      <ul className="space-y-2">
                        {assessment.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {assessment.concerns && assessment.concerns.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                        ⚠️ Concerns
                      </h4>
                      <ul className="space-y-2">
                        {assessment.concerns.map((concern, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start">
                            <span className="text-red-500 mr-2">!</span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {assessment.suggestions && assessment.suggestions.length > 0 && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      💡 AI Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {assessment.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AIAssessmentModal;