
import React from 'react';

export const TennisBallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93c4.68 4.68 6.1 11.2 2.12 15.15" />
    <path d="M19.07 19.07c-4.68-4.68-6.1-11.2-2.12-15.15" />
  </svg>
);
