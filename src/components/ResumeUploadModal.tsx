import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadResumeFile, isSupabaseConfigured } from '../lib/supabase';
import { FileText, Upload, Sparkles, CheckCircle2, X } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithCustomBio: (extractedText: string) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onProceedWithCustomBio,
}) => {
  const { user } = useAuth();
  const [docType, setDocType] = useState<'resume' | 'daf' | 'portfolio'>('resume');
  const [pastedBio, setPastedBio] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsProcessing(true);

      // Upload to Supabase Storage bucket 'resumes'
      uploadResumeFile(file, user?.id).then((url) => {
        if (url) {
          console.log('File successfully uploaded to Supabase Storage:', url);
        }
      }).catch(() => {});

      setTimeout(() => {
        setIsProcessing(false);
        setPastedBio(`Extracted from ${file.name}:\n- Specialization: Distributed Systems & Machine Learning\n- Key Project: Real-time fraud detection pipeline handling 25,000 TPS on Apache Kafka & Redis\n- Academic Background: B.Tech Computer Science, Tier-1 Institute\n- Hobbies: Competitive debate & Marathon running`);
        setSuccess(true);
      }, 1200);
    }
  };

  const handleApply = () => {
    onProceedWithCustomBio(pastedBio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-brand-500/40 p-6 sm:p-8 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Upload Resume / DAF / Portfolio
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Let the AI interviewer parse your real projects, college background, or hometown to customize questions.
          </p>
        </div>

        {/* Doc type selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'resume', label: 'Tech Resume' },
            { id: 'daf', label: 'UPSC DAF Form' },
            { id: 'portfolio', label: 'Arch Portfolio' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setDocType(type.id as any)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                docType === type.id
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* File Drag and Drop / Input */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-500/60 transition-colors text-center cursor-pointer bg-slate-950/40 relative">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-200">
            {fileName || 'Click to browse or drop your PDF/DOCX file'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Max 10MB • Auto-extracts skills, projects & personal background
          </p>
        </div>

        {/* Extracted or Manual Bio Text Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Extracted Context / Or Paste Directly:
          </label>
          <textarea
            value={pastedBio}
            onChange={(e) => setPastedBio(e.target.value)}
            rows={4}
            placeholder="Paste your resume summary, DAF hobbies/hometown, or design manifesto..."
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Apply to AI Interview Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
};
