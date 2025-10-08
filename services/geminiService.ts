
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeAnalysis, UserProfile } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateImageAnalysisInstruction = (userProfile?: UserProfile): string => {
  let userContext = "an amateur tennis player";
  if (userProfile && userProfile.name) {
    userContext = `${userProfile.name}`;
    if (userProfile.age) {
      userContext += `, a ${userProfile.age}-year-old`;
    }
    if (userProfile.skillLevel) {
      userContext += ` ${userProfile.skillLevel} player`;
    }
  }

  return `You are an expert tennis coach specializing in serve biomechanics. Your name is "Serve Sensei". Your goal is to provide constructive, encouraging, and actionable feedback to ${userContext} based on an image of their serve.

  Analyze the image provided and break down your feedback into the following markdown formatted sections:
  - Start with an overall impression with the title '## Overall Impression'.
  - Then, a section for '### Strengths' listing positive aspects of the form. Use '*' for bullet points.
  - Next, a section for '### Areas for Improvement' listing aspects that could be better. Use '*' for bullet points.
  - For each point under 'Areas for Improvement', provide a simple, numbered drill or tip the player can use to practice.

  Keep the tone positive, motivational, and easy to understand for a non-professional player. Do not use unsafe HTML.`;
}


export const analyzeServeImage = async (base64ImageData: string, mimeType: string, userProfile?: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: "Please analyze my tennis serve from this image."
                }
            ]
        },
        config: {
            systemInstruction: generateImageAnalysisInstruction(userProfile),
            temperature: 0.4,
            topK: 32,
            topP: 1,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};

const generateSessionAnalysisInstruction = (userProfile?: UserProfile): string => {
  let userContext = "a user's";
   if (userProfile && userProfile.name) {
    userContext = `${userProfile.name}'s`;
  }
  
  return `You are an expert tennis coach, "Serve Sensei", analyzing an audio recording of ${userContext} practice session.
  Your task is to listen to the sounds of serves (footwork, toss, swing, impact) and provide a quantitative and qualitative analysis in JSON format.

  1.  **Count the total number of serves** you can clearly distinguish in the audio.
  2.  **Evaluate each serve** based on the inferred sounds for the following key metrics:
      *   **Good Toss:** A consistent, quiet sound suggests a smooth, repeatable toss.
      *   **Good Pronation:** A sharp, "cracking" or "snapping" sound at impact is a good indicator. A dull thud might indicate poor pronation.
      *   **Good Follow-Through:** A smooth, continuous "whoosh" sound after impact suggests a complete and fluid follow-through. An abrupt sound might mean the player is cutting the motion short.
  3.  **Provide a qualitative summary.**

  Based on your analysis, return a JSON object that adheres to the provided schema. Do not return markdown or any other format.`;
}


const practiceAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        totalServes: {
            type: Type.INTEGER,
            description: "The total number of serves detected in the audio recording.",
        },
        metrics: {
            type: Type.OBJECT,
            properties: {
                goodToss: {
                    type: Type.OBJECT,
                    properties: {
                        count: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                    },
                    required: ["count", "description"],
                },
                goodPronation: {
                    type: Type.OBJECT,
                    properties: {
                        count: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                    },
                    required: ["count", "description"],
                },
                goodFollowThrough: {
                    type: Type.OBJECT,
                    properties: {
                        count: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                    },
                    required: ["count", "description"],
                },
            },
            required: ["goodToss", "goodPronation", "goodFollowThrough"],
        },
        overallImpression: {
            type: Type.STRING,
            description: "A one or two-sentence overall impression of the practice session.",
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key strengths identified from the audio.",
        },
        areasForImprovement: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING },
                    drill: { type: Type.STRING },
                },
                required: ["point", "drill"],
            },
            description: "A list of 2-3 areas for improvement, each with a corresponding drill.",
        },
    },
    required: ["totalServes", "metrics", "overallImpression", "strengths", "areasForImprovement"],
};

export const analyzePracticeSession = async (base64AudioData: string, mimeType: string, userProfile?: UserProfile): Promise<PracticeAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64AudioData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: "Please analyze my tennis practice session from this audio recording and return the analysis in JSON format."
                    }
                ]
            },
            config: {
                systemInstruction: generateSessionAnalysisInstruction(userProfile),
                responseMimeType: "application/json",
                responseSchema: practiceAnalysisSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PracticeAnalysis;
    } catch (error) {
        console.error("Error analyzing audio with Gemini API:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};
