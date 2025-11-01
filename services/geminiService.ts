
import { GoogleGenAI } from "@google/genai";
import type { Message, ClosetItem } from '../types';
import { AURA_SYSTEM_PROMPT } from '../constants';

const MODEL_NAME = 'gemini-2.5-flash';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const getAuraResponse = async (
  userMessage: Message,
  chatHistory: Message[],
  closet: ClosetItem[]
): Promise<string> => {
  try {
    const closetContents = closet.map(item => `- ${item.name}`).join('\n');
    const historyContext = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'Aura'}: ${msg.text}`).join('\n');

    const fullPrompt = `
${AURA_SYSTEM_PROMPT}

Here is the user's current Virtual Closet:
${closetContents}

---
Chat History:
${historyContext}
---
User: ${userMessage.text}
Aura:
`;
    
    if (userMessage.image) {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg, could be dynamic
          data: userMessage.image,
        },
      };
      const textPart = {
        text: fullPrompt,
      };

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } else {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: fullPrompt
      });
      return response.text;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having a little trouble thinking right now. Please try again in a moment.";
  }
};
