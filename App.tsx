
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { LiveFeed } from './components/live/LiveFeed';
import { TranscriptionDisplay } from './components/live/TranscriptionDisplay';
import { connectToLiveCoaching } from './services/geminiService';
// FIX: Import Blob for use in createBlob function.
import { LiveSession, Blob } from '@google/genai';

// Audio playback helpers
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

// FIX: Replaced with the more robust decodeAudioData function from the guidelines.
// This version correctly handles sample rate and channel count.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// FIX: Moved encode function outside the component and added createBlob helper.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const App: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionHistory, setTranscriptionHistory] = useState<{ speaker: 'You' | 'Coach'; text: string }[]>([]);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  const cleanupAudio = useCallback(() => {
      sources.forEach(source => source.stop());
      sources.clear();
      nextStartTime = 0;

      scriptProcessorRef.current?.disconnect();
      mediaStreamSourceRef.current?.disconnect();
      inputAudioContextRef.current?.close().catch(console.error);
      outputAudioContextRef.current?.close().catch(console.error);

      scriptProcessorRef.current = null;
      mediaStreamSourceRef.current = null;
      inputAudioContextRef.current = null;
      outputAudioContextRef.current = null;
      outputNodeRef.current = null;
  }, []);

  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
    }
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    cleanupAudio();
    sessionPromiseRef.current = null;
  }, [stream, cleanupAudio]);

  useEffect(() => {
    async function getMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setStream(mediaStream);
      } catch (err) {
        setError("Camera and microphone access are required for live coaching. Please grant permission and refresh the page.");
        console.error(err);
      }
    }
    if (!stream) {
        getMedia();
    }
    return () => {
      if (isSessionActive) {
        handleEndSession();
      }
    };
  }, [stream, isSessionActive, handleEndSession]);

  const handleStartSession = useCallback(async () => {
    if (!stream) {
      setError("Media stream is not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTranscriptionHistory([]);
    
    let currentInput = "";
    let currentOutput = "";

    const onMessage = async (message: any) => {
        if (message.serverContent?.inputTranscription) {
            currentInput += message.serverContent.inputTranscription.text;
        }
        if (message.serverContent?.outputTranscription) {
            currentOutput += message.serverContent.outputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            const fullInput = currentInput;
            const fullOutput = currentOutput;
            
            setTranscriptionHistory(prev => {
                const newHistory = [...prev];
                if (fullInput.trim()) {
                    newHistory.push({ speaker: 'You', text: fullInput.trim() });
                }
                if (fullOutput.trim()) {
                    newHistory.push({ speaker: 'Coach', text: fullOutput.trim() });
                }
                return newHistory;
            });
            currentInput = "";
            currentOutput = "";
        }
      
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData && outputAudioContextRef.current && outputNodeRef.current) {
            try {
                // FIX: Pass sampleRate and numChannels to decodeAudioData as per guidelines.
                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current);
                source.addEventListener('ended', () => sources.delete(source));
                
                const now = outputAudioContextRef.current.currentTime;
                nextStartTime = Math.max(nextStartTime, now);
                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
                sources.add(source);
            } catch (e) {
                console.error("Error processing audio:", e);
            }
        }
    };

    try {
        sessionPromiseRef.current = connectToLiveCoaching({
            onMessage: onMessage,
            onError: (e) => {
              console.error("Session error:", e);
              setError("An error occurred during the session.");
              handleEndSession();
            },
            onClose: () => {
              console.log("Session closed.");
            }
        });

        await sessionPromiseRef.current; // Wait for session to open

        // Setup input audio streaming
        // FIX: Cast window to `any` to fix TypeScript error for vendor-prefixed webkitAudioContext.
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // FIX: Cast window to `any` to fix TypeScript error for vendor-prefixed webkitAudioContext.
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);

        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            // FIX: Use createBlob helper for clarity and correctness.
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        
        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

        setIsLoading(false);
        setIsSessionActive(true);

    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Could not connect to the AI coach. Please try again.");
      setIsLoading(false);
    }
  }, [stream, handleEndSession]);
  

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Live Coaching Session</h2>
              <p className="text-gray-600 mb-6">
                Click "Start Session" to connect with your AI coach. Use your microphone to ask for feedback on your serve.
              </p>
              <LiveFeed stream={stream} />
              <div className="mt-auto pt-6 flex space-x-4">
                 <button
                    onClick={handleStartSession}
                    disabled={!stream || isSessionActive || isLoading}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <LoadingSpinner /> : (isSessionActive ? 'Session Active' : 'Start Session')}
                  </button>
                  <button
                    onClick={handleEndSession}
                    disabled={!isSessionActive}
                    className="flex-1 px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    End Session
                  </button>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50">
               {isLoading && (
                 <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner className="h-12 w-12 text-green-600"/>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Connecting to coach...</p>
                 </div>
               )}
               {!isLoading && !isSessionActive && (
                  <Welcome hasError={!!error} errorMessage={error} />
               )}
               {isSessionActive && !isLoading && (
                <TranscriptionDisplay history={transcriptionHistory} />
               )}
            </div>
          </div>
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini. For educational purposes only. Always consult a human coach.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
