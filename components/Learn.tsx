import React, { useState, useEffect, useCallback } from 'react';
import { getCulturalFacts, generateImageForFact } from '../services/geminiService';
import { CulturalPost, UserRole } from '../types';
import Spinner from './Spinner';
import { SparklesIcon, HeartIcon, HeartSolidIcon, ShareIcon, TrashIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon } from './icons/HeroIcons';

interface LearnProps {
    userRole: UserRole;
}

const PostCard: React.FC<{ 
    post: CulturalPost; 
    isAdmin: boolean;
    isLiked: boolean;
    onLike: (id: string) => void;
    onShare: (text: string) => void;
    onDelete: (id: string) => void;
    onSave: (id: string, newText: string) => void;
}> = ({ post, isAdmin, isLiked, onLike, onShare, onDelete, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(post.text);

    const handleSave = () => {
        onSave(post.id, editedText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedText(post.text);
        setIsEditing(false);
    }
    
    const renderImage = () => {
        if (post.imageUrl && (post.imageUrl.startsWith('data:image') || post.imageUrl.startsWith('https://'))) {
            return <img src={post.imageUrl} alt="Cultural visualization" className="w-full h-56 object-cover" />;
        }
        
        let content;
        if (post.imageUrl === 'error') {
            content = <span className="text-red-500 text-sm px-2 text-center">Failed to generate image</span>;
        } else {
            content = (
                <div className="flex flex-col items-center">
                    <div className="border-4 border-dark-border/50 border-t-brand-primary rounded-full w-8 h-8 animate-spin"></div>
                    <span className="text-sm mt-2 text-medium-light-text dark:text-medium-text">Generating Image...</span>
                </div>
            );
        }

        return (
            <div className="w-full h-56 bg-light-border dark:bg-dark-border flex items-center justify-center">
                {content}
            </div>
        );
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-in group">
            {renderImage()}
            <div className="p-4 flex-grow">
                {isEditing ? (
                     <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full h-full p-2 bg-light-border dark:bg-dark-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                    />
                ) : (
                     <p className="text-dark-text dark:text-light-text leading-relaxed">{post.text}</p>
                )}
            </div>
            <div className="p-4 border-t border-light-border dark:border-dark-border/50 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={() => onLike(post.id)} className="flex items-center space-x-1 text-medium-light-text dark:text-medium-text hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:text-red-500">
                        {isLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
                        <span className="text-sm font-medium">{post.likes ?? 0}</span>
                    </button>
                    <button onClick={() => onShare(post.text)} className="flex items-center space-x-1 text-medium-light-text dark:text-medium-text hover:text-brand-primary transition-colors">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
                {isAdmin && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isEditing ? (
                            <>
                                <button onClick={handleSave} className="text-green-500"><CheckCircleIcon className="h-6 w-6" /></button>
                                <button onClick={handleCancel} className="text-red-500"><XMarkIcon className="h-6 w-6" /></button>
                            </>
                        ) : (
                             <>
                                <button onClick={() => setIsEditing(true)} className="text-medium-light-text dark:text-medium-text hover:text-brand-primary"><PencilSquareIcon className="h-5 w-5" /></button>
                                <button onClick={() => onDelete(post.id)} className="text-red-500"><TrashIcon className="h-5 w-5" /></button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const Learn: React.FC<LearnProps> = ({ userRole }) => {
    const [posts, setPosts] = useState<CulturalPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [showCopyToast, setShowCopyToast] = useState(false);
    const isAdmin = userRole === UserRole.ADMIN;

    useEffect(() => {
        try {
            const storedLikes = localStorage.getItem('likedCulturalPosts');
            setLikedPosts(storedLikes ? new Set(JSON.parse(storedLikes)) : new Set());
        } catch (e) {
            console.error("Failed to parse liked posts from localStorage", e);
            setLikedPosts(new Set());
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('likedCulturalPosts', JSON.stringify(Array.from(likedPosts)));
        } catch (e) {
            console.error("Failed to save liked posts to localStorage", e);
        }
    }, [likedPosts]);

    const fetchCulturalContent = useCallback(async (append = false) => {
        if (!append) {
            setIsLoading(true);
            setPosts([]);
        } else {
            setIsAdding(true);
        }
        setError(null);

        try {
            const facts = await getCulturalFacts();
            const newPostStubs: CulturalPost[] = facts.map((fact, index) => ({
                id: `fact-${Date.now()}-${index}`,
                text: fact,
                imageUrl: '', // Placeholder for loading state
                date: new Date().toISOString(),
                likes: Math.floor(Math.random() * 25), // Add some initial random likes for appearance
            }));

            setPosts(prev => append ? [...prev, ...newPostStubs] : newPostStubs);
            if (!append) setIsLoading(false);

            newPostStubs.forEach(async (postStub) => {
                try {
                    const imageUrl = await generateImageForFact(postStub.text);
                    setPosts(currentPosts =>
                        currentPosts.map(p => p.id === postStub.id ? { ...p, imageUrl } : p)
                    );
                } catch (imageError) {
                    console.error(`Failed to generate image for fact: "${postStub.text}"`, imageError);
                    setPosts(currentPosts =>
                        currentPosts.map(p => p.id === postStub.id ? { ...p, imageUrl: 'error' } : p)
                    );
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            if (!append) setIsLoading(false);
        } finally {
            if (append) setIsAdding(false);
        }
    }, []);

    useEffect(() => {
        fetchCulturalContent(false);
    }, [fetchCulturalContent]);

    const handleLike = (id: string) => {
        if (likedPosts.has(id)) return;
        setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
        setLikedPosts(prev => new Set(prev).add(id));
    };

    const handleShare = (text: string) => {
        navigator.clipboard.writeText(text);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    };

    const handleDelete = (id: string) => {
        setPosts(posts.filter(p => p.id !== id));
    };

     const handleSavePost = (id: string, newText: string) => {
        setPosts(posts.map(p => p.id === id ? { ...p, text: newText } : p));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Spinner />
                <p className="mt-4 text-medium-light-text dark:text-medium-text">Fetching cultural facts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 dark:text-red-400 bg-red-500/10 p-4 rounded-lg">
                <p className="font-semibold">Failed to load content</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-slide-in-up">
            <div className="text-center mb-12">
                <SparklesIcon className="mx-auto h-12 w-12 text-brand-accent" />
                <h1 className="text-4xl font-bold mt-4 mb-2">Discover Borneo's Culture</h1>
                <p className="text-lg text-medium-light-text dark:text-medium-text">
                    Explore interesting facts about the Dayak people, their languages, and traditions, visualized by AI.
                </p>
            </div>
            
            {posts.length > 0 ? (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post}
                                isAdmin={isAdmin}
                                isLiked={likedPosts.has(post.id)}
                                onLike={handleLike}
                                onShare={handleShare}
                                onDelete={handleDelete}
                                onSave={handleSavePost}
                            />
                        ))}
                    </div>
                     <div className="text-center mt-12">
                        <button 
                            onClick={() => fetchCulturalContent(true)}
                            disabled={isAdding}
                            className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-10 rounded-full hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center mx-auto"
                        >
                            {isAdding ? (
                                <>
                                    <div className="border-2 border-white/50 border-t-white rounded-full w-5 h-5 animate-spin"></div>
                                    <span className="ml-2">Generating...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                    <span>Generate More</span>
                                </>
                            )}
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center text-medium-light-text dark:text-medium-text mt-16">
                    <p>No cultural facts could be loaded at this time.</p>
                    <button onClick={() => fetchCulturalContent(false)} className="mt-4 text-brand-primary hover:underline">Try Again</button>
                </div>
            )}
            {showCopyToast && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in">
                    Fact copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default Learn;