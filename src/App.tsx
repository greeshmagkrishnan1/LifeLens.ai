import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { PipelineBar } from './components/PipelineBar';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisLoading } from './components/AnalysisLoading';
import { AnalysisView } from './components/AnalysisView';
import { FollowUpChat } from './components/FollowUpChat';
import { ExamplePresets } from './components/ExamplePresets';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { SituationAnalysis, PresetScenario } from './types/analysis';
import { AnalysisService } from './services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lifelens_theme');
    if (saved) return saved === 'dark';
    return true; // default futuristic dark
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SituationAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<PresetScenario | null>(null);
  const [lastUserFocus, setLastUserFocus] = useState<string | undefined>(undefined);

  // Apply dark mode class to root body
  useEffect(() => {
    localStorage.setItem('lifelens_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased selection:bg-cyan-500/30 selection:text-cyan-900 min-h-screen';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSelectImage = (base64: string, mimeType: string, fileName?: string) => {
    setSelectedImage(base64);
    setImageMimeType(mimeType);
    setImageFileName(fileName);
    setAnalysisResult(null);
    setErrorMessage(null);
    setActiveScenario(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageMimeType('image/jpeg');
    setImageFileName(undefined);
    setAnalysisResult(null);
    setErrorMessage(null);
    setActiveScenario(null);
    setLastUserFocus(undefined);
  };

  const handleAnalyze = async (
    imageBase64: string,
    mimeType: string,
    userFocus?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastUserFocus(userFocus);

    try {
      // If it's an SVG data URI (e.g. from preset), rasterize to clean PNG for the API
      let finalBase64 = imageBase64;
      let finalMime = mimeType;

      if (imageBase64.startsWith('data:image/svg+xml')) {
        const raster = await AnalysisService.svgToPngBase64(imageBase64);
        finalBase64 = raster.base64;
        finalMime = raster.mimeType;
      }

      const result = await AnalysisService.analyzeSituation({
        imageBase64: finalBase64,
        mimeType: finalMime,
        userFocus,
      });

      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err?.message || 'Unable to complete situation analysis. Please verify your connection and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (scenario: PresetScenario, autoAnalyze: boolean = false) => {
    setActiveScenario(scenario);
    setSelectedImage(scenario.imageSvg);
    setImageMimeType('image/png');
    setImageFileName(`${scenario.id}.png`);
    setAnalysisResult(null);
    setErrorMessage(null);

    if (autoAnalyze) {
      await handleAnalyze(scenario.imageSvg, 'image/png', scenario.promptHint);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onReset={handleClearImage}
        hasAnalysis={Boolean(analysisResult || selectedImage)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Pipeline Bar */}
        <PipelineBar
          currentStage={
            isLoading
              ? 'context'
              : analysisResult
              ? 'complete'
              : 'input'
          }
        />

        {/* Hero Banner when no analysis or image is selected */}
        {!analysisResult && !isLoading && !selectedImage && (
          <HeroIntro />
        )}

        {/* Error Notification Bar */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-200">Analysis Encountered an Issue</p>
                <p className="text-xs text-rose-300/90 leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>

            {selectedImage && (
              <button
                onClick={() => handleAnalyze(selectedImage, imageMimeType, lastUserFocus)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            )}
          </div>
        )}

        {/* Uploader / Image Selected Stage */}
        {!analysisResult && !isLoading && (
          <ImageUploader
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            selectedImage={selectedImage}
            onClearImage={handleClearImage}
            onSelectImage={handleSelectImage}
          />
        )}

        {/* Analyzing / Loading State */}
        {isLoading && (
          <AnalysisLoading imagePreviewUrl={selectedImage} />
        )}

        {/* Structured Results Display */}
        {analysisResult && selectedImage && !isLoading && (
          <div className="space-y-10">
            {/* The 6-Section Situation Analysis Card */}
            <AnalysisView
              analysis={analysisResult}
              imageSrc={selectedImage}
            />

            {/* Conversational Follow-Up Section Below Analysis */}
            <FollowUpChat
              imageBase64={selectedImage}
              mimeType={imageMimeType}
              suggestedQuestions={activeScenario?.suggestedQuestions}
            />
          </div>
        )}

        {/* Example Presets - Show when not actively in an analysis result */}
        {!analysisResult && (
          <ExamplePresets
            onSelectPreset={handleSelectPreset}
            isLoading={isLoading}
          />
        )}

        {/* If an analysis result is present, also allow trying another preset at the bottom */}
        {analysisResult && (
          <div className="mt-12">
            <ExamplePresets
              onSelectPreset={handleSelectPreset}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* Footer / Safety Disclaimer */}
      <SafetyDisclaimer />
    </div>
  );
}
