import React, { useRef } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUpload = ({ files = [], setFiles, maxFiles = 5, maxSizeMB = 5 }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addValidFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addValidFiles(droppedFiles);
  };

  const addValidFiles = (incoming) => {
    const valid = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of incoming) {
      if (files.length + valid.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      const isValidType =
        file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isValidType) {
        toast.error(`${file.name} is not an image or PDF`);
        continue;
      }

      valid.push(file);
    }

    if (valid.length > 0) {
      setFiles([...files, ...valid]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-700">
          <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          PNG, JPG, WEBP, GIF, or PDF (up to {maxSizeMB}MB each, max {maxFiles} files)
        </p>
      </div>

      {/* Uploaded files preview list */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((file, idx) => {
            const isImage = file.type?.startsWith('image/');
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
