
import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { ClosetSidebar } from './components/ClosetSidebar';
import { getAuraResponse } from './services/geminiService';
import type { Message, ClosetItem } from './types';
import { INITIAL_CLOSET_ITEMS, INITIAL_MESSAGE } from './constants';
import { MenuIcon } from './components/icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [closetItems] = useState<ClosetItem[]>(INITIAL_CLOSET_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string, image?: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      image,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const auraResponseText = await getAuraResponse(userMessage, messages, closetItems);

    const auraMessage: Message = {
      id: `aura-${Date.now()}`,
      sender: 'aura',
      text: auraResponseText,
    };
    
    setMessages(prev => [...prev, auraMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-screen bg-stone-50 text-stone-800">
      <ClosetSidebar items={closetItems} isOpen={isSidebarOpen} />
      <main className="flex flex-1 flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b border-stone-200 bg-white/50 backdrop-blur-sm">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-stone-600">
              <MenuIcon />
           </button>
          <h1 className="text-xl font-serif font-bold text-center flex-1">Aura</h1>
          <div className="w-8 lg:hidden"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start p-4 gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-200 flex-shrink-0 flex items-center justify-center font-serif font-bold text-pink-700">A</div>
                <div className="max-w-xl rounded-2xl p-4 bg-white text-stone-700 rounded-bl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;
