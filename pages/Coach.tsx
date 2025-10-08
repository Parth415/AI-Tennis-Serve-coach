
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Welcome } from '../components/Welcome';
import { LoadingSpinner } from '../components/icons/LoadingSpinner';
import { LiveFeed } from '../components/live/LiveFeed';
import { analyzePracticeSession, analyzeServeImage } from '../services/geminiService';
import { FileUpload } from '../components/FileUpload';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { PracticeAnalysis, UserProfile } from '../types';

interface CoachProps {
  onSessionAnalyzed: (analysisData: PracticeAnalysis | string, type: 'practice' | 'image') => void;
  userProfile: UserProfile;
}

const Coach: React.FC<CoachProps> = ({ onSessionAnalyzed, userProfile }) => {
  const [mode, setMode] = useState<'practice' | 'upload'>('practice');

  // Practice session state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  // Shared state
  const [analysis, setAnalysis] = useState<string | PracticeAnalysis | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let active = true;

    async function getMedia() {
      if (mode !== 'practice') return;
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode },
        });
        if (active) {
          setStream(mediaStream);
          currentStream = mediaStream; 
          setError(null);
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (active) {
          setError("Camera and microphone access are required. Please grant permission and refresh.");
          console.error(err);
        }
      }
    }
    getMedia();
    
    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (mode !== 'practice') {
        setStream(s => {
          s?.getTracks().forEach(track => track.stop());
          return null;
        });
      }
    };
  }, [mode, facingMode]);

  // Effect for cleaning up object URL from file upload
  useEffect(() => {
    return () => {
      if (mediaDataUrl) {
        URL.revokeObjectURL(mediaDataUrl);
      }
    };
  }, [mediaDataUrl]);

  const handleSwitchCamera = () => {
    if (isRecording) return;
    setStream(prevStream => {
        prevStream?.getTracks().forEach(track => track.stop());
        return null;
    });
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleStartRecording = useCallback(() => {
    if (!stream) {
      setError("Media stream is not available.");
      return;
    }
    setError(null);
    setAnalysis(null);
    setCurrentSessionId(null);
    audioChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
              const base64Data = (reader.result as string).split(',')[1];
              const analysisResult = await analyzePracticeSession(base64Data, audioBlob.type, userProfile);
              setAnalysis(analysisResult);
              onSessionAnalyzed(analysisResult, 'practice');
              setCurrentSessionId(`temp_${Date.now()}`);
          } catch (err) {
              setError("Failed to analyze the session. Please try again.");
              console.error(err);
          } finally {
              setIsLoading(false);
          }
        };
        reader.onerror = () => {
            setError("Failed to read the recorded audio.");
            setIsLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to start recording.");
      console.error(err);
    }
  }, [stream, onSessionAnalyzed, userProfile]);
  
  const handleStopRecordingAndAnalyze = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  }, []);


  const handleFileChange = (selectedFile: File | null) => {
    if (analysis) setAnalysis(null);
    if (error) setError(null);
    setCurrentSessionId(null);
    
    if (mediaDataUrl) {
      URL.revokeObjectURL(mediaDataUrl);
    }

    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setMediaDataUrl(url);
      setMediaType(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : null);
    } else {
      setFile(null);
      setMediaDataUrl(null);
      setMediaType(null);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }
    if (mediaType !== 'image') {
      setError("Sorry, only image analysis is currently supported. Video analysis is coming soon!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentSessionId(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
            const base64Data = (reader.result as string).split(',')[1];
            const analysisResult = await analyzeServeImage(base64Data, file.type, userProfile);
            setAnalysis(analysisResult);
            onSessionAnalyzed(analysisResult, 'image');
            setCurrentSessionId(`temp_${Date.now()}`);
        } catch (err) {
            setError("Failed to analyze the image. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
      };
      reader.onerror = () => {
          setError("Failed to read the file.");
          setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
      console.error(err);
    }
  };

  const switchMode = (newMode: 'practice' | 'upload') => {
    if (mode === newMode) return;
    
    if (isRecording) {
      handleStopRecordingAndAnalyze();
    }
    
    setError(null);
    setIsLoading(false);
    setFile(null);
    setMediaDataUrl(null);
    setMediaType(null);
    setAnalysis(null);
    setCurrentSessionId(null);
    
    setMode(newMode);
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium focus:outline-none transition-colors ${
        active
          ? 'border-b-2 border-green-600 text-green-600'
          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
            <TabButton active={mode === 'practice'} onClick={() => switchMode('practice')}>
                Practice Session
            </TabButton>
            <TabButton active={mode === 'upload'} onClick={() => switchMode('upload')}>
                Upload & Analyze
            </TabButton>
        </div>
      
        {mode === 'practice' && (
            <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Practice Session</h2>
                <p className="text-gray-600 mb-6">
                    Record your serves and get a full analysis from the AI coach at the end of your session.
                </p>
                <LiveFeed 
                  stream={stream} 
                  onSwitchCamera={handleSwitchCamera} 
                  isSessionActive={isRecording}
                  facingMode={facingMode}
                />
                <div className="mt-auto pt-6 flex">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        disabled={!stream || isLoading}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? <LoadingSpinner /> : 'Start Recording'}
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecordingAndAnalyze}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Stop & Analyze
                      </button>
                    )}
                </div>
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <LoadingSpinner className="h-12 w-12 text-green-600"/>
                        <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your session...</p>
                    </div>
                )}
                {!isLoading && !analysis && (
                    <Welcome hasError={!!error} errorMessage={error} mode="practice" />
                )}
                {analysis && !isLoading && currentSessionId && (
                    typeof analysis === 'object' 
                        ? <AnalyticsDashboard data={analysis} sessionId={currentSessionId} /> 
                        : <AnalysisDisplay analysis={analysis.toString()} sessionId={currentSessionId} />
                )}
                </div>
            </div>
        )}

        {mode === 'upload' && (
             <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Upload Your Serve</h2>
                    <p className="text-gray-600 mb-6">
                        Select an image of your serve. The AI will analyze your form and provide feedback.
                    </p>
                    <FileUpload mediaDataUrl={mediaDataUrl} mediaType={mediaType} onFileChange={handleFileChange} />
                     <div className="mt-auto pt-6 flex space-x-4">
                        <button
                            onClick={handleAnalyzeFile}
                            disabled={!file || isLoading || mediaType === 'video'}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Analyze My Serve'}
                        </button>
                        <button
                            onClick={() => handleFileChange(null)}
                            disabled={!file || isLoading}
                            className="flex-1 px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
                <div className="p-6 md:p-8 bg-gray-50/50">
                     {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinner className="h-12 w-12 text-green-600"/>
                            <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your serve...</p>
                        </div>
                    )}
                    {!isLoading && !analysis && (
                        <Welcome hasError={!!error} errorMessage={error} mode="upload" />
                    )}
                    {analysis && !isLoading && currentSessionId && (
                        <AnalysisDisplay analysis={analysis.toString()} sessionId={currentSessionId} />
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Coach;
