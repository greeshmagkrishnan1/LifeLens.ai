import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  AlertCircle,
  Upload,
  Sparkles,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePhoto: (base64: string, mimeType: string, autoAnalyze?: boolean) => void;
  onFallbackUpload: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onUsePhoto,
  onFallbackUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'starting' | 'live' | 'captured' | 'error'>('starting');
  const [errorDetails, setErrorDetails] = useState<{ name: string; message: string } | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Stop active stream tracks safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream && stream.getTracks) {
            stream.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch (e) {
                console.warn('Error stopping video srcObject track:', e);
              }
            });
          }
        } catch (e) {
          console.warn('Error accessing video.srcObject tracks:', e);
        }
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  // Check if multiple camera devices are available
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // Ignore enumeration errors
    }
  }, []);

  // Initialize and start live camera stream using getUserMedia
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      stopStream();
      setCameraState('starting');
      setErrorDetails(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('error');
        setErrorDetails({
          name: 'NotSupportedError',
          message: 'navigator.mediaDevices.getUserMedia is not supported in this browser environment.',
        });
        return;
      }

      try {
        let stream: MediaStream;
        try {
          // Attempt with preferred facingMode
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback to minimal video constraint
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play interrupted:', playErr);
          }
        }

        setCameraState('live');
        checkCameraDevices();
      } catch (err: any) {
        console.error('Camera access failed:', err?.name, err?.message);
        setCameraState('error');
        const errName = err?.name || 'Error';
        const errMsg = err?.message || 'Unable to access the camera.';
        setErrorDetails({
          name: errName,
          message: errMsg,
        });
      }
    },
    [stopStream, checkCameraDevices]
  );

  // Manage camera lifecycle when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCameraState('starting');
      setCapturedPhotoUrl(null);
      setErrorDetails(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture photo from video to canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using front camera, mirror image for natural snapshot feel
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPhotoUrl(dataUrl);
    setCameraState('captured');

    // Immediately stop live video tracks once photo is captured to release camera hardware
    stopStream();
  };

  // Retake photo: reopen live stream safely stopping previous streams
  const handleRetake = () => {
    stopStream();
    setCapturedPhotoUrl(null);
    startCamera(facingMode);
  };

  // Use captured photo: close camera and pass image to Analyze state
  const handleConfirmPhoto = (autoAnalyze: boolean = true) => {
    if (!capturedPhotoUrl) return;
    const photoToUse = capturedPhotoUrl;
    stopStream();
    setCapturedPhotoUrl(null);
    onUsePhoto(photoToUse, 'image/jpeg', autoAnalyze);
    onClose();
  };

  const handleClose = () => {
    stopStream();
    setCapturedPhotoUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[96vh]">
        {/* Header Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {cameraState === 'captured' ? 'Review Captured Photo' : 'LifeLens Live Optical Capture'}
              </h3>
              <p className="text-xs text-slate-400">
                {cameraState === 'captured'
                  ? 'Is this photo okay? Review before starting analysis'
                  : 'Point camera at any situation, scene, object, or document'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700/50 cursor-pointer"
            title="Cancel and close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[260px] sm:min-h-[340px] max-h-[56vh] overflow-hidden">
          {/* Live Video Preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${cameraState === 'live' ? 'block' : 'hidden'}`}
          />

          {/* Captured Photo Preview & Review Screen */}
          {cameraState === 'captured' && capturedPhotoUrl && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div className="relative max-w-full flex justify-center">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured scene"
                  className="max-h-[36vh] sm:max-h-[42vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-cyan-500/40 ring-1 ring-cyan-500/20"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-emerald-500/50 text-emerald-300 text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 shadow-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Photo Captured</span>
                </div>
              </div>

              {/* Review Question */}
              <div className="mt-3.5 sm:mt-4 text-center space-y-1">
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Is this photo okay?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Ready to analyze with LifeLens Multimodal Intelligence
                </p>
              </div>

              {/* Two Primary Action Buttons clearly visible below the captured image */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="w-full sm:w-1/2 py-3 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700/80 hover:border-slate-600 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmPhoto(true)}
                  className="w-full sm:w-1/2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Use This Photo & Analyze</span>
                </button>
              </div>
            </div>
          )}

          {/* Futuristic Viewfinder Reticles (Visible during live mode) */}
          {cameraState === 'live' && (
            <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
              {/* Top Targets & Live Indicator */}
              <div className="flex justify-between items-start">
                <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm"></div>
                <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono tracking-wider uppercase flex items-center space-x-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>LIVE SENSOR</span>
                </div>
                <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm"></div>
              </div>

              {/* Center Crosshair / Focus Ring */}
              <div className="self-center flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-cyan-400/30 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-cyan-400/70"></div>
                </div>
              </div>

              {/* Bottom Corner Targets */}
              <div className="flex justify-between items-end pb-16 sm:pb-2">
                <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm"></div>
                <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm"></div>
              </div>
            </div>
          )}

          {/* Prominent Floating "Capture Photo" Button directly OVER the live camera preview */}
          {cameraState === 'live' && (
            <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-auto">
              <div className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl shadow-cyan-950/60">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4 text-cyan-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center space-x-2.5 transition-all transform active:scale-95 cursor-pointer"
                  title="Capture Photo"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Capture Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading / Starting State */}
          {cameraState === 'starting' && (
            <div className="text-center p-8 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-spin">
                <Camera className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Initializing camera feed...</p>
              <p className="text-xs text-slate-400">Please grant camera permission if prompted by your browser</p>
            </div>
          )}

          {/* Error State */}
          {cameraState === 'error' && (
            <div className="text-center p-8 max-w-md space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-100">Camera Access Notice</h4>
                {errorDetails && (
                  <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 break-words">
                    <span className="font-bold text-amber-400">{errorDetails.name}</span>: {errorDetails.message}
                  </div>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorDetails?.name === 'NotAllowedError'
                    ? 'Camera permission was not granted by your browser or iframe security policy. LifeLens has declared camera permissions in metadata. If prompted by your browser, please choose Allow, or click Retry Camera below.'
                    : errorDetails?.name === 'NotFoundError'
                    ? 'No camera was found on your device. Please ensure a camera is connected, or switch to file upload.'
                    : 'Unable to start camera feed. Please check your camera permissions or switch to file upload.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onFallbackUpload();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Switch to File Upload</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-slate-950/90">
          {cameraState === 'live' && (
            <div className="flex items-center justify-between gap-3">
              {/* Flip Camera Toggle (if multiple cameras supported) */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Switch between front and back camera"
              >
                <SwitchCamera className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {facingMode === 'environment' ? 'Switch Camera' : 'Rear Camera'}
                </span>
              </button>

              {/* Shutter / Capture Photo Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span>Capture Photo</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {cameraState === 'captured' && (
            <div className="flex items-center justify-between gap-3 w-full">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmPhoto(true)}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Use This Photo & Analyze</span>
                </button>
              </div>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                Status: <span className="font-mono text-amber-400">{errorDetails?.name || 'Permission Required'}</span>
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
