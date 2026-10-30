import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical } from 'lucide-react';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'ORIGINAL / BEFORE',
  afterLabel = 'TRANSFORMED / AFTER',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [afterLoadFailed, setAfterLoadFailed] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    setAfterLoadFailed(false);
  }, [afterImage]);

  const displayAfterImage = afterLoadFailed ? beforeImage : afterImage;

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(position);
  }, []);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Toggle Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span>Visual Comparison Mode:</span>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        /* Interactive Split Slider */
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-16/10 sm:aspect-16/9 rounded-2xl overflow-hidden select-none cursor-ew-resize bg-slate-950 border border-slate-800 shadow-2xl"
        >
          {/* After Image (Background full) */}
          <img
            src={displayAfterImage}
            alt="Transformed result"
            onError={() => setAfterLoadFailed(true)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-violet-950/80 backdrop-blur-md text-violet-300 border border-violet-500/40 text-[11px] font-bold tracking-wider z-10 pointer-events-none">
            {afterLabel}
          </div>

          {/* Before Image (Clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt="Original scene"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60 text-[11px] font-bold tracking-wider z-10">
              {beforeLabel}
            </div>
          </div>

          {/* Vertical Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-white to-violet-400 shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
              ↔
            </div>
          </div>

          {/* Hint Footer */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-400 text-[10px] pointer-events-none border border-slate-800">
            Drag slider left or right to compare changes
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>{beforeLabel}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Original Layout</span>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shadow-lg">
              <img
                src={beforeImage}
                alt="Before transformation"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* After Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-violet-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <span>{afterLabel}</span>
              </span>
              <span className="text-[10px] text-violet-400/80 font-normal">Proposed Transformation</span>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-violet-500/40 flex items-center justify-center p-2 shadow-lg shadow-violet-500/10">
              <img
                src={displayAfterImage}
                alt="After transformation"
                onError={() => setAfterLoadFailed(true)}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
