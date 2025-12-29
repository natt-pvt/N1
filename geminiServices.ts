
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const geminiService = {
  /**
   * Generates clinical after-care instructions based on session notes.
   */
  async generateCareInstructions(notes: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Based on these clinical session notes, generate clear, friendly after-session care instructions for the patient: "${notes}"`,
        config: { 
          systemInstruction: "You are a senior medical consultant helping a doctor draft post-visit instructions." 
        }
      });
      return response.text || "No instructions generated.";
    } catch (error) {
      console.error("Gemini Care Instructions Error:", error);
      throw new Error("Failed to generate AI care instructions.");
    }
  },

  /**
   * AI Triage Chatbot for patient consultation.
   */
  async getTriageAdvice(prompt: string, history: { role: 'user' | 'model', text: string }[]): Promise<string> {
    try {
      const formattedHistory = history.map(m => ({ 
        role: m.role as any, 
        parts: [{ text: m.text }] 
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: "You are an empathetic clinic triage assistant. Recommend services or ask follow-ups. Always end with a medical professional disclaimer." 
        }
      });
      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Gemini Triage Error:", error);
      throw new Error("AI Assistant is currently unavailable.");
    }
  }
};
