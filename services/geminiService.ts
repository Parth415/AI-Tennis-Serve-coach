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
  if (userProfile && (userProfile.name || userProfile.age || userProfile.skillLevel || userProfile.playingHand)) {
    userContext = userProfile.name ? `${userProfile.name}` : "A player";
    if (userProfile.age) {
      userContext += `, a ${userProfile.age}-year-old`;
    }
    if (userProfile.skillLevel) {
      userContext += ` ${userProfile.skillLevel} player`;
    }
    if (userProfile.playingHand) {
      userContext += ` who is ${userProfile.playingHand.toLowerCase()}-handed`;
    }
  }

  if(userProfile?.preferredCourtSurface) {
    userContext += `, prefers playing on ${userProfile.preferredCourtSurface} courts`;
  }
  if(userProfile?.racquetType) {
    userContext += `, and uses a ${userProfile.racquetType} racquet`;
  }

  let goalsContext = "";
  if (userProfile?.serveGoals && userProfile.serveGoals.length > 0) {
    goalsContext = `Their primary goals are to: ${userProfile.serveGoals.join(', ')}.`;
  }

  return `You are an expert tennis coach specializing in serve biomechanics. Your name is "Serve Sensei". Your goal is to provide constructive, encouraging, and actionable feedback to ${userContext} based on an image of their serve. ${goalsContext}

  Crucially, if the user has provided goals, tailor your advice to help them achieve them. For example, if their goal is 'increase serve speed', focus on kinetic chain and leg drive. If it's to 'improve slice serve', focus on the grip and ball toss placement.

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
  
  let goalsContext = "";
  if (userProfile?.serveGoals && userProfile.serveGoals.length > 0) {
    goalsContext = `The player's primary goals are: ${userProfile.serveGoals.join(', ')}. When providing your qualitative summary and drills, keep these goals in mind.`;
  }
  
  return `You are "Serve Sensei", an expert tennis coach specializing in biomechanics. You will be given an audio recording and a sequence of video frames from ${userContext} practice session.
  Your task is to analyze the full motion of the serve from the images, using the audio to help assess rhythm and impact quality.

  1.  **Count the total number of serves** you can distinguish in the audio.
  2.  **Analyze the biomechanics** of the serve across the key phases shown in the video frames. For each phase, provide a score from 1-10 (10 being perfect), one key positive observation, one main area for improvement, and a specific drill to address it.
      *   **Stance & Setup:** Look for balance, foot position, and a relaxed grip.
      *   **Toss & Wind-up:** Evaluate toss consistency (height and placement), and the coordination of the toss arm and hitting arm.
      *   **Trophy Pose:** Assess arm position (hitting elbow up, tossing arm pointing to the ball), knee bend, and racquet angle.
      *   **Contact & Pronation:** Use the sound of impact to judge quality. Look for a high contact point, full extension, and evidence of forearm pronation.
      *   **Follow-Through:** Check for a loose, fluid motion across the body to ensure proper deceleration and prevent injury.
  3.  **Provide an overall impression** that summarizes the session.

  Based on your analysis, return a JSON object that adheres to the provided schema. Do not return markdown or any other format.`;
}

const servePhaseSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "A score from 1-10 for this phase." },
        positive: { type: Type.STRING, description: "One key positive observation for this phase." },
        improvement: { type: Type.STRING, description: "The single most important area for improvement." },
        drill: { type: Type.STRING, description: "A specific, actionable drill to address the improvement area." },
    },
    required: ["score", "positive", "improvement", "drill"],
};

const practiceAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        totalServes: {
            type: Type.INTEGER,
            description: "The total number of serves detected in the audio recording.",
        },
        overallImpression: {
            type: Type.STRING,
            description: "A one or two-sentence overall impression of the practice session.",
        },
        stanceAndSetup: servePhaseSchema,
        tossAndWindup: servePhaseSchema,
        trophyPose: servePhaseSchema,
        contactAndPronation: servePhaseSchema,
        followThrough: servePhaseSchema,
    },
    required: ["totalServes", "overallImpression", "stanceAndSetup", "tossAndWindup", "trophyPose", "contactAndPronation", "followThrough"],
};

export const analyzePracticeSession = async (
    base64AudioData: string, 
    audioMimeType: string, 
    base64Frames: { mimeType: string; data: string }[],
    userProfile?: UserProfile
): Promise<PracticeAnalysis> => {
    try {
        const contentParts = [
            { inlineData: { data: base64AudioData, mimeType: audioMimeType } },
            ...base64Frames.map(frame => ({ inlineData: frame })),
            { text: "Please analyze my tennis practice session from this audio recording and these video frames, and return the analysis in JSON format." }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: contentParts,
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
