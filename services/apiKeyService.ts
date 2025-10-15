export const isApiKeySet = (): boolean => {
    const apiKey = process.env.API_KEY;
    return !!apiKey && apiKey.trim() !== '' && apiKey.trim() !== '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';
};
