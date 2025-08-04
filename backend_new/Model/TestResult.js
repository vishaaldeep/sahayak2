const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  test_name: {
    type: String,
    required: true,
    enum: ['quick_test', 'assessment_flow_test', 'ai_comparison_test', 'employer_filter_test']
  },
  test_version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    required: true,
    enum: ['passed', 'failed', 'warning']
  },
  execution_time_ms: {
    type: Number,
    required: true
  },
  environment: {
    node_env: String,
    mongodb_connected: Boolean,
    openai_available: Boolean,
    assessment_method: String,
    fallback_enabled: Boolean
  },
  data_counts: {
    users: Number,
    jobs: Number,
    skills: Number,
    applications: Number,
    assessments: Number,
    assessment_questions: Number,
    ai_assessments: Number
  },
  service_status: {
    assessment_service_status: String,
    primary_method: String,
    openai_available: Boolean,
    rule_based_available: Boolean,
    fallback_enabled: Boolean,
    version: String
  },
  test_results: {
    jobs_with_assessment: Number,
    recent_applications: Number,
    ai_assessment_test: {
      success: Boolean,
      processing_time_ms: Number,
      method_used: String,
      recommendation: String,
      score: Number,
      confidence: String,
      error_message: String
    }
  },
  issues_found: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    recommendation: String
  }],
  recommendations: [String],
  executed_by: {
    type: String,
    default: 'system'
  },
  executed_at: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
testResultSchema.index({ test_name: 1, executed_at: -1 });
testResultSchema.index({ status: 1, executed_at: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);