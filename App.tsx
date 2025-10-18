
import React, { useState, useCallback } from 'react';
import type { UploadedImage } from './types';
import { uniteImages } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [image1, setImage1] = useState<UploadedImage | null>(null);
  const [image2, setImage2] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!image1 || !image2) {
      setError("Please upload both photos.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await uniteImages(
        { base64: image1.base64, mimeType: image1.mimeType },
        { base64: image2.base64, mimeType: image2.mimeType }
      );
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (e) {
      const err = e as Error;
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [image1, image2]);

  const canGenerate = image1 && image2 && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            Unite
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload two photos and let AI create a new one where the subjects are hugging naturally.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageUploader id="photo1" label="First Photo" onImageUpload={setImage1} onImageClear={() => setImage1(null)} />
              <ImageUploader id="photo2" label="Second Photo" onImageUpload={setImage2} onImageClear={() => setImage2(null)} />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full mt-6 py-3 px-4 text-lg font-semibold rounded-lg text-white transition-all duration-300 ease-in-out flex items-center justify-center gap-2
                ${canGenerate ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' : 'bg-gray-400 cursor-not-allowed'}
              `}
            >
              {isLoading ? (
                <>
                  <Spinner className="h-6 w-6 text-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon type="sparkles" className="h-6 w-6" />
                  <span>Unite Photos</span>
                </>
              )}
            </button>
          </div>
          
          {/* Output Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 self-start">Generated Image</h2>
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Spinner className="h-12 w-12 text-indigo-600" />
                  <p className="mt-4 text-gray-600 font-medium">Creating your image...</p>
                </div>
              )}
              {error && (
                <div className="text-center p-4 text-red-600">
                  <p className="font-semibold">Oh no! Something went wrong.</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {generatedImage && !isLoading && (
                <img src={generatedImage} alt="Generated result" className="w-full h-full object-contain" />
              )}
              {!generatedImage && !isLoading && !error && (
                <p className="text-gray-500">Your masterpiece will appear here</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Unite. Powered by AI.</p>
      </footer>
    </div>
  );
};

export default App;
