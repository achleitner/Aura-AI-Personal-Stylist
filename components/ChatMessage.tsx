
import React from 'react';
import type { Message, GeneratedOutfit } from '../types';
import { BookmarkIcon, StoreIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  onSaveOutfit?: (outfit: GeneratedOutfit) => void;
}

const OutfitDisplay: React.FC<{ outfit: GeneratedOutfit; onSaveOutfit?: (outfit: GeneratedOutfit) => void; }> = ({ outfit, onSaveOutfit }) => {
  return (
    <div className="mt-3 border-t border-pink-100 pt-3">
      <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-serif font-bold">{outfit.outfitName}</h3>
          {onSaveOutfit && (
            <button 
              onClick={() => onSaveOutfit(outfit)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white text-pink-600 hover:bg-pink-50 transition-colors py-1.5 px-3 rounded-full border border-pink-200"
              aria-label="Save outfit"
            >
              <BookmarkIcon />
              Save Outfit
            </button>
          )}
      </div>
      
      <div className="space-y-4">
        {outfit.items.map((item, index) => (
          <div key={index} className="p-3 bg-white/50 rounded-lg">
            <p className="font-bold text-stone-800">{item.itemName}</p>
            <p className="text-sm italic text-stone-600 my-1">"{item.stylingNotes}"</p>
            <div className="mt-2 text-xs">
              <p className="font-semibold mb-1 text-stone-500">Shop similar items:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {item.shoppingLinks.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 bg-stone-100 hover:bg-stone-200 transition-colors p-2 rounded-md text-stone-700"
                  >
                    <StoreIcon />
                    <span className="truncate">
                        {link.title} {link.price && `(${link.price})`}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSaveOutfit }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-pink-200 flex-shrink-0 flex items-center justify-center font-serif font-bold text-pink-700 mt-1">
          A
        </div>
      )}
      <div className={`max-w-2xl w-full rounded-2xl p-4 ${isUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-pink-50 text-stone-700 rounded-bl-none shadow-sm'}`}>
        {message.image && (
          <img src={`data:image/jpeg;base64,${message.image}`} alt="uploaded content" className="rounded-lg mb-2 max-h-60" />
        )}
        <p className="whitespace-pre-wrap">{message.outfit?.introText || message.text}</p>
        {message.outfit && <OutfitDisplay outfit={message.outfit} onSaveOutfit={onSaveOutfit} />}
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-blue-200 flex-shrink-0 flex items-center justify-center font-bold text-blue-700 mt-1">
          U
        </div>
      )}
    </div>
  );
};
