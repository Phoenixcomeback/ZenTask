
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSubtasks(taskTitle: string, taskDescription?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional productivity consultant. Break down the task "${taskTitle}" ${taskDescription ? `(Context: ${taskDescription})` : ''} into 3-6 actionable subtasks. Also provide an estimated time in minutes for each.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              estimatedMinutes: { type: Type.NUMBER }
            },
            required: ["title", "estimatedMinutes"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function generateChapters(folderName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5-8 essential chapters or modules for a student studying "${folderName}". Keep names concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Chapter Error:", error);
    return [];
  }
}

export async function prioritizeTasks(tasks: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these tasks and suggest the top 3 most important ones to do next based on priority and deadline: ${JSON.stringify(tasks)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              taskId: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["taskId", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function parseSmartSchedule(command: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert this scheduling command into a list of structured tasks: "${command}". 
      Current Date context: ${today}.
      Rules:
      1. Calculate 'targetPomodoros' assuming 1 Pomodoro = 25 minutes. If user specifies "3 hours", that is roughly 7 pomodoros.
      2. Assign a 'category' from [Study, Work, Personal, Strategy, Fitness, Admin].
      3. Assign a 'priority' from [low, medium, high].
      4. Infer 'deadline' from the command. If user says "by 12 May", use "YYYY-05-12". If no date is specified, use today's date (${today}). Always return dates in YYYY-MM-DD format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              targetPomodoros: { type: Type.NUMBER },
              deadline: { type: Type.STRING }
            },
            required: ["title", "category", "priority", "targetPomodoros", "deadline"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Smart Scheduler Error:", error);
    return [];
  }
}

export async function getSmartGoalSuggestions(recentActivity: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this productivity history: ${JSON.stringify(recentActivity)}, suggest 2 professional growth goals.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING },
              target: { type: Type.NUMBER }
            },
            required: ["title", "reason", "target"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function getProductivityInsights(statsData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this productivity data: ${JSON.stringify(statsData)}. Provide a sophisticated summary and tip.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tip: { type: Type.STRING }
          },
          required: ["summary", "tip"]
        }
      }
    });
    return JSON.parse(response.text || '{"summary": "Consistent focus detected.", "tip": "Keep it up."}');
  } catch (error) {
    return { summary: "Great focus maintained.", tip: "Try deep work sessions." };
  }
}
