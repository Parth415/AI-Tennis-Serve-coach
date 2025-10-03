
import React from 'react';
import { TennisBallIcon } from './icons/TennisBallIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <TennisBallIcon className="h-10 w-10 text-green-500" />
        <h1 className="ml-3 text-3xl font-bold text-gray-800 tracking-tight">
          Serve <span className="text-green-600">Sensei</span>
        </h1>
      </div>
    </header>
  );
};
