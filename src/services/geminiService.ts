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
      contents: `Eres Coco, un guía emocional empático para niños. Estamos en la ${islandName} (temática: ${emotion}). El niño dice: "${userText}". Responde de forma corta, cariñosa y validando su emoción.`,
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
