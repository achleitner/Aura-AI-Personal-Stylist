
import React from 'react';
import type { ClosetItem } from '../types';

interface ClosetSidebarProps {
  items: ClosetItem[];
  isOpen: boolean;
}

export const ClosetSidebar: React.FC<ClosetSidebarProps> = ({ items, isOpen }) => {
  return (
    <aside className={`bg-stone-100 border-r border-stone-200 p-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative w-72 h-full z-20`}>
      <h2 className="text-2xl font-serif text-stone-800 mb-6">Virtual Closet</h2>
      <div className="space-y-4 overflow-y-auto h-[calc(100%-4rem)] pr-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm">
            <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-md" />
            <div>
              <h3 className="font-semibold text-sm text-stone-700">{item.name}</h3>
              <p className="text-xs text-stone-500">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
