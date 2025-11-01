import React, { useState, useRef } from 'react';
import type { ClosetItem, SavedOutfit } from '../types';
import { StoreIcon, PlusIcon, TrashIcon, CloseIcon } from './icons';
import { CameraView } from './CameraView';
import { CLOSET_CATEGORIES } from '../constants';


interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: Omit<ClosetItem, 'id'>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CLOSET_CATEGORIES[0]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCapture = (imageData: string) => {
    setImageBase64(imageData);
    setIsCameraOpen(false);
  };

  const handleSubmit = () => {
    if (name.trim() && category && imageBase64) {
      onAddItem({
        name: name.trim(),
        category,
        image: `data:image/jpeg;base64,${imageBase64}`,
      });
      onClose();
    }
  };

  return (
    <>
      {isCameraOpen && <CameraView onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
      <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-serif">Add to Your Closet</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 text-stone-500"><CloseIcon /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="item-name" className="block text-sm font-medium text-stone-700">Item Name</label>
              <input 
                type="text" 
                id="item-name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                placeholder="e.g., White Silk Blouse"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-stone-700">Category</label>
              <select 
                id="category" 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              >
                {CLOSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-stone-700">Image</label>
               <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-md">
                 {imageBase64 ? (
                   <div className="relative">
                      <img src={`data:image/jpeg;base64,${imageBase64}`} alt="preview" className="max-h-40 rounded-md" />
                      <button onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-stone-500 hover:text-stone-800"><CloseIcon /></button>
                   </div>
                 ) : (
                   <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-stone-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="flex text-sm text-stone-600 justify-center">
                          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="font-medium text-pink-600 hover:text-pink-500">Upload a file</button>
                          <p className="pl-1">or</p>
                          <button type="button" onClick={() => setIsCameraOpen(true)} className="pl-1 font-medium text-pink-600 hover:text-pink-500">use camera</button>
                      </div>
                      <p className="text-xs text-stone-500">PNG, JPG up to 10MB</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-stone-50 border-t rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md shadow-sm hover:bg-stone-50">Cancel</button>
            <button 
              onClick={handleSubmit} 
              disabled={!name.trim() || !category || !imageBase64}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:bg-stone-300"
            >
              Save Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


interface ClosetSidebarProps {
  closetItems: ClosetItem[];
  savedOutfits: SavedOutfit[];
  isOpen: boolean;
  onAddItem: (item: Omit<ClosetItem, 'id'>) => void;
  onDeleteItem: (itemId: number) => void;
}

const ClosetItemsView: React.FC<{ items: ClosetItem[]; onAddItemClick: () => void; onDeleteItem: (itemId: number) => void; }> = ({ items, onAddItemClick, onDeleteItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center p-8 flex flex-col items-center">
        <h3 className="font-semibold text-stone-700">Your closet is empty</h3>
        <p className="text-sm text-stone-500 mt-2 mb-4">Add your first item to get started with personalized style advice.</p>
        <button 
          onClick={onAddItemClick}
          className="flex items-center gap-2 bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <PlusIcon />
          Add Your First Item
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <button 
        onClick={onAddItemClick}
        className="w-full flex items-center justify-center gap-2 bg-white text-pink-600 font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-pink-200 hover:bg-pink-50 transition-colors"
      >
        <PlusIcon />
        Add New Item
      </button>
      {items.map(item => (
        <div key={item.id} className="group flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm relative overflow-hidden">
          <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-md flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-stone-700">{item.name}</h3>
            <p className="text-xs text-stone-500">{item.category}</p>
          </div>
          <button 
            onClick={() => onDeleteItem(item.id)} 
            className="absolute top-1 right-1 p-1.5 rounded-full bg-stone-500/20 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
            aria-label={`Delete ${item.name}`}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

const SavedOutfitsView: React.FC<{ outfits: SavedOutfit[]; allItems: ClosetItem[] }> = ({ outfits, allItems }) => {
  const [expandedOutfitId, setExpandedOutfitId] = useState<string | null>(null);
  const getItemById = (id: number) => allItems.find(item => item.id === id);

  return (
    <div className="space-y-4">
      {outfits.length === 0 && <p className="text-sm text-stone-500 text-center p-4">You haven't saved any outfits yet. Ask Aura to create one for you!</p>}
      {outfits.map(outfit => {
        const outfitImages = outfit.items.map(i => getItemById(i.closetItemId)?.image).filter(Boolean) as string[];

        return (
          <div key={outfit.id} className="bg-white p-3 rounded-lg shadow-sm transition-all duration-300">
            <button 
              onClick={() => setExpandedOutfitId(expandedOutfitId === outfit.id ? null : outfit.id)}
              className="w-full text-left flex justify-between items-start"
              aria-expanded={expandedOutfitId === outfit.id}
            >
              <div className="flex-1 pr-2">
                <h3 className="font-semibold text-stone-800">{outfit.name}</h3>
                {expandedOutfitId !== outfit.id && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {outfitImages.slice(0, 5).map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-10 h-12 object-cover rounded-sm" />
                    ))}
                  </div>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-stone-400 transition-transform flex-shrink-0 mt-1 ${expandedOutfitId === outfit.id ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {expandedOutfitId === outfit.id && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-4">
                {outfit.items.map(outfitItem => {
                  const closetItem = getItemById(outfitItem.closetItemId);
                  if (!closetItem) return null;

                  return (
                    <div key={closetItem.id}>
                      <div className="flex items-center gap-3">
                        <img src={closetItem.image} alt={closetItem.name} className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
                        <div>
                           <p className="font-semibold text-sm text-stone-700">{closetItem.name}</p>
                           <p className="text-xs italic text-stone-600 mt-1">"{outfitItem.stylingNotes}"</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs">
                        <p className="font-semibold mb-1 text-stone-500">Shop similar items:</p>
                        <div className="space-y-1">
                          {outfitItem.shoppingLinks.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 transition-colors p-2 rounded-md text-stone-700"
                            >
                              <StoreIcon />
                              <span className="truncate">
                                  {link.title}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


export const ClosetSidebar: React.FC<ClosetSidebarProps> = ({ closetItems, savedOutfits, isOpen, onAddItem, onDeleteItem }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} onAddItem={onAddItem} />}
      <aside className={`bg-stone-100 border-r border-stone-200 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative w-80 h-full z-20`}>
        <div className="p-4 border-b border-stone-200">
          <h2 className="text-2xl font-serif text-stone-800">Virtual Closet</h2>
        </div>
        
        <div className="p-2 border-b border-stone-200">
          <div className="flex bg-stone-200 rounded-md p-1">
            <button 
              onClick={() => setActiveTab('items')} 
              className={`flex-1 text-sm font-semibold p-1.5 rounded-md transition-colors ${activeTab === 'items' ? 'bg-white shadow-sm text-pink-600' : 'text-stone-600'}`}>
              Items ({closetItems.length})
            </button>
            <button 
              onClick={() => setActiveTab('outfits')} 
              className={`flex-1 text-sm font-semibold p-1.5 rounded-md transition-colors ${activeTab === 'outfits' ? 'bg-white shadow-sm text-pink-600' : 'text-stone-600'}`}>
              Outfits ({savedOutfits.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'items' ? 
            <ClosetItemsView 
              items={closetItems} 
              onAddItemClick={() => setIsModalOpen(true)}
              onDeleteItem={onDeleteItem}
            /> : 
            <SavedOutfitsView outfits={savedOutfits} allItems={closetItems} />}
        </div>
      </aside>
    </>
  );
};
