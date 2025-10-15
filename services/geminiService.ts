import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Language, TextAnalysis } from "../types";
import { getApiKey, isApiKeySet } from './apiKeyService';
import { MOCK_CULTURAL_FACTS, MOCK_CULTURAL_IMAGES } from "../constants";

let ai: GoogleGenAI | null = null;

// Initializes the GoogleGenAI client if an API key is available
const initializeAi = () => {
    const apiKey = getApiKey();
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        console.log("Gemini AI client initialized successfully for local development.");
    } else {
        ai = null;
        console.log("No API Key found. Running in static data mode.");
    }
};

// Initial call to set up the client on load
initializeAi();

const CUSTOM_DICTIONARY_KEY = 'customDictionary';

type Dictionary = {
    [key: string]: { [key: string]: string };
};

// Function to get the custom dictionary from localStorage
const getCustomDictionary = (): Dictionary => {
    try {
        const storedDict = localStorage.getItem(CUSTOM_DICTIONARY_KEY);
        return storedDict ? JSON.parse(storedDict) : {};
    } catch (error) {
        console.error("Failed to parse custom dictionary from localStorage", error);
        return {};
    }
};

// Function to update the custom dictionary in localStorage
export const updateCustomDictionary = (from: Language, to: Language, text: string, translation: string) => {
    const dictionary = getCustomDictionary();
    const key = `${from}-${to}`;
    if (!dictionary[key]) {
        dictionary[key] = {};
    }
    dictionary[key][text.toLowerCase().trim()] = translation;
    
    try {
        localStorage.setItem(CUSTOM_DICTIONARY_KEY, JSON.stringify(dictionary));
    } catch (error) {
        console.error("Failed to save custom dictionary to localStorage", error);
    }
};

export const translateTextStream = async (
    text: string,
    from: Language,
    to: Language,
    onUpdate: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: Error) => void
) => {
    if (!isApiKeySet() || !ai) {
        const demoText = `[This is a demo translation from ${from} to ${to}. The full feature requires a Gemini API key for local development.]`;
        let streamedText = '';
        const interval = setInterval(() => {
            if (streamedText.length < demoText.length) {
                const nextChar = demoText[streamedText.length];
                streamedText += nextChar;
                onUpdate(nextChar);
            } else {
                clearInterval(interval);
                onComplete(streamedText);
            }
        }, 50);
        return;
    }

    const dictionary = getCustomDictionary();
    const dictKey = `${from}-${to}`;
    const cleanedText = text.toLowerCase().trim();

    if (dictionary[dictKey] && dictionary[dictKey][cleanedText]) {
        console.log("Translation found in custom dictionary.");
        onUpdate(dictionary[dictKey][cleanedText]);
        onComplete(dictionary[dictKey][cleanedText]);
        return;
    }
    
    const model = 'gemini-2.5-flash';
    const prompt = `Translate the following text from ${from} to ${to}. Provide only the translation, without any extra explanation or context. Text: "${text}"`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        let fullText = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if(chunkText) {
                fullText += chunkText;
                onUpdate(chunkText);
            }
        }
        onComplete(fullText);

    } catch (error) {
        console.error("Error translating text with Gemini API:", error);
        const err = new Error("Failed to get translation. Please check your API key and network connection.");
        onError(err);
    }
};

export const analyzeText = async (text: string): Promise<TextAnalysis> => {
    if (!isApiKeySet() || !ai) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            tone: "N/A",
            summary: "Text analysis requires an API key for local development."
        };
    }
    const model = 'gemini-2.5-flash';
    const prompt = `Analyze the following text. Determine its primary tone and provide a concise one-sentence summary. Text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tone: { type: Type.STRING, description: 'The primary tone of the text (e.g., Formal, Informal, Joyful, Serious).' },
                        summary: { type: Type.STRING, description: 'A concise one-sentence summary of the text.' }
                    }
                }
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as TextAnalysis;
    } catch (error) {
        console.error("Error analyzing text with Gemini API:", error);
        throw new Error("Failed to analyze text.");
    }
};

export const getCulturalFacts = async (): Promise<string[]> => {
    if (!isApiKeySet() || !ai) {
        // Return a random subset of mock facts for static mode
        const shuffled = MOCK_CULTURAL_FACTS.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3); // Return 3 random facts
    }

    const model = 'gemini-2.5-flash';
    const prompt = `Provide 3 interesting and concise cultural facts about the Dayak people, the Bakumpai language, or the Ngaju language of Borneo. Return the facts as a JSON array of strings.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as string[];
    } catch (error) {
        console.error("Error generating cultural facts:", error);
        // Fallback to mock data on API error
        const shuffled = MOCK_CULTURAL_FACTS.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
};

export const generateImageForFact = async (fact: string): Promise<string> => {
    if (!isApiKeySet() || !ai) {
        // Simulate network delay and return a random mock image in static mode
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        return MOCK_CULTURAL_IMAGES[Math.floor(Math.random() * MOCK_CULTURAL_IMAGES.length)];
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `An artistic and culturally relevant visualization of the following fact about Borneo: "${fact}"` }]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        // Fallback if API returns no image
        return MOCK_CULTURAL_IMAGES[Math.floor(Math.random() * MOCK_CULTURAL_IMAGES.length)];
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        // Fallback to a mock image on API error too
        return MOCK_CULTURAL_IMAGES[Math.floor(Math.random() * MOCK_CULTURAL_IMAGES.length)];
    }
};


export const moderateContent = async (text: string): Promise<boolean> => {
    if (!isApiKeySet() || !ai) {
        console.warn("API Key not set. Moderation check skipped. Content is allowed by default.");
        return true; 
    }

    const model = 'gemini-2.5-flash';
    const prompt = `
        Analyze the following text for sensitive content. Categories to check for include hate speech, harassment, violence, self-harm, sexually explicit content, and dangerous goods.
        Respond with only a single word: "SAFE" if the text is not sensitive in any of these categories, or "UNSAFE" if it is. Do not provide any explanation.

        Text: "${text}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const result = response.text.trim().toUpperCase();
        return result === 'SAFE';

    } catch (error) {
        console.error("Error moderating content with Gemini API:", error);
        return true;
    }
};

export const generateTextToSpeech = async (text: string): Promise<string> => {
    if (!isApiKeySet() || !ai) {
        throw new Error("Text-to-Speech requires an API key for local development.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A suitable voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech with Gemini API:", error);
        throw new Error("Failed to generate speech.");
    }
};