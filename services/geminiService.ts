
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'A concise title for the task, under 10 words.',
        },
        description: {
          type: Type.STRING,
          description: 'A brief description of the task, explaining what needs to be done.',
        },
      },
      required: ["title", "description"],
    },
};

export const generateTasks = async (goal: string): Promise<Omit<Task, 'id'>[]> => {
  try {
    // FIX: Moved instructions from the user prompt to systemInstruction for better clarity and adherence to API guidelines.
    const systemInstruction = `You are a project management assistant. Based on the user's goal, break it down into a list of actionable tasks suitable for a Kanban board.
    
Respond ONLY with a JSON array that matches the specified schema. Do not include any other text, explanations, or markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User's Goal: "${goal}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const generatedTasks = JSON.parse(jsonString);

    if (!Array.isArray(generatedTasks)) {
        throw new Error("Gemini API did not return a valid array.");
    }

    return generatedTasks.filter(task => task.title && task.description);
  } catch (error) {
    console.error("Error generating tasks with Gemini:", error);
    throw new Error("Failed to parse tasks from Gemini response.");
  }
};
