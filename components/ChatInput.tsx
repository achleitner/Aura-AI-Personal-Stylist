import React, { useState, useRef } from 'react';
import { SendIcon, PaperclipIcon, CameraIcon } from './icons';
import { CameraView } from './CameraView';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleSendMessage = () => {
    if (isLoading || (!text.trim() && !image)) return;
    onSendMessage(text, image || undefined);
    setText('');
    setImage(null);
    setImageName(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(base64);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCapture = (imageData: string) => {
    setImage(imageData);
    setImageName(`capture-${new Date().toISOString()}.jpg`);
    setIsCameraOpen(false);
  };
  
  return (
    <>
      {isCameraOpen && <CameraView onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
      <div className="bg-stone-100 p-4 border-t border-stone-200">
        <div className="relative bg-white rounded-full border border-stone-300 shadow-sm flex items-center pr-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aura for style advice..."
            className="w-full p-3 pl-12 bg-transparent focus:outline-none resize-none"
            rows={1}
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-500 hover:text-pink-500 transition-colors"
            disabled={isLoading}
            aria-label="Attach file"
          >
            <PaperclipIcon />
          </button>
          <button
            onClick={() => setIsCameraOpen(true)}
            className="p-2 text-stone-500 hover:text-pink-500 transition-colors"
            disabled={isLoading}
            aria-label="Open camera"
          >
            <CameraIcon />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!text.trim() && !image)}
            className="p-2 rounded-full bg-pink-500 text-white disabled:bg-stone-300 transition-all duration-200 ease-in-out transform hover:scale-110"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        {imageName && (
          <div className="text-xs text-stone-500 mt-2 pl-4">
            Attached: {imageName}
          </div>
        )}
      </div>
    </>
  );
};