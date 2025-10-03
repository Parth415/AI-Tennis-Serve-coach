
import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface WelcomeProps {
    hasError: boolean;
    errorMessage: string | null;
}

export const Welcome: React.FC<WelcomeProps> = ({ hasError, errorMessage }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            {hasError ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 text-left">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <InfoIcon className="h-16 w-16 text-green-500 opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Your Live Coach is Ready</h3>
                    <p className="mt-2 text-gray-500">
                        When you're ready to begin, press the "Start Session" button. The AI will be ready to listen and provide feedback.
                    </p>
                </>
            )}
        </div>
    );
}
