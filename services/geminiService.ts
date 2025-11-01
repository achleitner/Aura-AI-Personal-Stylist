
import { GoogleGenAI } from "@google/genai";
import type { Message, ClosetItem, GeneratedOutfit } from '../types';
import { AURA_SYSTEM_PROMPT } from '../constants';

const MODEL_NAME = 'gemini-2.5-flash';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAuraResponse = async (
  userMessage: Message,
  chatHistory: Message[],
  closet: ClosetItem[]
): Promise<string | GeneratedOutfit> => {
  try {
    const closetContents = closet.map(item => `- ${item.name} (${item.category})`).join('\n');
    const historyContext = chatHistory
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Aura'}: ${msg.outfit ? '[Aura sent an outfit]' : msg.text}`)
      .join('\n');

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
    
    let responseText: string;
    
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
      responseText = response.text;
    } else {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: fullPrompt
      });
      responseText = response.text;
    }

    // Attempt to parse the response as JSON
    try {
      // Sometimes the model wraps the JSON in ```json ... ```
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      const jsonData = JSON.parse(cleanedText);
      // Basic validation to see if it's the structure we expect
      if (jsonData.outfitName && jsonData.items && jsonData.introText) {
        return jsonData as GeneratedOutfit;
      }
    } catch (e) {
      // It's not valid JSON, or not the format we expect. Treat as regular text.
    }

    return responseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having a little trouble thinking right now. Please try again in a moment.";
  }
};
