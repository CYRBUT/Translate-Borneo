import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Language, TranslationHistoryItem, TextAnalysis } from '../types';
import { translateTextStream, generateTextToSpeech, analyzeText } from '../services/geminiService';
import { ArrowsRightLeftIcon, DocumentDuplicateIcon, SpeakerWaveIcon, TrashIcon, ClockIcon, SparklesIcon, XCircleIcon, MicrophoneIcon } from './icons/HeroIcons';
import Spinner from './Spinner';
import LanguageSelector from './LanguageSelector';
import { LANGUAGE_OPTIONS } from '../constants';

// Browser compatibility check for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
}

const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Translator: React.FC = () => {
    const [fromLang, setFromLang] = useState<Language>(Language.INDONESIAN);
    const [toLang, setToLang] = useState<Language>(Language.BAKUMPAI);
    const [inputText, setInputText] = useState<string>('');
    const [debouncedInputText, setDebouncedInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<'input' | 'output' | null>(null);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
    
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('translationHistory');
            setHistory(storedHistory ? JSON.parse(storedHistory) : []);
        } catch (e) {
            setHistory([]);
        }
    }, []);

    // Debounce effect for inputText
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInputText(inputText);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [inputText]);
    
    // Streaming translation effect
    useEffect(() => {
        if (!debouncedInputText.trim()) {
            setOutputText('');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputText('');
        setAnalysis(null);

        let isCancelled = false;
        let finalTranslation = '';
        
        translateTextStream(
            debouncedInputText,
            fromLang,
            toLang,
            (chunk) => { // onUpdate
                if (!isCancelled) {
                    setOutputText(prev => prev + chunk);
                }
            },
            (fullText) => { // onComplete
                if(!isCancelled){
                    finalTranslation = fullText;
                    setIsLoading(false);
                    addToHistory({ from: fromLang, to: toLang, inputText: debouncedInputText, outputText: finalTranslation });
                }
            },
            (err) => { // onError
                if(!isCancelled) {
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        );
        
        return () => {
            isCancelled = true;
        };

    }, [debouncedInputText, fromLang, toLang]);


    const addToHistory = (item: Omit<TranslationHistoryItem, 'id' | 'date'>) => {
        setHistory(prev => {
            const newHistory = [
                { ...item, id: `hist-${Date.now()}`, date: new Date().toISOString() }, 
                ...prev
            ].slice(0, 20); // Keep last 20 translations
            localStorage.setItem('translationHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const handleAnalyze = async () => {
        if (!inputText.trim() || isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysis(null);
        try {
            const result = await analyzeText(inputText);
            setAnalysis(result);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSwapLanguages = useCallback(() => {
        setFromLang(toLang);
        setToLang(fromLang);
        setInputText(outputText);
        setOutputText(inputText);
        setAnalysis(null);
    }, [fromLang, toLang, inputText, outputText]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    };

    const handleTextToSpeech = async (text: string, type: 'input' | 'output') => {
        if (!text || isSpeaking) return;

        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            } catch (e) {
                console.error("Could not create AudioContext:", e);
                setError("Audio playback is not supported on this browser.");
                return;
            }
        }
        
        const audioContext = audioContextRef.current;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        setIsSpeaking(type);
        try {
            const base64Audio = await generateTextToSpeech(text);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => setIsSpeaking(null);
        } catch (e) {
            console.error("TTS Error:", e);
            setError("Failed to play audio.");
            setIsSpeaking(null);
        }
    };

    const handleListen = () => {
        if (!recognition) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };
        recognition.start();
    };
    
    const useHistoryItem = (item: TranslationHistoryItem) => {
        setFromLang(item.from);
        setToLang(item.to);
        setInputText(item.inputText);
        setOutputText(item.outputText);
        setAnalysis(null);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('translationHistory');
    }

    useEffect(() => {
        if (fromLang === toLang) {
            const otherLang = LANGUAGE_OPTIONS.find(l => l !== fromLang) || Language.INDONESIAN;
            setToLang(otherLang);
        }
    }, [fromLang, toLang]);

    return (
        <div className="animate-slide-in-up grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 items-center mb-6">
                    <div className="md:col-span-2">
                        <LanguageSelector selectedLanguage={fromLang} onLanguageChange={setFromLang} id="from-lang"/>
                    </div>
                    <div className="flex justify-center">
                        <button onClick={handleSwapLanguages} className="p-2 rounded-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-transform duration-300 hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            <ArrowsRightLeftIcon />
                        </button>
                    </div>
                     <div className="md:col-span-2">
                        <LanguageSelector selectedLanguage={toLang} onLanguageChange={setToLang} id="to-lang"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="relative group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Enter text in ${fromLang}...`}
                            className="w-full h-64 p-4 pr-10 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-300"
                        />
                        {inputText && (
                             <button onClick={() => setInputText('')} className="absolute top-3 right-3 text-medium-light-text dark:text-medium-text hover:text-dark-text dark:hover:text-light-text transition-colors opacity-0 group-hover:opacity-100">
                                <XCircleIcon />
                            </button>
                        )}
                        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                           {recognition && (
                                <button onClick={handleListen} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-dark-border/10 dark:bg-dark-border/50 hover:bg-dark-border/20 dark:hover:bg-dark-border'}`}>
                                    <MicrophoneIcon />
                                </button>
                           )}
                        </div>
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                            <span className="text-xs text-medium-light-text dark:text-medium-text">{inputText.length} / 5000</span>
                            <button onClick={() => handleTextToSpeech(inputText, 'input')} disabled={!inputText || !!isSpeaking} className="p-2 rounded-full bg-dark-border/10 dark:bg-dark-border/50 hover:bg-dark-border/20 dark:hover:bg-dark-border transition-colors disabled:opacity-50">
                                {isSpeaking === 'input' ? <Spinner /> : <SpeakerWaveIcon />}
                            </button>
                            <button onClick={() => copyToClipboard(inputText)} disabled={!inputText} className="p-2 rounded-full bg-dark-border/10 dark:bg-dark-border/50 hover:bg-dark-border/20 dark:hover:bg-dark-border transition-colors disabled:opacity-50">
                                <DocumentDuplicateIcon />
                            </button>
                        </div>
                    </div>
                     <div className="relative bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4 h-64 overflow-y-auto">
                        {isLoading && !outputText ? (
                            <div className="flex justify-center items-center h-full">
                                <Spinner />
                            </div>
                        ) : error ? (
                            <div className="text-red-500 dark:text-red-400">{error}</div>
                        ) : (
                            <p className="whitespace-pre-wrap">{outputText}{isLoading && <span className="inline-block w-2 h-4 bg-brand-primary animate-pulse ml-1"></span>}</p>
                        )}
                        {!isLoading && outputText && (
                             <div className="absolute bottom-3 right-3 flex space-x-2">
                                <button onClick={() => handleTextToSpeech(outputText, 'output')} disabled={!outputText || !!isSpeaking} className="p-2 rounded-full bg-dark-border/10 dark:bg-dark-border/50 hover:bg-dark-border/20 dark:hover:bg-dark-border transition-colors disabled:opacity-50">
                                    {isSpeaking === 'output' ? <Spinner /> : <SpeakerWaveIcon />}
                                </button>
                                <button onClick={() => copyToClipboard(outputText)} className="p-2 rounded-full bg-dark-border/10 dark:bg-dark-border/50 hover:bg-dark-border/20 dark:hover:bg-dark-border transition-colors">
                                    <DocumentDuplicateIcon />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-center items-center gap-4">
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || !inputText}
                        className="flex items-center gap-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-bold py-3 px-6 rounded-full hover:scale-105 hover:border-brand-accent transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="text-brand-accent"/>
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {(analysis || analysisError) && (
                     <div className="mt-6 p-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg animate-fade-in">
                        <h4 className="font-semibold text-lg mb-2">Text Analysis</h4>
                        {analysisError ? (
                             <p className="text-red-500 dark:text-red-400">{analysisError}</p>
                        ): analysis && (
                            <div className="space-y-2 text-sm">
                                <p><strong>Tone:</strong> <span className="bg-brand-primary/10 text-brand-primary font-medium py-0.5 px-2 rounded-full">{analysis.tone}</span></p>
                                <p><strong>Summary:</strong> {analysis.summary}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <div className="lg:col-span-1 bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <ClockIcon />
                        <h3 className="text-lg font-semibold ml-2">History</h3>
                    </div>
                    <button onClick={clearHistory} className="text-sm text-red-500 hover:underline disabled:opacity-50" disabled={history.length === 0}>
                        Clear
                    </button>
                </div>
                <ul className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                    {history.length > 0 ? history.map((item) => (
                        <li key={item.id} onClick={() => useHistoryItem(item)} className="cursor-pointer bg-light-bg dark:bg-dark-bg p-3 rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                            <p className="font-semibold text-sm truncate">{item.inputText}</p>
                            <p className="text-xs text-medium-light-text dark:text-medium-text">{item.from} → {item.to}</p>
                        </li>
                    )) : <p className="text-medium-light-text dark:text-medium-text text-sm text-center mt-4">Your translation history will appear here.</p>}
                </ul>
            </div>
            {showCopyToast && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in">
                    Copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default Translator;