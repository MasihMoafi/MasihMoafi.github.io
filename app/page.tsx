'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
// Using system fonts to avoid Google Fonts issues
import { useState, useRef, useEffect } from 'react';
import ModernNavbar from './components/ModernNavbar';
import MovingStars from './components/MovingStars';
import { useMusicContext } from './components/MusicProvider';
// Removed anime.js for now to fix build

// Using system fonts


export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'sunny' | 'gloomy'>('gloomy');
  const { audioRef, isMuted, setIsMuted, toggleMute, playMusic } = useMusicContext();
  const nameRef = useRef<HTMLHeadingElement>(null);
  const animationComplete = useRef(false);
  const [nameLetters, setNameLetters] = useState<string[]>([]);
  const name = "Masih Moafi";

  useEffect(() => {
    setMounted(true);

    // Split the name into individual letters with spaces preserved
    const letters = name.split('').map((letter) => letter);
    setNameLetters(letters);
  }, []);

  const handleThemeChange = (theme: 'sunny' | 'gloomy') => {
    setCurrentTheme(theme);
    // Don't change music on theme change
  };

  const getBackgroundStyle = () => {
    switch (currentTheme) {
      case 'sunny':
        return '#ffffff'; // White background for day
      case 'gloomy':
        return '#1f2937'; // Dark background for night
      default:
        return '#1f2937';
    }
  };

  const getTextColor = () => {
    return currentTheme === 'sunny' ? 'text-black' : 'text-white';
  };

  const getAccentColor = () => {
    return currentTheme === 'sunny' ? 'text-teal-600' : 'text-orange-300'; // Teal is opposite of orange
  };

  const getButtonClass = () => {
    return currentTheme === 'sunny' ? 'btn-primary-inverted' : 'btn-primary';
  };

  const getSecondaryButtonClass = () => {
    return currentTheme === 'sunny' ? 'btn-secondary-inverted' : 'btn-secondary';
  };


  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: getBackgroundStyle()}}>
      <ModernNavbar onThemeChange={handleThemeChange} currentTheme={currentTheme} />
      
      <MovingStars key={currentTheme} starColor={currentTheme === 'sunny' ? '#000000' : '#ffffff'} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-center"
        >
          <h1
            ref={nameRef}
            className={`text-6xl md:text-8xl lg:text-9xl font-bold leading-none mb-6 font-sans ${getTextColor()}`}
          >
            {nameLetters.map((letter, index) => (
              <span 
                key={index} 
                className={`letter ${letter === ' ' ? 'mr-2' : ''}`}
              >
                {letter}
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="space-y-4"
          >
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-sans font-light ${getTextColor()}`}>
              Welcome to my website where I showcase my{' '}
              <span className={`font-semibold ${getAccentColor()}`}>creativity</span>,{' '}
              <span className={`font-semibold ${getAccentColor()}`}>versatility</span> and{' '}
              <span className={`font-semibold ${getAccentColor()}`}>technical prowess</span>!
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
            >
              <motion.a
                href="/about"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,128,128,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className={getButtonClass()}
              >
                Learn More About Me
              </motion.a>
              
              <motion.a
                href="/projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={getSecondaryButtonClass()}
              >
                View My Work
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>

      <button
        onClick={toggleMute}
        className={`absolute bottom-8 left-8 z-20 p-2 rounded-full transition-colors ${
          currentTheme === 'sunny' 
            ? 'text-black bg-gray-200 hover:bg-gray-300' 
            : 'text-white bg-gray-700 hover:bg-gray-600'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

    </div>
  );
}
