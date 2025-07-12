// import React from 'react';
// import {
//   Shield,
//   Download,
//   Share,
//   Cpu,
//   Award,
//   ExternalLink,
// } from 'lucide-react';

// export default function SkillsScreen() {
//   // Fixed pattern for AI grid (no random in render)
//   const aiGrid = Array.from({ length: 25 }).map((_, i) => i % 4 === 0);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="max-w-2xl mx-auto py-6 px-4">
//         {/* Header */}
//         <div className="pt-5 pb-8">
//           <div className="text-2xl font-bold mb-2">Skill Verification</div>
//           <div className="text-gray-400 text-sm leading-5">
//             Verify your skills to unlock better opportunities and higher earnings.
//           </div>
//         </div>

//         {/* Blockchain Credential Wallet */}
//         <div className="mb-8">
//           <div className="text-lg font-bold mb-4">Blockchain Credential Wallet</div>
//           <div className="bg-gray-800 rounded-2xl p-6">
//             <div className="flex items-start gap-4 mb-6">
//               <Shield size={24} color="#10B981" />
//               <div>
//                 <div className="text-base font-semibold mb-2">Verified Skills</div>
//                 <div className="text-gray-400 text-sm leading-5">
//                   View your verified skills and credentials in a secure blockchain wallet.
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-center mb-6">
//               <div className="flex flex-col items-center bg-gray-900 rounded-xl p-8 w-full">
//                 <div className="relative mb-4" style={{ width: 60, height: 60 }}>
//                   <div className="absolute w-6 h-6 bg-emerald-500 rounded-md border-2 border-emerald-700" style={{ left: 0, top: 0 }} />
//                   <div className="absolute w-6 h-6 bg-emerald-700 rounded-md border-2 border-emerald-700" style={{ left: 8, top: 8 }} />
//                   <div className="absolute w-6 h-6 bg-emerald-800 rounded-md border-2 border-emerald-700" style={{ left: 16, top: 16 }} />
//                 </div>
//                 <div className="text-xs font-semibold text-emerald-500 tracking-widest">BLOCKCHAIN WALLET</div>
//               </div>
//             </div>
//             <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
//               View Wallet
//             </button>
//           </div>
//         </div>

//         {/* Skill Assessments */}
//         <div className="mb-8">
//           <div className="text-lg font-bold mb-4">Skill Assessments</div>
//           <div className="bg-gray-800 rounded-2xl p-6">
//             <div className="flex items-start gap-4 mb-6">
//               <Cpu size={24} color="#3B82F6" />
//               <div>
//                 <div className="text-base font-semibold mb-2">AI-Powered Assessments</div>
//                 <div className="text-gray-400 text-sm leading-5">
//                   Take AI-powered skill assessments to verify your expertise and boost your profile.
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-center mb-6">
//               <div className="relative bg-gray-900 rounded-xl p-8 w-full flex flex-col items-center">
//                 <div className="grid grid-cols-5 grid-rows-5 gap-1 mb-2" style={{ width: 100, height: 100 }}>
//                   {aiGrid.map((active, idx) => (
//                     <div
//                       key={idx}
//                       className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-blue-500 shadow-blue-500/70 shadow-md' : 'bg-gray-800'}`}
//                     />
//                   ))}
//                 </div>
//                 <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-blue-500 opacity-60" />
//               </div>
//             </div>
//             <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
//               Launch Assessment
//             </button>
//           </div>
//         </div>

//         {/* Cross-Platform Portability */}
//         <div className="mb-8">
//           <div className="text-lg font-bold mb-4">Cross-Platform Portability</div>
//           {/* Download Certificates */}
//           <div className="bg-gray-800 rounded-2xl p-6 mb-4">
//             <div className="flex items-start gap-4 mb-6">
//               <Download size={24} color="#10B981" />
//               <div>
//                 <div className="text-base font-semibold mb-2">Download Certificates</div>
//                 <div className="text-gray-400 text-sm leading-5">
//                   Download your verified skill certificates for use on other platforms.
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-center mb-6">
//               <div className="bg-emerald-500 bg-opacity-10 rounded-xl p-8 w-full flex flex-col items-center">
//                 <div className="mb-4">
//                   <Download size={32} color="#10B981" />
//                 </div>
//                 <div className="flex flex-col gap-1 w-full items-center">
//                   <div className="w-16 h-1 bg-emerald-500 rounded" />
//                   <div className="w-16 h-1 bg-emerald-500 rounded" />
//                   <div className="w-16 h-1 bg-emerald-500 rounded" />
//                 </div>
//               </div>
//             </div>
//             <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
//               Download
//             </button>
//           </div>
//           {/* Share Certificates */}
//           <div className="bg-gray-800 rounded-2xl p-6">
//             <div className="flex items-start gap-4 mb-6">
//               <Share size={24} color="#F59E0B" />
//               <div>
//                 <div className="text-base font-semibold mb-2">Share Certificates</div>
//                 <div className="text-gray-400 text-sm leading-5">
//                   Share your verified skill certificates with potential employers.
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-center mb-6">
//               <div className="bg-amber-400 bg-opacity-10 rounded-xl p-8 w-full flex flex-row items-center justify-center gap-4">
//                 <div className="p-2 bg-white rounded-lg">
//                   <Award size={24} color="#F59E0B" />
//                 </div>
//                 <div className="p-2">
//                   <ExternalLink size={16} color="#F59E0B" />
//                 </div>
//               </div>
//             </div>
//             <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
//               Share
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Download,
  Share,
  Cpu,
  Award,
  ExternalLink,
  X,
} from 'lucide-react';

