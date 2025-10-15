import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

let ai: GoogleGenAI | null = null;

// Initializes the GoogleGenAI client
const initializeAi = () => {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        console.log("Gemini AI client initialized successfully.");
    } else {
        ai = null;
        console.error("API Key not found. Please set the API_KEY environment variable.");
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

export const translateText = async (
    text: string,
    from: Language,
    to: Language
): Promise<string> => {
    if (!ai) {
        throw new Error("API Key not configured. Please set the API_KEY environment variable.");
    }

    const dictionary = getCustomDictionary();
    const dictKey = `${from}-${to}`;
    const cleanedText = text.toLowerCase().trim();

    if (dictionary[dictKey] && dictionary[dictKey][cleanedText]) {
        console.log("Translation found in custom dictionary.");
        return dictionary[dictKey][cleanedText];
    }
    
    const model = 'gemini-2.5-flash';
    const prompt = `Translate the following text from ${from} to ${to}. Provide only the translation, without any extra explanation or context. Text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        const translation = response.text.trim();
        return translation;
    } catch (error) {
        console.error("Error translating text with Gemini API:", error);
        throw new Error("Failed to get translation. Please check your API key and network connection.");
    }
};

export const moderateContent = async (text: string): Promise<boolean> => {
    if (!ai) {
        console.warn("API Key not configured. Moderation check skipped.");
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
    if (!ai) {
        throw new Error("API Key not configured.");
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

export const getCulturalFacts = async (): Promise<string[]> => {
    if (!ai) {
         throw new Error("API Key not configured. Please add your Gemini API key to check this feature.");
    }
    const model = 'gemini-2.5-flash';
    const prompt = `
        Generate 3 brief, interesting, and distinct cultural facts about the Dayak people of Borneo, particularly related to their languages (Ngaju, Bakumpai) or traditions.
        Present each fact as a short, self-contained paragraph.
        Separate each fact with "|||".
        Do not include titles or numbering.
        Example: The Ngaju concept of 'Huma Betang' is a longhouse philosophy...|||Bakumpai people, living along rivers...|||The 'Tiwah' ceremony is a complex secondary funeral rite...
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        const factsText = response.text.trim();
        return factsText.split('|||').map(fact => fact.trim()).filter(fact => fact.length > 0);
    } catch (error) {
        console.error("Error fetching cultural facts:", error);
        throw new Error("Could not fetch cultural facts. Check your API key.");
    }
};