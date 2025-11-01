
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-pink-200 flex-shrink-0 flex items-center justify-center font-serif font-bold text-pink-700">
          A
        </div>
      )}
      <div className={`max-w-xl rounded-2xl p-4 ${isUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-white text-stone-700 rounded-bl-none shadow-sm'}`}>
        {message.image && (
          <img src={`data:image/jpeg;base64,${message.image}`} alt="uploaded content" className="rounded-lg mb-2 max-h-60" />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-blue-200 flex-shrink-0 flex items-center justify-center font-bold text-blue-700">
          U
        </div>
      )}
    </div>
  );
};
