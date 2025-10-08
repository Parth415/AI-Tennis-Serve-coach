import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';

interface VerbalFeedbackControlProps {
    script: string;
}

export const VerbalFeedbackControl: React.FC<VerbalFeedbackControlProps> = ({ script }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [canPlay, setCanPlay] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setCanPlay(true);
        }
        // Cleanup function to cancel speech if component unmounts
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handlePlay = useCallback(() => {
        if (!canPlay || isSpeaking) return;

        const utterance = new SpeechSynthesisUtterance(script);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false); // Handle errors
        
        window.speechSynthesis.cancel(); // Cancel any previous speech
        window.speechSynthesis.speak(utterance);
    }, [script, canPlay, isSpeaking]);

    const handleStop = useCallback(() => {
        if (!canPlay) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [canPlay]);

    if (!canPlay) {
        return null; // Don't render if speech synthesis is not supported
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Verbal Summary</h3>
            <div className="flex items-center space-x-4">
                {isSpeaking ? (
                    <button
                        onClick={handleStop}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        <StopIcon className="w-5 h-5 mr-2" />
                        Stop Feedback
                    </button>
                ) : (
                    <button
                        onClick={handlePlay}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Play Feedback
                    </button>
                )}
                {isSpeaking && <p className="text-sm text-gray-500 animate-pulse">Coach is speaking...</p>}
            </div>
        </div>
    );
};
