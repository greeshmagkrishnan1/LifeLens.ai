import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { AnalysisService } from '../services/api';

interface ImageUploaderProps {
  onAnalyze: (imageBase64: string, mimeType: string, userFocus?: string) => void;
  isLoading: boolean;
  selectedImage: string | null;
  onClearImage: () => void;
  onSelectImage: (base64: string, mimeType: string, fileName?: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyze,
  isLoading,
  selectedImage,
  onClearImage,
  onSelectImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [userFocus, setUserFocus] = useState('');
  const [imageMeta, setImageMeta] = useState<{ name?: string; size?: string; mimeType: string }>({
    mimeType: 'image/jpeg',
  });

  // Handle global clipboard paste for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFile(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isLoading]);

  const handleFile = async (file: File) => {
    try {
      const { base64, mimeType } = await AnalysisService.readFileAsBase64(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageMeta({
        name: file.name,
        size: `${sizeMb} MB`,
        mimeType,
      });
      onSelectImage(base64, mimeType, file.name);
    } catch (err) {
      console.error('Failed to read image file:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerAnalyze = () => {
    if (!selectedImage) return;
    onAnalyze(selectedImage, imageMeta.mimeType, userFocus.trim() || undefined);
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif, image/heic"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!selectedImage ? (
        /* Empty / Uploading Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          {/* Futuristic Optical Aim Reticles */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-sm pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-sm pointer-events-none"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br-sm pointer-events-none"></div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="relative mx-auto w-18 h-18 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/20 to-violet-500/10 border border-cyan-500/30 flex items-center justify-center group shadow-inner">
              <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 blur-md animate-pulse"></div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">
                Drop your image here or browse from device
              </h3>
              <p className="text-sm text-slate-400">
                Supports JPG, PNG, WEBP, HEIC. You can also paste directly with{' '}
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Ctrl+V
                </kbd>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/30 transition-all flex items-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-2"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview & Focus Selection Area */
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Preview Box */}
            <div className="md:col-span-5 relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-80 shadow-inner">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-full h-auto max-h-72 object-contain rounded-xl"
              />

              {/* Optical corner marks */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70"></div>
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70"></div>
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70"></div>
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70"></div>

              {/* Remove image button */}
              <button
                onClick={onClearImage}
                disabled={isLoading}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors backdrop-blur-md shadow-md"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              {imageMeta.name && (
                <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/50 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="truncate max-w-[180px]">{imageMeta.name}</span>
                  {imageMeta.size && <span className="text-slate-400 font-mono">{imageMeta.size}</span>}
                </div>
              )}
            </div>

            {/* Situation Context Input & Run Trigger */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready for Multimodal Analysis</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  What situation do you want LifeLens to understand?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  LifeLens will process the scene through its 5-stage pipeline: observations, situation context, relevance, risks, and recommended actions.
                </p>
              </div>

              {/* Optional user focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Specific question or focus (Optional)</span>
                  <span className="text-slate-500 font-normal">e.g. "Is this cable safe?"</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userFocus}
                    onChange={(e) => setUserFocus(e.target.value)}
                    placeholder="Ask a specific question or leave blank for full situation analysis..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-sm placeholder:text-slate-500 transition-colors"
                  />
                  {userFocus && (
                    <button
                      type="button"
                      onClick={() => setUserFocus('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={triggerAnalyze}
                  disabled={isLoading}
                  className="flex-1 min-w-[200px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Situation Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClearImage}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
                >
                  Change Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
