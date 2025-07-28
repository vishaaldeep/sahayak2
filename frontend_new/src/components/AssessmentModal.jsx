import React, { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api';

export default function AssessmentModal({ open, onClose, userId, skill, onCompleted }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleStart = async () => {
    setLoading(true);
    setTimeout(() => {
      setStep(1);
      setLoading(false);
    }, 1000);
  };
  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate assigning and completing test
      const assignRes = await API.post('/user-tests/assign', {
        user_id: userId,
        skill_id: skill._id,
        h5p_link: 'https://h5p.org/h5p/embed/123456',
        status: 'assigned',
      });
      await API.patch(`/user-tests/${assignRes.data._id}/complete`, {
        score,
        video_call_id: '',
      });
      setStep(2);
      setTimeout(() => {
        setLoading(false);
        onCompleted && onCompleted();
        onClose();
      }, 1200);
    } catch {
      setError('Failed to complete assessment');
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4 text-primary">Skill Assessment</h2>
        {step === 0 && (
          <div className="text-center">
            <div className="mb-4">Ready to take the assessment for <span className="font-semibold text-primary">{skill.skill}</span>?</div>
            <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleStart} disabled={loading}>{loading ? 'Loading...' : 'Start Assessment'}</button>
          </div>
        )}
        {step === 1 && (
          <div className="text-center">
            <div className="mb-4">Assessment in progress... (Simulated)</div>
            <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)} className="w-24 mx-auto border rounded px-2 py-1 text-center" placeholder="Score" />
            <button className="w-full mt-4 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition" onClick={handleComplete} disabled={loading}>{loading ? 'Submitting...' : 'Submit Assessment'}</button>
            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
          </div>
        )}
        {step === 2 && (
          <div className="text-center py-8">
            <div className="text-2xl font-bold text-green-600 mb-2">Assessment Complete!</div>
            <div className="text-gray-600">Your score: <span className="font-bold">{score}</span></div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 