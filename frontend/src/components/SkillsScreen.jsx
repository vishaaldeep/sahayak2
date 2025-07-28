import React, { useState, useEffect } from 'react';
import { BadgeCheck, FileText, Shield, Star, Upload, Plus, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const SKILL_OPTIONS = [
  'Plumbing', 'Electrician', 'Carpentry', 'Cooking', 'Driving', 'Gardening', 'Painting', 'JavaScript', 'Python', 'Java'
];

function SkillCard({ skill, onDelete, onUploadCert, onFetchPCC, onFetchCert, onTriggerAssessment }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{skill.skill_name}</span>
        {skill.verified && <BadgeCheck className="text-green-500" title="Verified Pro" />}
        <span className="ml-auto text-sm text-gray-500">{skill.category}</span>
          </div>
      <div className="flex gap-4 text-sm">
        <span><Star className="inline w-4 h-4 text-yellow-400" /> Score: {skill.skill_score}</span>
        <span>Exp: {skill.experience_years} yrs</span>
        <span>
          {skill.pcc_status === 'verified' ? <Shield className="inline w-4 h-4 text-blue-500" /> : <Shield className="inline w-4 h-4 text-gray-400" />}
          PCC: {skill.pcc_status}
        </span>
        <span>
          {skill.certificates.length > 0 ? <FileText className="inline w-4 h-4 text-green-500" /> : <FileText className="inline w-4 h-4 text-gray-400" />}
          Certs: {skill.certificates.length}
        </span>
        </div>
      <div className="flex gap-2 mt-2">
        <div className="flex-1 h-2 bg-gray-200 rounded">
          <div className="h-full bg-blue-500 rounded" style={{ width: `${(skill.progress/3)*100}%` }} />
        </div>
        <span className="text-xs text-gray-500">{skill.progress}/3 verifications</span>
                </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs flex items-center gap-1" onClick={() => onUploadCert(skill._id)}><Upload className="w-4 h-4" />Upload Cert</button>
        <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs flex items-center gap-1" onClick={() => onFetchPCC(skill._id)}><Shield className="w-4 h-4" />Fetch PCC</button>
        <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs flex items-center gap-1" onClick={() => onFetchCert(skill._id)}><FileText className="w-4 h-4" />DigiLocker Cert</button>
        <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs flex items-center gap-1" onClick={() => onTriggerAssessment(skill._id)}><CheckCircle className="w-4 h-4" />Assessment</button>
        <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs flex items-center gap-1" onClick={() => onDelete(skill._id)}><XCircle className="w-4 h-4" />Delete</button>
      </div>
      {skill.badges && skill.badges.length > 0 && (
        <div className="flex gap-2 mt-2">
          {skill.badges.map(badge => <span key={badge} className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">{badge}</span>)}
        </div>
      )}
        </div>
  );
}

function AddSkillForm({ onAdd }) {
  const [skill_name, setSkillName] = useState('');
  const [category, setCategory] = useState('');
  const [experience_years, setExperienceYears] = useState(0);
  return (
    <form className="bg-white rounded-xl shadow p-4 mb-4" onSubmit={e => {
      e.preventDefault();
      onAdd({ skill_name, category, experience_years });
      setSkillName(''); setCategory(''); setExperienceYears(0);
    }}>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Skill</label>
        <select className="w-full border rounded px-2 py-1" value={skill_name} onChange={e => setSkillName(e.target.value)} required>
          <option value="">Select skill</option>
          {SKILL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input className="w-full border rounded px-2 py-1" value={category} onChange={e => setCategory(e.target.value)} />
    </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
        <input type="number" className="w-full border rounded px-2 py-1" value={experience_years} onChange={e => setExperienceYears(e.target.value)} min={0} />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 flex items-center gap-1" type="submit"><Plus className="w-4 h-4" />Add Skill</button>
    </form>
  );
}

export default function SkillsScreen() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/user-skills`)
      .then(res => setSkills(res.data))
      .catch(() => setError('Failed to load skills'))
      .finally(() => setLoading(false));
  }, []);

  const refreshSkills = () => {
    setLoading(true);
    axios.get(`${API_BASE}/user-skills`)
      .then(res => setSkills(res.data))
      .catch(() => setError('Failed to load skills'))
      .finally(() => setLoading(false));
  };

  const handleAddSkill = (data) => {
    axios.post(`${API_BASE}/user-skills`, data)
      .then(refreshSkills)
      .catch(() => setError('Failed to add skill'));
  };

  const handleDeleteSkill = (id) => {
    axios.delete(`${API_BASE}/user-skills/${id}`)
      .then(refreshSkills)
      .catch(() => setError('Failed to delete skill'));
  };

  const handleUploadCert = (id) => {
    axios.post(`${API_BASE}/user-skills/${id}/upload-certificate`, { url: 'https://example.com/cert.pdf', type: 'certificate' })
      .then(refreshSkills)
      .catch(() => setError('Failed to upload certificate'));
  };

  const handleFetchPCC = (id) => {
    axios.post(`${API_BASE}/user-skills/${id}/fetch-pcc`)
      .then(refreshSkills)
      .catch(() => setError('Failed to fetch PCC'));
  };

  const handleFetchCert = (id) => {
    axios.post(`${API_BASE}/user-skills/${id}/fetch-certificate`)
      .then(refreshSkills)
      .catch(() => setError('Failed to fetch certificate'));
  };

  const handleTriggerAssessment = (id) => {
    axios.post(`${API_BASE}/user-skills/${id}/trigger-assessment`)
      .then(() => axios.post(`${API_BASE}/user-skills/${id}/assessment-result`, { result: 'passed' }))
      .then(refreshSkills)
      .catch(() => setError('Failed to trigger assessment'));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <h2 className="text-2xl font-bold mb-4">My Skills</h2>
        <AddSkillForm onAdd={handleAddSkill} />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? <div>Loading...</div> : (
          skills.length === 0 ? <div className="text-gray-500">No skills added yet.</div> :
            skills.map(skill => (
              <SkillCard
                key={skill._id}
                skill={skill}
                onDelete={handleDeleteSkill}
                onUploadCert={handleUploadCert}
                onFetchPCC={handleFetchPCC}
                onFetchCert={handleFetchCert}
                onTriggerAssessment={handleTriggerAssessment}
              />
            ))
        )}
      </div>
    </div>
  );
}
