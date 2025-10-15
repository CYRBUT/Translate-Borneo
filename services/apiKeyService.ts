export const isApiKeySet = (): boolean => {
    const apiKey = process.env.API_KEY;
    return !!apiKey && apiKey.trim() !== '' && apiKey.trim() !== 'YOUR_GEMINI_API_KEY_HERE';
};
