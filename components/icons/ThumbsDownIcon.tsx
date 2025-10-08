
import React from 'react';

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17 14V2" />
    <path d="M6 14v6a2 2 0 0 0 2 2h5.5a5.5 5.5 0 0 0 5.3-4L22 10v-6H8.9a2.2 2.2 0 0 0-2.1 1.5L2 14h4Z" />
  </svg>
);
