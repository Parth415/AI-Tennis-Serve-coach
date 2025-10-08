
import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Focus trapping
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    }

    firstElement?.focus();
    modalRef.current?.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      modalRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            Session Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
