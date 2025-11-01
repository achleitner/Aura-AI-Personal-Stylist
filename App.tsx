import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { ClosetSidebar } from './components/ClosetSidebar';
import { getAuraResponse } from './services/geminiService';
import type { Message, ClosetItem, SavedOutfit, GeneratedOutfit, SavedOutfitItemDetails } from './types';
import { INITIAL_CLOSET_ITEMS, INITIAL_MESSAGE } from './constants';
import { MenuIcon } from './components/icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>(INITIAL_CLOSET_ITEMS);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveOutfit = (outfitToSave: GeneratedOutfit) => {
    const newOutfitItems: SavedOutfitItemDetails[] = outfitToSave.items
      .map(generatedItem => {
        const closetItem = closetItems.find(ci => ci.name === generatedItem.itemName);
        if (!closetItem) {
          console.warn(`Could not find closet item named: ${generatedItem.itemName}`);
          return null;
        }
        return {
          closetItemId: closetItem.id,
          shoppingLinks: generatedItem.shoppingLinks,
          stylingNotes: generatedItem.stylingNotes,
        };
      })
      .filter((item): item is SavedOutfitItemDetails => item !== null);

    if (newOutfitItems.length > 0 && !savedOutfits.some(o => o.name === outfitToSave.outfitName)) {
      const newSavedOutfit: SavedOutfit = {
        id: `outfit-${Date.now()}`,
        name: outfitToSave.outfitName,
        items: newOutfitItems,
      };
      setSavedOutfits(prev => [...prev, newSavedOutfit]);
    } else {
      if (newOutfitItems.length === 0) {
        console.warn("Could not save outfit, no matching items found in closet.");
      }
    }
  };

  const handleAddItemToCloset = (item: Omit<ClosetItem, 'id'>) => {
    const newItem: ClosetItem = {
      id: Date.now(),
      ...item,
    };
    setClosetItems(prev => [newItem, ...prev]);
  };

  const handleDeleteClosetItem = (itemId: number) => {
    setClosetItems(prev => prev.filter(item => item.id !== itemId));
  };


  const handleSendMessage = async (text: string, image?: string) => {
    if (closetItems.length === 0 && !image) {
       const warningMessage: Message = {
        id: `aura-warning-${Date.now()}`,
        sender: 'aura',
        text: "My best advice comes when I can see your style! Please add some items to your Virtual Closet before asking for outfit ideas.",
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      image,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const auraResponse = await getAuraResponse(userMessage, messages, closetItems);

    let auraMessage: Message;

    if (typeof auraResponse === 'string') {
      auraMessage = {
        id: `aura-${Date.now()}`,
        sender: 'aura',
        text: auraResponse,
      };
    } else { // It's a GeneratedOutfit object
      auraMessage = {
        id: `aura-${Date.now()}`,
        sender: 'aura',
        text: auraResponse.introText, // Fallback text
        outfit: auraResponse,
      };
    }
    
    setMessages(prev => [...prev, auraMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-screen bg-stone-50 text-stone-800">
      <ClosetSidebar 
        closetItems={closetItems} 
        savedOutfits={savedOutfits} 
        isOpen={isSidebarOpen}
        onAddItem={handleAddItemToCloset}
        onDeleteItem={handleDeleteClosetItem}
      />
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
            <ChatMessage key={msg.id} message={msg} onSaveOutfit={handleSaveOutfit} />
          ))}
          {isLoading && (
            <div className="flex justify-start p-4 gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-200 flex-shrink-0 flex items-center justify-center font-serif font-bold text-pink-700">A</div>
                <div className="max-w-xl rounded-2xl p-4 bg-pink-50 text-stone-700 rounded-bl-none shadow-sm flex items-center gap-2">
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