export default function SkillsScreen() {
  const [assessmentVisible, setAssessmentVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  // Fixed pattern for AI grid (no random in render)
  const aiGrid = Array.from({ length: 25 }).map((_, i) => i % 4 === 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="pt-5 pb-8">
          <div className="text-2xl font-bold mb-2">{t('skill_verification')}</div>
          <div className="text-gray-400 text-sm leading-5">
            {t('verify_skills_unlock_opportunities')}
          </div>
        </div>

        {/* Blockchain Credential Wallet */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">{t('blockchain_credential_wallet')}</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <Shield size={24} color="#10B981" />
              <div>
                <div className="text-base font-semibold mb-2">{t('verified_skills')}</div>
                <div className="text-gray-400 text-sm leading-5">
                  {t('view_verified_skills_description')}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="flex flex-col items-center bg-gray-900 rounded-xl p-8 w-full">
                <div className="relative mb-4" style={{ width: 60, height: 60 }}>
                  <div className="absolute w-6 h-6 bg-emerald-500 rounded-md border-2 border-emerald-700" style={{ left: 0, top: 0 }} />
                  <div className="absolute w-6 h-6 bg-emerald-700 rounded-md border-2 border-emerald-700" style={{ left: 8, top: 8 }} />
                  <div className="absolute w-6 h-6 bg-emerald-800 rounded-md border-2 border-emerald-700" style={{ left: 16, top: 16 }} />
                </div>
                <div className="text-xs font-semibold text-emerald-500 tracking-widest">{t('blockchain_wallet_label')}</div>
              </div>
            </div>
            <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
              {t('view_wallet')}
            </button>
          </div>
        </div>

        {/* Skill Assessments */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">{t('skill_assessments')}</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <Cpu size={24} color="#3B82F6" />
              <div>
                <div className="text-base font-semibold mb-2">{t('ai_powered_assessments')}</div>
                <div className="text-gray-400 text-sm leading-5">
                  {t('ai_powered_assessments_description')}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative bg-gray-900 rounded-xl p-8 w-full flex flex-col items-center">
                <div className="grid grid-cols-5 grid-rows-5 gap-1 mb-2" style={{ width: 100, height: 100 }}>
                  {aiGrid.map((active, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-blue-500 shadow-blue-500/70 shadow-md' : 'bg-gray-800'}`}
                    />
                  ))}
                </div>
                <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-blue-500 opacity-60" />
              </div>
            </div>
  <button
    className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition"
    onClick={() => setAssessmentVisible(true)}
  >{t('launch_assessment')}
    Launch Assessment
    </button>
  </div>
        </div >

    {/* Cross-Platform Portability */ }
    < div className = "mb-8" >
      <div className="text-lg font-bold mb-4">{t('cross_platform_portability')}Cross-Platform Portability</div>

  {/* Download Certificates */ }
  <div className="bg-gray-800 rounded-2xl p-6 mb-4">
    <div className="flex items-start gap-4 mb-6">
      <Download size={24} color="#10B981" />
      <div>
        <div className="text-base font-semibold mb-2">{t('download_certificates')}</div>
        <div className="text-gray-400 text-sm leading-5">
          {t('download_certificates_description')}
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center mb-6">
      <div className="bg-emerald-500 bg-opacity-10 rounded-xl p-8 w-full flex flex-col items-center">
        <div className="mb-4">
          <Download size={32} color="#10B981" />
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-16 h-1 bg-emerald-500 rounded" />
          <div className="w-16 h-1 bg-emerald-500 rounded" />
          <div className="w-16 h-1 bg-emerald-500 rounded" />
        </div>
      </div>
    </div>
    <button className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition">
      {t('download')}
    </button>
  </div>

  {/* Share Certificates */ }
  <div className="bg-gray-800 rounded-2xl p-6">
    <div className="flex items-start gap-4 mb-6">
      <Share size={24} color="#F59E0B" />
      <div>
        <div className="text-base font-semibold mb-2">{t('share_certificates')}</div>
        <div className="text-gray-400 text-sm leading-5">
          {t('share_certificates_description')}
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center mb-6">
      <div className="bg-amber-400 bg-opacity-10 rounded-xl p-8 w-full flex flex-row items-center justify-center gap-4">
        <div className="p-2 bg-white rounded-lg">
          <Award size={24} color="#F59E0B" />
        </div>
        <div className="p-2">
          <ExternalLink size={16} color="#F59E0B" />
        </div>
      </div>
    </div>
    <button
      className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 font-semibold text-white hover:bg-gray-700 transition"
      onClick={() => navigate('/docscreen')}
    >{t('share')}
      Share
    </button>
  </div>
        </div >
      </div >

    {/* Assessment Modal */ }
  {
    assessmentVisible && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-3xl relative shadow-2xl animate-fade-in">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            onClick={() => setAssessmentVisible(false)}
          >
            <X size={24} />
          </button>
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Assessment</h2>
          {/* Iframe */}
          <div className="rounded-xl overflow-hidden border border-gray-700">
            {!iframeLoaded && (
              <div className="flex items-center justify-center h-[500px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            )}
            <iframe
              src="https://mle.h5p.com/content/1292636157390435407/embed"
              style={{ width: '100%', height: '500px', border: 'none', display: iframeLoaded ? 'block' : 'none' }}
              allowFullScreen
              title="AI Assessment"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </div>
      </div>
    )
  }
    </div >
  );
}
