import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectEmotion(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza el siguiente texto de un niño y detecta cuál de estas emociones predomina: joy, sadness, anger, fear, calm, surprise. Texto: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object" as any,
        properties: {
          emotion: { type: "string" },
          reason: { type: "string" }
        },
        required: ["emotion", "reason"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Error parsing emotion detection response", e);
    return { emotion: "calm", reason: "Default fallback" };
  }
}

export async function getCocoResponse(islandName: string, emotion: string, userText: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres Coco, un psicólogo experto en niños y desarrollo emocional. Eres empático, lúdico y profesional. 
      Estamos en el "Mapa de las Emociones", específicamente en la zona de ${islandName} (relacionada con la emoción: ${emotion}). 
      El niño dice: "${userText}". 
      Tu objetivo es validar su emoción, explicarle brevemente por qué es normal sentirse así y guiarlo hacia la calma o la comprensión. 
      Responde de forma corta, cariñosa y como un guía experto.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error in getCocoResponse:", error);
    const fallbacks = [
      "¡Te escucho! Sigamos adelante juntos.",
      "Qué valiente eres por compartir eso conmigo.",
      "Estoy aquí contigo, vamos a explorar este mapa.",
      "Entiendo cómo te sientes, ¡eres genial!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
