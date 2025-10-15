import React from 'react';
import { KeyIcon } from './icons/HeroIcons';

const ApiKeyModal: React.FC = () => {
    // This component is now informational to align with security best practices
    // of not handling API keys in the frontend. It instructs developers on how to
    // set up their environment for local development.

    return (
        <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg flex items-center justify-center z-[100] font-sans">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 m-4 w-full max-w-lg text-center animate-fade-in border border-light-border dark:border-dark-border">
                <KeyIcon className="mx-auto h-12 w-12 text-yellow-500" />
                <h2 className="text-2xl font-bold mt-4 mb-2 text-dark-text dark:text-light-text">
                    Google Gemini API Key Required
                </h2>
                <p className="text-medium-light-text dark:text-medium-text mb-6">
                    This application requires a Google Gemini API key to function. Please configure the <code>API_KEY</code> environment variable for local development and restart the application.
                </p>
                <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg text-left font-mono text-sm mb-6 text-dark-text dark:text-light-text">
                    <p className="text-gray-500 dark:text-gray-400"># In your .env.local file or terminal environment:</p>
                    <p>
                        <span className="text-purple-600 dark:text-purple-400">API_KEY</span>=
                        <span className="text-red-600 dark:text-red-400">"your-gemini-api-key-here"</span>
                    </p>
                </div>
                <a
                    href="https://ai.google.dev/aistudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary hover:underline"
                >
                    Get a Gemini API Key from Google AI Studio
                </a>
            </div>
        </div>
    );
};

export default ApiKeyModal;
