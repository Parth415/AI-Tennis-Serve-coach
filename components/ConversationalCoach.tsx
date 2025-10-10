import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { PracticeAnalysis } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { ConversationTranscript } from './ConversationTranscript';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

// Define a minimal interface for SpeechRecognition to provide type safety
// for the non-standard browser API, resolving the "Cannot find name 'SpeechRecognition'" error.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  abort: () => void;
  start: () => void;
  stop: () => void;
}

interface ConversationalCoachProps {
  analysisData: PracticeAnalysis;
}

// Check for API support outside the component
// Cast window to `any` to access non-standard SpeechRecognition APIs and rename to avoid shadowing the type.
const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognitionApi && 'speechSynthesis' in window;

const createSystemInstruction = (analysis: PracticeAnalysis): string => {
  // Collect strengths and improvements from the new phase-based analysis structure.
  const phases = [
    analysis.stanceAndSetup,
    analysis.tossAndWindup,
    analysis.trophyPose,
    analysis.contactAndPronation,
    analysis.followThrough,
  ];
  const strengths = phases.map(p => p.positive).join('; ');
  const improvements = phases.map(p => p.improvement).join('; ');

  return `You are "Serve Sensei", an expert tennis coach. Your student just finished a practice session.
Here is the summary of their performance:
- Total Serves: ${analysis.totalServes}
- Overall Impression: ${analysis.overallImpression}
- Strengths: ${strengths}
- Areas for Improvement: ${improvements}

Now, the student wants to ask you follow-up questions. Your role is to be encouraging, insightful, and conversational. Keep your answers concise and focused on the provided session data. If the user asks 'why' you gave certain feedback, explain your reasoning by referencing the session data and general tennis principles. Address the user directly. Start your first response by asking them what they want to discuss.`;
};


export const ConversationalCoach: React.FC<ConversationalCoachProps> = ({ analysisData }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<{ speaker: 'You' | 'Coach'; text: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = createSystemInstruction(analysisData);

    const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });
    setChat(chatSession);

    // Initial message from coach
    const startConversation = async () => {
        setStatus('processing');
        setError(null);
        try {
            const response = await chatSession.sendMessage({ message: "Start the conversation." });
            const aiText = response.text;
            setConversation([{ speaker: 'Coach', text: aiText }]);
            speak(aiText);
        } catch (error) {
            console.error("Failed to start conversation with AI", error);
            const errText = "I'm having trouble connecting right now. Please try again later.";
            setConversation([{ speaker: 'Coach', text: errText }]);
            setError(errText);
            setStatus('idle');
        }
    };
    startConversation();

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const userTranscript = event.results[event.results.length - 1][0].transcript.trim();
      if (userTranscript) {
        sendMessage(userTranscript);
      }
    };

    recognition.onstart = () => {
      setError(null);
      setStatus('listening');
    }
    recognition.onend = () => {
        // If we were listening, go back to idle. If processing, stay processing to avoid race conditions.
        setStatus(prev => prev === 'listening' ? 'idle' : prev);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = "An unknown error occurred with speech recognition.";
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMessage = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
      } else if (event.error === 'no-speech') {
          errorMessage = "I didn't hear anything. Please try again."
      }
      setError(errorMessage);
      setStatus('idle');
    };
    
    recognitionRef.current = recognition;

    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.abort();
    };
  }, [analysisData]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setError("There was an error with the verbal feedback.");
        setStatus('idle');
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text: string) => {
    if (!chat) return;

    setStatus('processing');
    setConversation(prev => [...prev, { speaker: 'You', text }]);
    
    try {
        const response = await chat.sendMessage({ message: text });
        const aiText = response.text;

        setConversation(prev => [...prev, { speaker: 'Coach', text: aiText }]);
        speak(aiText);
    } catch (error) {
        console.error("Failed to get response from AI", error);
        const errorText = "Sorry, I couldn't process that. Could you ask again?";
        setConversation(prev => [...prev, { speaker: 'Coach', text: errorText }]);
        setError("Sorry, I couldn't process that. Please ask again.");
        setStatus('idle');
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (status === 'speaking') {
      window.speechSynthesis.cancel();
      setStatus('idle');
      return;
    }

    if (status === 'listening') {
      recognitionRef.current.stop();
      return;
    }
    
    if (status === 'idle') {
      try {
        setError(null); 
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start recognition:", e);
        setError("Failed to start the microphone. Please check permissions and try again.");
        setStatus('idle');
      }
    }
  };

  const buttonContent = useMemo(() => {
    switch (status) {
      case 'listening':
        return <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" /> Listening...</>;
      case 'processing':
        return <><LoadingSpinner className="w-5 h-5 mr-2" /> Thinking...</>;
      case 'speaking':
        return <>Stop Speaking</>;
      case 'idle':
      default:
        return <>Ask a Question</>;
    }
  }, [status]);


  if (!isSpeechSupported) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Ask Your Coach</h3>
        <p className="text-sm text-gray-500">
            Voice-based coaching is not supported on your current browser. Try using Chrome or Safari for the full experience.
        </p>
      </div>
    );
  }

  return (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Ask Your Coach</h3>
        <div className="mb-4">
            <ConversationTranscript history={conversation} />
        </div>
        
        {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        )}

        <button
            onClick={handleMicClick}
            disabled={status === 'processing'}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
             <MicrophoneIcon className="w-5 h-5 mr-2" />
            {buttonContent}
        </button>
    </div>
  );
};