import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  mediaDataUrl: string | null;
  mediaType: 'image' | 'video' | null;
  onFileChange: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ mediaDataUrl, mediaType, onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileChange(file || null);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    onFileChange(file || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileSelect = () => {
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-grow flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        className="hidden"
        aria-label="Upload file"
      />
      {mediaDataUrl ? (
        <div className="relative group w-full flex-grow rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-black">
          {mediaType === 'image' && (
            <img src={mediaDataUrl} alt="Serve preview" className="w-full h-full object-contain" />
          )}
          {mediaType === 'video' && (
            <video src={mediaDataUrl} controls className="w-full h-full object-contain" aria-label="Serve video preview" />
          )}
          <div 
            onClick={triggerFileSelect}
            onKeyPress={(e) => e.key === 'Enter' && triggerFileSelect()}
            role="button"
            tabIndex={0}
            aria-label="Change selected file"
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity cursor-pointer">
            <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100">
              Change File
            </span>
          </div>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={triggerFileSelect}
          onKeyPress={(e) => e.key === 'Enter' && triggerFileSelect()}
          tabIndex={0}
          role="button"
          aria-label="Upload image or video of your serve"
          className="flex-grow flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Image or Video (PNG, JPG, MP4, etc.)</p>
          </div>
        </label>
      )}
    </div>
  );
};
