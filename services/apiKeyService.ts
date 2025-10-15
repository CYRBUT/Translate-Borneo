export const getApiKey = (): string | null => {
    // This now only checks for an environment variable.
    // This is suitable for local development. On a deployed static site,
    // this will be undefined, allowing the app to fall back to a "no-API" mode.
    const envKey = process.env.API_KEY;
    if (envKey && envKey.trim() !== '' && envKey.trim() !== 'YOUR_GEMINI_API_KEY_HERE') {
        return envKey;
    }
    return null;
};

export const isApiKeySet = (): boolean => {
    const apiKey = getApiKey();
    return !!apiKey;
};
