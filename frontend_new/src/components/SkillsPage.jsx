import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useDbTranslation } from '../utils/translationHelpers';
import API from '../api';
import DocumentUploadModal from './DocumentUploadModal';
import AssessmentModal from './AssessmentModal';
import { useRef } from 'react';

export default function SkillsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { translateUserRole } = useDbTranslation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({ skill: '', category: [], experience: 0 });
  const [showAdd, setShowAdd] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docType, setDocType] = useState('aadhaar');
  const [docFile, setDocFile] = useState(null);
  const dropRef = useRef();

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!user) return window.location.href = '/login';
    fetchSkills();
    API.get('/skills').then(res => setAllSkills(res.data));
    fetchDocuments();
    // eslint-disable-next-line
  }, []); // Only run once on mount

  const fetchSkills = () => {
    API.get(`/user-skills/${user._id}`)
      .then(res => {
        setSkills(res.data.map(s => ({
          ...s,
          color: s.skill_id?.color || '#3b82f6',
          skill: s.skill_id?.name || '',
          category: s.category || []
        })));
        setShowAdd(res.data.length === 0);
      })
      .catch(() => setError(t('skills.failedToLoadSkills') || 'Failed to load skills'));
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCategoryCheckboxChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter(c => c !== value)
        : [...prev.category, value]
    }));
  };

  const handleAddSkill = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post(`/user-skills/${user._id}`, {
        skill_id: form.skill, // This is now the ObjectId
        proficiency: '',
        experience_years: form.experience,
        category: form.category,
      });
      fetchSkills();
      setShowAdd(false);
    } catch (err) {
      setError(t('skills.failedToAddSkill') || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = (userSkillId) => {
    setSkillToDelete(userSkillId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      await API.delete(`/user-skills/delete-skill/${skillToDelete}`);
      fetchSkills(); // Refresh the skills list
    } catch (err) {
      setError(t('skills.failedToDeleteSkill') || 'Failed to delete skill');
    } finally {
      setShowDeleteModal(false);
      setSkillToDelete(null);
    }
  };

  const handleOpenDocModal = skill => {
    setActiveSkill(skill);
    setShowDocModal(true);
  };
  const handleOpenAssessmentModal = skill => {
    setActiveSkill(skill);
    setShowAssessmentModal(true);
  };

  const selectedSkillObj = allSkills.find(s => s._id === form.skill);
  const categories = selectedSkillObj && selectedSkillObj.category ? selectedSkillObj.category : [];

  // Add a helper to check if driving license is uploaded for a skill
  const hasDrivingLicense = (skill) => {
    if (skill.skill !== 'Driving') return true;
    if (!skill.documents) return false;
    return skill.documents.some(doc => doc.type === 'driving_license');
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const res = await API.get(`/user-documents/${user._id}`);
      setDocuments(res.data);
    } catch {
      setDocuments([]);
    }
  };

  // Drag and drop handlers
  const handleDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setDocError('Only JPG and PNG photographs are allowed.');
      setDocFile(null);
      return;
    }
    setDocError('');
    setDocFile(file);
  };
  const handleDragOver = e => e.preventDefault();
  const handleDocFileChange = e => {
    const file = e.target.files[0];
    if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setDocError('Only JPG and PNG photographs are allowed.');
      setDocFile(null);
      return;
    }
    setDocError('');
    setDocFile(file);
  };
  const handleDocTypeChange = e => setDocType(e.target.value);

  const handleDocUpload = async e => {
    e.preventDefault();
    if (!docFile) return setDocError('Please select a file');
    setDocUploading(true);
    setDocError('');
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('document_type', docType);
      formData.append('document_number', '');
      await API.post(`/user-documents/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocFile(null);
      fetchDocuments();
    } catch {
      setDocError('Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  // Determine required documents
  const hasDriving = skills.some(s => (s.skill || '').toLowerCase() === 'driving');
  const requiredDocs = ['aadhaar', 'pcc'];
  if (hasDriving) requiredDocs.push('license');
  const docLabels = { aadhaar: 'Aadhaar', pcc: 'Police Clearance Certificate', license: 'Driving License', certificate: 'Skill Certificate' };
  const uploadedTypes = documents.map(d => d.document_type);
  const missingDocs = requiredDocs.filter(type => !uploadedTypes.includes(type));

  return (
    <div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <motion.h2 className="text-2xl font-bold mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t('skills.mySkills') || 'My Skills'}</motion.h2>
        {/* Remove category filter UI here */}
        {showAdd ? (
          <motion.form
            className="bg-white rounded-xl shadow p-4 mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddSkill}
          >
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">{t('skills.skill') || 'Skill'}</label>
              <select name="skill" className="w-full border rounded px-2 py-1" value={form.skill} onChange={handleChange} required>
                <option value="">{t('skills.selectSkill') || 'Select skill'}</option>
                {allSkills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            {categories.length > 0 && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">{t('common.category') || 'Category'}</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="category"
                        value={cat}
                        checked={form.category.includes(cat)}
                        onChange={handleCategoryCheckboxChange}
                        className="rounded"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">{t('skills.yearsOfExperience') || 'Years of Experience'}</label>
              <input name="experience" type="number" className="w-full border rounded px-2 py-1" value={form.experience} onChange={handleChange} min={0} />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button className="bg-primary text-white px-4 py-2 rounded mt-2 w-full" type="submit">{loading ? (t('skills.adding') || 'Adding...') : (t('skills.addSkill') || 'Add Skill')}</button>
          </motion.form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {skills.length === 0 ? (
              <div className="text-gray-500">{t('skills.noSkillsAdded') || 'No skills added yet.'}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl shadow p-4 border-l-8 flex flex-col"
                    style={{ borderColor: skill.color }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg" style={{ color: skill.color }}>{skill.skill}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {Array.isArray(skill.category) && skill.category.length > 0 ? skill.category.join(', ') : skill.category}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm mt-2">
                      <span>{t('skills.exp') || 'Exp'}: {skill.experience_years} {t('skills.yrs') || 'yrs'}</span>
                      <span>{skill.is_verified ? <span className="text-green-600">{t('skills.verified') || 'Verified'}</span> : <span className="text-yellow-500">{t('skills.pending') || 'Pending'}</span>}</span>
                    </div>
                    {/* Show required documents for all skills */}
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">{t('skills.requiredDocuments') || 'Required Documents'}:</div>
                      <ul className="list-disc ml-6 text-xs text-gray-700">
                        <li>{t('skills.aadhaar') || 'Aadhaar'}</li>
                        <li>{t('skills.policeClearanceCertificate') || 'Police Clearance Certificate'}</li>
                        {(skill.skill || '').toLowerCase() === 'driving' && <li>{t('skills.drivingLicense') || 'Driving License'}</li>}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        className={`bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs ${!skill.is_verified || (skill.skill === 'Driving' && !hasDrivingLicense(skill)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (skill.skill === 'Driving' && !hasDrivingLicense(skill)) {
                            setError(t('skills.uploadDrivingLicenseError') || 'Please upload your Driving License to proceed with assessment.');
                            return;
                          }
                          if (skill.is_verified) handleOpenAssessmentModal(skill);
                        }}
                        disabled={!skill.is_verified || (skill.skill === 'Driving' && !hasDrivingLicense(skill))}
                      >
                        {t('skills.assessment') || 'Assessment'}
                      </button>
                      {skill.skill === 'Driving' && !hasDrivingLicense(skill) && (
                        <div className="text-red-500 text-xs mt-1">{t('skills.drivingLicenseMandatory') || 'Driving License upload is mandatory for Driving skill.'}</div>
                      )}
                      <button
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs"
                        onClick={() => handleDeleteSkill(skill._id)}
                      >
                        {t('common.delete') || 'Delete'}
                      </button>
                    </div>
                    {skill.assessment && <div className="mt-2 text-green-600 text-xs">{t('skills.assessmentAssigned') || 'Assessment assigned! Check your email/SMS for the link.'}</div>}
                  </motion.div>
                ))}
              </div>
            )}
            <button className="w-full mt-4 py-2 bg-primary text-white rounded-lg font-semibold" onClick={() => setShowAdd(true)}>+ {t('skills.addAnotherSkill') || 'Add Another Skill'}</button>
          </motion.div>
        )}
        {/* Document Upload Card as a separate section below the grid */}
        <div className="mt-10 bg-white rounded-xl shadow p-4 flex flex-col border-l-8 border-primary max-w-3xl mx-auto">
          <h2 className="text-lg font-bold mb-2 text-primary">{t('skills.documents') || 'Documents'}</h2>
          <form onSubmit={handleDocUpload} className="mb-4">
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-primary rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50 transition mb-2"
              onClick={() => dropRef.current.querySelector('input[type=file]').click()}
              style={{ minHeight: 80 }}
            >
              <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleDocFileChange} className="hidden" />
              {docFile ? (
                <div className="text-green-600 font-semibold">{docFile.name}</div>
              ) : (
                <div className="text-gray-400">{t('skills.dragDropPhoto') || 'Drag & drop a photograph here, or click to select'}</div>
              )}
            </div>
            <div className="flex gap-2 items-center mb-2">
              <label className="text-sm font-medium text-gray-700">{t('common.type') || 'Type'}:</label>
              <select value={docType} onChange={handleDocTypeChange} className="border rounded px-2 py-1">
                <option value="aadhaar">{t('skills.aadhaar') || 'Aadhaar'}</option>
                <option value="pcc">{t('skills.policeClearanceCertificate') || 'Police Clearance Certificate'}</option>
                {hasDriving && <option value="license">{t('skills.drivingLicense') || 'Driving License'}</option>}
                <option value="certificate">{t('skills.skillCertificate') || 'Skill Certificate'}</option>
              </select>
              <button type="submit" className="ml-2 px-3 py-1 bg-primary text-white rounded font-semibold shadow" disabled={docUploading}>{docUploading ? (t('skills.uploading') || 'Uploading...') : (t('skills.upload') || 'Upload')}</button>
            </div>
            {docError && <div className="text-red-500 text-xs text-center mb-2">{docError}</div>}
          </form>
          <div className="mb-2">
            <h3 className="font-semibold mb-1 text-sm">{t('skills.uploadedDocuments') || 'Uploaded Documents'}</h3>
            {documents.length === 0 && <div className="text-gray-500 text-xs">{t('skills.noDocumentsUploaded') || 'No documents uploaded yet.'}</div>}
            <div className="grid grid-cols-2 gap-2">
              {documents.map(doc => (
                <div
                  key={doc._id}
                  className="border rounded-lg p-1 flex flex-col items-center bg-gray-50 relative cursor-pointer"
                  onClick={() => setSelectedImage(`http://localhost:5000/${doc.file_url}`)}
                >
                  <img src={`http://localhost:5000/${doc.file_url}`} alt={doc.document_type} className="w-12 h-12 object-cover rounded mb-1 border" />
                  <div className="text-xs font-semibold text-gray-700 mb-0.5">{docLabels[doc.document_type] || doc.document_type}</div>
                  <div className={`text-xs ${doc.verified ? 'text-green-600' : 'text-yellow-500'}`}>{doc.verified ? (t('skills.verified') || 'Verified') : (t('skills.pending') || 'Pending')}</div>
                </div>
              ))}
            </div>
          </div>
          {selectedImage && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
              <img src={selectedImage} alt="Enlarged document" className="max-w-screen-lg max-h-screen-lg" />
            </div>
          )}
          {missingDocs.length > 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded mb-2">
              <div className="font-semibold text-yellow-700 mb-1 text-xs">{t('skills.pleaseUploadToGetVerified') || 'Please upload these to get verified'}:</div>
              <ul className="list-disc ml-4 text-yellow-800 text-xs">
                {missingDocs.map(type => <li key={type}>{docLabels[type]}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
      <DocumentUploadModal
        open={showDocModal}
        onClose={() => setShowDocModal(false)}
        userId={user._id}
        skill={activeSkill}
        onUploaded={fetchSkills}
      />
      <AssessmentModal
        open={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        userId={user._id}
        skill={activeSkill}
        onCompleted={fetchSkills}
      />
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <div className="text-2xl font-bold mb-2" style={{ color: (skills.find(s => s._id === skillToDelete)?.color || '#ef4444') }}>
              {t('skills.deleteSkillQuestion') || 'Delete Skill?'}
            </div>
            <div className="text-gray-700 mb-4">{t('skills.deleteSkillConfirmation') || 'Are you sure you want to delete this skill? This action cannot be undone.'}</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                onClick={() => { setShowDeleteModal(false); setSkillToDelete(null); }}
              >{t('common.cancel') || 'Cancel'}</button>
              <button
                className="px-4 py-2 rounded text-white font-semibold shadow"
                style={{ backgroundColor: (skills.find(s => s._id === skillToDelete)?.color || '#ef4444') }}
                onClick={confirmDeleteSkill}
              >{t('common.delete') || 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 