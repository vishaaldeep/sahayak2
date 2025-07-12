import React, { useState } from 'react';
import { Share } from 'lucide-react';

export default function DocsScreen() {
  const [aadhaarDoc, setAadhaarDoc] = useState(null);
  const [tenthMarksheetDoc, setTenthMarksheetDoc] = useState(null);
  const [twelfthMarksheetDoc, setTwelfthMarksheetDoc] = useState(null);
  const [otherDoc, setOtherDoc] = useState(null);

  const pickDocument = async (setter) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) setter({ name: file.name, file });
    };
    input.click();
  };

  const saveDocumentsToDatabase = () => {
    alert('Documents saved!');
    // You can replace this with your actual upload logic
  };

  const handleShareClick = () => {
    if (!aadhaarDoc) {
      alert('Aadhaar card is compulsory to share documents.');
      return;
    }
    saveDocumentsToDatabase();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Share size={24} color="#F59E0B" />
          <div className="text-lg font-bold">Share Documents</div>
        </div>

        <div className="space-y-4">
          {/* Aadhaar Card */}
          <div>
            <label className="block text-white mb-1">
              Aadhaar Card <span className="text-red-500">*</span>
            </label>
            <button
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 text-white"
              onClick={() => pickDocument(setAadhaarDoc)}
            >
              {aadhaarDoc ? aadhaarDoc.name : 'Upload Aadhaar Card'}
            </button>
          </div>

          {/* 10th Marksheet */}
          <div>
            <label className="block text-white mb-1">10th Marksheet</label>
            <button
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 text-white"
              onClick={() => pickDocument(setTenthMarksheetDoc)}
            >
              {tenthMarksheetDoc ? tenthMarksheetDoc.name : 'Upload 10th Marksheet'}
            </button>
          </div>

          {/* 12th Marksheet */}
          <div>
            <label className="block text-white mb-1">12th Marksheet</label>
            <button
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 text-white"
              onClick={() => pickDocument(setTwelfthMarksheetDoc)}
            >
              {twelfthMarksheetDoc ? twelfthMarksheetDoc.name : 'Upload 12th Marksheet'}
            </button>
          </div>

          {/* Other Document */}
          <div>
            <label className="block text-white mb-1">Other Document</label>
            <button
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 text-white"
              onClick={() => pickDocument(setOtherDoc)}
            >
              {otherDoc ? otherDoc.name : 'Upload Other Document'}
            </button>
          </div>

          {/* Share Button */}
          <button
            className="w-full bg-blue-600 rounded-lg py-2 text-white font-semibold mt-4"
            onClick={handleShareClick}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
