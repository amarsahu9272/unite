
import React, { useRef, useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { Icon } from './Icon';

interface ImageUploaderProps {
  id: string;
  onImageUpload: (image: UploadedImage) => void;
  onImageClear: () => void;
  label: string;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageUpload, onImageClear, label }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const uploadedImage: UploadedImage = { file, base64, mimeType };
        setImagePreview(URL.createObjectURL(file));
        onImageUpload(uploadedImage);
      } catch (error) {
        console.error("Error converting file to base64", error);
        // Handle error (e.g., show a notification to the user)
      }
    }
  }, [onImageUpload]);
  
  const clearImage = useCallback(() => {
    setImagePreview(null);
    onImageClear();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onImageClear]);

  return (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors duration-200 bg-white">
            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button 
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-white/70 rounded-full text-gray-600 hover:bg-white hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        aria-label="Remove image"
                    >
                        <Icon type="trash" className="h-5 w-5" />
                    </button>
                </>
            ) : (
                <div className="text-center cursor-pointer p-4" onClick={() => fileInputRef.current?.click()}>
                    <Icon type="upload" className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm">Click to upload a photo</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                </div>
            )}
            <input 
                ref={fileInputRef}
                id={id} 
                type="file" 
                className="sr-only" 
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange} 
            />
        </div>
    </div>
  );
};
