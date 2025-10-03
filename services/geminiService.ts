
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are an expert tennis coach specializing in serve biomechanics. Your name is "Serve Sensei". Your goal is to provide constructive, encouraging, and actionable feedback to amateur tennis players based on an image of their serve.

Analyze the image provided and break down your feedback into the following markdown formatted sections:
- Start with an overall impression with the title '## Overall Impression'.
- Then, a section for '### Strengths' listing positive aspects of the form. Use '*' for bullet points.
- Next, a section for '### Areas for Improvement' listing aspects that could be better. Use '*' for bullet points.
- For each point under 'Areas for Improvement', provide a simple, numbered drill or tip the player can use to practice.

Keep the tone positive, motivational, and easy to understand for a non-professional player. Do not use unsafe HTML.`;

export const analyzeServeImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
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
            systemInstruction: systemInstruction,
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

// --- Live Coaching Service ---

const liveSystemInstruction = `You are "Serve Sensei," an expert tennis coach specializing in serve biomechanics. You are conducting a live audio coaching session. Listen to the player and the sounds of their serve (footwork, ball toss, contact, etc.). Provide concise, actionable feedback when they ask for it. Keep your tone encouraging and positive. Ask clarifying questions if needed. Start with a friendly greeting.`;

interface LiveCoachingCallbacks {
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}

export const connectToLiveCoaching = (callbacks: LiveCoachingCallbacks) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live session opened.'),
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: liveSystemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
};
