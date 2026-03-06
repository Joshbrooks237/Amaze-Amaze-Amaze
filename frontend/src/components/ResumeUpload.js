import React, { useState, useRef } from 'react';
import { uploadResume } from '../api';

export default function ResumeUpload({ resumeInfo, onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await uploadResume(file);
      onUploadSuccess({
        fileName: result.fileName,
        textLength: result.textLength,
        preview: result.preview,
        uploadedAt: new Date().toISOString(),
      });
      setShowUploader(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Resume is loaded and user hasn't clicked "Update"
  if (resumeInfo && !showUploader) {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Master Resume</h2>
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                <span className="text-success text-lg">✓</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{resumeInfo.fileName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {resumeInfo.textLength?.toLocaleString()} characters
                  {resumeInfo.uploadedAt && (
                    <span> · uploaded {new Date(resumeInfo.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploader(true)}
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-400 bg-surface border border-surface-overlay
                         rounded-lg hover:text-slate-200 hover:border-slate-500 transition-colors"
            >
              Update Resume
            </button>
          </div>
          {resumeInfo.preview && (
            <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3 overflow-hidden border-t border-surface-overlay pt-3">
              {resumeInfo.preview}
            </p>
          )}
        </div>
      </div>
    );
  }

  // No resume loaded, or user clicked "Update"
  return (
    <div className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-200">
          {resumeInfo ? 'Update Resume' : 'Master Resume'}
        </h2>
        {resumeInfo && (
          <button
            onClick={() => setShowUploader(false)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragging
            ? 'border-primary-light bg-primary-light/10 scale-[1.02]'
            : 'border-surface-overlay hover:border-slate-500 bg-surface-raised'
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Parsing resume...</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm font-semibold text-slate-300">
              {resumeInfo ? 'Drop a new resume or click to browse' : 'Drop your resume here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PDF or DOCX, max 10MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-danger font-medium">{error}</p>
      )}

      {resumeInfo && (
        <p className="mt-3 text-xs text-slate-600">
          Current: {resumeInfo.fileName}
        </p>
      )}
    </div>
  );
}
