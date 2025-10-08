
import React from 'react';

interface MetricCardProps {
  label: string;
  count: number;
  total: number;
  description: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, count, total, description }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="font-bold text-lg text-green-600">{percentage}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-green-500 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  );
};
