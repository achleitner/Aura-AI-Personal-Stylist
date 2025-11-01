
export type Sender = 'user' | 'aura';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  image?: string; // base64 encoded image
}

export interface ClosetItem {
  id: number;
  name: string;
  category: string;
  image: string; // URL to the image
}
