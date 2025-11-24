import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Safe check for API key
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  /**
   * Generates a professional service description based on a name and type.
   */
  generateServiceDescription: async (name: string, type: string): Promise<string> => {
    const client = getClient();
    if (!client) return "Please configure API_KEY to use AI features.";

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short, alluring, and professional description (max 2 sentences) for a service named "${name}" in the category of "${type}". focus on the benefits to the customer.`,
      });
      return response.text?.trim() || "Description unavailable.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Failed to generate description. Please try again.";
    }
  },

  /**
   * Suggests a reply or note based on appointment details.
   */
  analyzeAppointmentTrend: async (appointmentsCount: number, revenue: number): Promise<string> => {
    const client = getClient();
    if (!client) return "";

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `We have ${appointmentsCount} active appointments and a projected revenue of $${revenue}. Give me a 1 sentence motivational business insight for the dashboard.`,
      });
      return response.text?.trim() || "";
    } catch (error) {
      return "";
    }
  }
};