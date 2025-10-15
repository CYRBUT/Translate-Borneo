import React from 'react';
import { KeyIcon } from './icons/HeroIcons';

const ApiKeyModal: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg flex items-center justify-center z-[100] font-sans">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 m-4 w-full max-w-lg text-center animate-fade-in border border-light-border dark:border-dark-border">
                <KeyIcon className="mx-auto h-12 w-12 text-yellow-500" />
                <h2 className="text-2xl font-bold mt-4 mb-2 text-dark-text dark:text-light-text">
                    Google Gemini API Key is Missing
                </h2>
                <p className="text-medium-light-text dark:text-medium-text mb-6">
                    This application requires a Google Gemini API key to function. Please set it up as an environment variable named <strong>API_KEY</strong>.
                </p>
                <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg mb-6 text-left">
                    <p className="font-mono text-sm break-all text-medium-light-text dark:text-medium-text">
                       API_KEY=your_api_key_here
                    </p>
                </div>
                <p className="text-sm text-medium-light-text dark:text-medium-text mb-6">
                    For local development, create a <code className="bg-light-border dark:bg-dark-border px-1 py-0.5 rounded">.env</code> file in the project root. Refer to the <strong>README.md</strong> file for detailed instructions. After setting the key, please restart your development server.
                </p>
                <a 
                    href="https://ai.google.dev/aistudio" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    Get an API Key
                </a>
            </div>
        </div>
    );
};

export default ApiKeyModal;
