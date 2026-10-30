import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { PipelineBar } from './components/PipelineBar';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisLoading } from './components/AnalysisLoading';
import { AnalysisView } from './components/AnalysisView';
import { FollowUpChat } from './components/FollowUpChat';
import { ExamplePresets } from './components/ExamplePresets';
import { TransformPresets } from './components/TransformPresets';
import { TransformView } from './components/TransformView';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import {
  AppMode,
  SituationAnalysis,
  PresetScenario,
  TransformationResult,
  TransformPreset,
} from './types/analysis';
import { AnalysisService } from './services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lifelens_theme');
    if (saved) return saved === 'dark';
    return true; // default futuristic dark
  });

  const [activeMode, setActiveMode] = useState<AppMode>('analyze');

  // Shared Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // V1 Situation Analysis state
  const [analysisResult, setAnalysisResult] = useState<SituationAnalysis | null>(null);
  const [activeScenario, setActiveScenario] = useState<PresetScenario | null>(null);
  const [lastUserFocus, setLastUserFocus] = useState<string | undefined>(undefined);

  // V2 Vision Transform state
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [activeTransformPreset, setActiveTransformPreset] = useState<TransformPreset | null>(null);
  const [lastTransformRequest, setLastTransformRequest] = useState<string | undefined>(undefined);

  // Apply dark mode class to root body
  useEffect(() => {
    localStorage.setItem('lifelens_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-slate-50 text-slate-900 antialiased selection:bg-cyan-500/30 selection:text-cyan-900 min-h-screen';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleModeChange = (mode: AppMode) => {
    setActiveMode(mode);
    setErrorMessage(null);
  };

  const handleSelectImage = (base64: string, mimeType: string, fileName?: string) => {
    setSelectedImage(base64);
    setImageMimeType(mimeType);
    setImageFileName(fileName);
    setAnalysisResult(null);
    setTransformationResult(null);
    setErrorMessage(null);
    setActiveScenario(null);
    setActiveTransformPreset(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageMimeType('image/jpeg');
    setImageFileName(undefined);
    setAnalysisResult(null);
    setTransformationResult(null);
    setErrorMessage(null);
    setActiveScenario(null);
    setActiveTransformPreset(null);
    setLastUserFocus(undefined);
    setLastTransformRequest(undefined);
  };

  // --- V1 Situation Analysis Handler ---
  const handleAnalyze = async (
    imageBase64: string,
    mimeType: string,
    userFocus?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastUserFocus(userFocus);

    try {
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

  const handleSelectV1Preset = async (scenario: PresetScenario, autoAnalyze: boolean = false) => {
    setActiveScenario(scenario);
    setSelectedImage(scenario.imageSvg);
    setImageMimeType('image/png');
    setImageFileName(`${scenario.id}.png`);
    setAnalysisResult(null);
    setTransformationResult(null);
    setErrorMessage(null);

    if (autoAnalyze) {
      await handleAnalyze(scenario.imageSvg, 'image/png', scenario.promptHint);
    }
  };

  // --- V2 Vision Transform Handler ---
  const handleTransform = async (
    userRequest: string,
    isRefinement: boolean = false,
    isNextVersion: boolean = false
  ) => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLastTransformRequest(userRequest);

    // Calculate target version number
    const nextVersionNumber = isNextVersion
      ? (transformationResult?.version || 1) + 1
      : isRefinement
      ? transformationResult?.version || 1
      : 1;

    try {
      let finalBase64 = selectedImage;
      let finalMime = imageMimeType;

      if (selectedImage.startsWith('data:image/svg+xml')) {
        const raster = await AnalysisService.svgToPngBase64(selectedImage);
        finalBase64 = raster.base64;
        finalMime = raster.mimeType;
      }

      const result = await AnalysisService.transformVision({
        imageBase64: finalBase64,
        mimeType: finalMime,
        userRequest,
        version: nextVersionNumber,
        previousContext: (isRefinement || isNextVersion) && transformationResult ? {
          userRequest: transformationResult.userRequest,
          previousWhatChanged: transformationResult.whatChanged,
          version: transformationResult.version || 1,
        } : undefined,
      });

      setTransformationResult(result);
    } catch (err: any) {
      console.error('Transformation error:', err);
      setErrorMessage(
        err?.message || 'Unable to complete visual transformation. Please retry with a more specific description.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTransformPreset = async (preset: TransformPreset, autoTransform: boolean = false) => {
    setActiveTransformPreset(preset);
    setSelectedImage(preset.imageSvg);
    setImageMimeType('image/png');
    setImageFileName(`${preset.id}.png`);
    setTransformationResult(null);
    setAnalysisResult(null);
    setErrorMessage(null);

    if (autoTransform) {
      setIsLoading(true);
      try {
        const raster = await AnalysisService.svgToPngBase64(preset.imageSvg);
        const result = await AnalysisService.transformVision({
          imageBase64: raster.base64,
          mimeType: raster.mimeType,
          userRequest: preset.userRequest,
          version: 1,
        });
        setTransformationResult(result);
      } catch (err: any) {
        console.error('Preset transformation error:', err);
        setErrorMessage(err?.message || 'Failed to transform preset scenario.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hasActiveContent = Boolean(
    analysisResult || transformationResult || selectedImage
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Header
        activeMode={activeMode}
        onChangeMode={handleModeChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onReset={handleClearImage}
        hasContent={hasActiveContent}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Pipeline Bar (Mode-aware) */}
        <PipelineBar
          mode={activeMode}
          currentStage={
            isLoading
              ? 'context'
              : (activeMode === 'analyze' && analysisResult) || (activeMode === 'transform' && transformationResult)
              ? 'complete'
              : 'input'
          }
        />

        {/* Hero Banner when no image is selected or results active */}
        {!selectedImage && !analysisResult && !transformationResult && !isLoading && (
          <HeroIntro mode={activeMode} onChangeMode={handleModeChange} />
        )}

        {/* Error Notification Bar */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-200">
                  {activeMode === 'analyze' ? 'Analysis' : 'Transformation'} Encountered an Issue
                </p>
                <p className="text-xs text-rose-300/90 leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>

            {selectedImage && (
              <button
                onClick={() => {
                  if (activeMode === 'analyze') {
                    handleAnalyze(selectedImage, imageMimeType, lastUserFocus);
                  } else if (lastTransformRequest) {
                    handleTransform(lastTransformRequest);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: ANALYZE (V1 MULTIMODAL SITUATION INTELLIGENCE)     */}
        {/* ========================================================= */}
        {activeMode === 'analyze' && (
          <div className="space-y-10">
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
                <AnalysisView
                  analysis={analysisResult}
                  imageSrc={selectedImage}
                />

                <FollowUpChat
                  imageBase64={selectedImage}
                  mimeType={imageMimeType}
                  suggestedQuestions={activeScenario?.suggestedQuestions}
                />
              </div>
            )}

            {/* V1 Example Presets */}
            <ExamplePresets
              onSelectPreset={handleSelectV1Preset}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: TRANSFORM (V2 VISION → TRANSFORM)                  */}
        {/* ========================================================= */}
        {activeMode === 'transform' && (
          <div className="space-y-10">
            {/* If no image selected yet, show the ImageUploader */}
            {!selectedImage && !isLoading && (
              <div className="space-y-4">
                <div className="text-center max-w-lg mx-auto mb-2">
                  <h3 className="text-lg font-bold text-white">
                    Step 1: Upload a real-world space or object arrangement
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a photograph of your desk, bookshelf, living room, counter, or workspace.
                  </p>
                </div>
                <ImageUploader
                  onAnalyze={(_img, _mime) => {}}
                  isLoading={isLoading}
                  selectedImage={selectedImage}
                  onClearImage={handleClearImage}
                  onSelectImage={handleSelectImage}
                />
              </div>
            )}

            {/* If image is selected: show TransformView (Prompt form + Before/After result) */}
            {selectedImage && (
              <TransformView
                originalImage={selectedImage}
                transformationResult={transformationResult}
                isLoading={isLoading}
                onTransform={handleTransform}
                onReset={handleClearImage}
              />
            )}

            {/* V2 Transform Presets */}
            <TransformPresets
              onSelectPreset={handleSelectTransformPreset}
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
