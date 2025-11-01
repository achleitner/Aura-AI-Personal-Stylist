
export type Sender = 'user' | 'aura';

export interface ShoppingLink {
  title: string;
  url: string;
  price?: string;
}

export interface OutfitItemSuggestion {
  itemName: string;
  stylingNotes: string;
  shoppingLinks: ShoppingLink[];
}

export interface GeneratedOutfit {
  outfitName: string;
  introText: string;
  items: OutfitItemSuggestion[];
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  image?: string; // base64 encoded image
  outfit?: GeneratedOutfit;
}

export interface ClosetItem {
  id: number;
  name: string;
  category: string;
  image: string; // URL to the image
}

export interface SavedOutfitItemDetails {
  closetItemId: number;
  shoppingLinks: ShoppingLink[];
  stylingNotes: string;
}

export interface SavedOutfit {
  id: string;
  name: string;
  items: SavedOutfitItemDetails[];
}
