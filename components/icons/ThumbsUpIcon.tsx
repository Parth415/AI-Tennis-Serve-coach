
import React from 'react';

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 10v12" />
    <path d="M18 10V4a2 2 0 0 0-2-2H8.5a5.5 5.5 0 0 0-5.3 4L2 14v6h13.1a2.2 2.2 0 0 0 2.1-1.5L22 10h-4Z" />
  </svg>
);
