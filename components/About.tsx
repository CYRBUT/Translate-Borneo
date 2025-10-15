import React from 'react';
import { SOCIAL_LINKS } from '../constants';
import { InstagramIcon, TelegramIcon, TikTokIcon, GitHubIcon } from './icons/SocialIcons';

const About: React.FC = () => {
    const WEBSITE_VERSION = '1.2.0'; // Versi situs web saat ini

    return (
        <div className="flex flex-col items-center justify-center animate-fade-in py-10">
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-500 hover:scale-105">
                <div className="text-center">
                    <img
                        src="https://i.pravatar.cc/150?u=admin"
                        alt="Profil"
                        className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-brand-primary shadow-lg"
                    />
                    <h1 className="text-3xl font-bold text-dark-text dark:text-light-text mb-2">
                        Admin Borneo
                    </h1>
                    <p className="text-medium-light-text dark:text-medium-text mb-6">
                        Language Enthusiast & Cultural Advocate
                    </p>
                    <div className="flex justify-center space-x-8 mb-8">
                        <a 
                            href={SOCIAL_LINKS.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-medium-text hover:text-[#E1306C] transition-colors duration-300 transform hover:scale-125"
                            aria-label="Instagram Profile"
                        >
                            <InstagramIcon className="h-8 w-8" />
                        </a>
                        <a 
                            href={SOCIAL_LINKS.telegram} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-medium-text hover:text-[#0088CC] transition-colors duration-300 transform hover:scale-125"
                            aria-label="Telegram Profile"
                        >
                            <TelegramIcon className="h-8 w-8" />
                        </a>
                        <a 
                            href={SOCIAL_LINKS.tiktok} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-medium-text hover:text-brand-accent transition-colors duration-300 transform hover:scale-125"
                            aria-label="TikTok Profile"
                        >
                            <TikTokIcon className="h-8 w-8" />
                        </a>
                        <a 
                            href={SOCIAL_LINKS.github} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-medium-text hover:text-dark-text dark:hover:text-light-text transition-colors duration-300 transform hover:scale-125"
                            aria-label="GitHub Profile"
                        >
                            <GitHubIcon className="h-8 w-8" />
                        </a>
                    </div>
                </div>

                <hr className="border-light-border dark:border-dark-border my-6" />

                <div className="text-left">
                    <h2 className="text-xl font-semibold mb-3 text-dark-text dark:text-light-text">Tentang Saya</h2>
                    <p className="text-medium-light-text dark:text-medium-text leading-relaxed">
                        Saya adalah seorang pengembang dan pegiat budaya dengan hasrat untuk melestarikan warisan linguistik Indonesia. Proyek Borneo ini adalah wujud cinta saya terhadap kekayaan bahasa daerah, dengan harapan teknologi dapat menjadi jembatan untuk memperkenalkan dan menjaga kelestariannya bagi generasi mendatang.
                    </p>
                </div>

                <div className="text-center mt-8">
                    <p className="text-xs text-medium-light-text dark:text-medium-text tracking-wider">
                        Versi Website: {WEBSITE_VERSION}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
