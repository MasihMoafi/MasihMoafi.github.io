'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Crown, Zap, BookOpen } from 'lucide-react';
import MovingStars from '../components/MovingStars';

const heroes = [
  {
    id: 1,
    name: 'Napoleon Bonaparte',
    title: 'Emperor of the French',
    icon: Crown,
    quotes: [
      "Impossible is a word to be found only in the dictionary of fools.",
      "Victory belongs to the most persevering.",
      "A soldier will fight for a bit of colored ribbon.",
      "The battlefield is a scene of constant chaos. The winner will be the one who controls that chaos, both his own and the enemy's.",
      "Never interrupt your enemy when he is making a mistake."
    ],
    description: "Military genius who conquered most of Europe and created the Napoleonic Code that influenced legal systems worldwide."
  },
  {
    id: 2,
    name: 'Benjamin Franklin',
    title: 'Founding Father',
    icon: Zap,
    quotes: [
      "An investment in knowledge pays the best interest.",
      "Tell me and I forget, teach me and I may remember, involve me and I learn.",
      "Either write something worth reading or do something worth writing.",
      "By failing to prepare, you are preparing to fail.",
      "Energy and persistence conquer all things."
    ],
    description: "Polymath, inventor, diplomat, and one of America's founding fathers. Embodied the pursuit of knowledge and excellence."
  },
  {
    id: 3,
    name: 'Marcus Aurelius',
    title: 'Philosopher Emperor',
    icon: BookOpen,
    quotes: [
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
      "The best revenge is not to be like your enemy.",
      "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
      "Waste no more time arguing what a good man should be. Be one.",
      "The universe is change; our life is what our thoughts make it."
    ],
    description: "Roman Emperor and Stoic philosopher who led by example and left timeless wisdom in his 'Meditations'."
  }
];

export default function Heroes() {
  const [mounted, setMounted] = useState(false);
  const [selectedHero, setSelectedHero] = useState(heroes[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-orange-900">
      <MovingStars />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-8 left-8 z-50"
      >
        <Link
          href="/"
          className="group flex items-center space-x-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white hover:text-orange-200 transition-all duration-300 shadow-xl"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-semibold">Home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="fixed top-8 z-40 w-full flex justify-center"
      >
        <h1 className="text-2xl font-bold text-white bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">My Heroes</h1>
      </motion.div>

      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center min-h-screen">
            
            {/* Hero Selection */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-6 mb-12 relative z-10"
            >
              {heroes.map((hero) => {
                const IconComponent = hero.icon;
                return (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedHero(hero)}
                    className={`p-6 rounded-2xl backdrop-blur-lg border transition-all duration-300 ${
                      selectedHero.id === hero.id
                        ? 'bg-orange-500/20 border-orange-300/50 text-orange-200'
                        : 'bg-white/5 border-white/10 text-white hover:border-orange-300/30 hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-center">{hero.name.split(' ')[0]}</div>
                  </button>
                );
              })}
            </motion.div>

            {/* Selected Hero Display */}
            <motion.div
              key={selectedHero.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 relative z-10"
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {React.createElement(selectedHero.icon, { className: "w-16 h-16 text-orange-300" })}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedHero.name}</h2>
                <p className="text-orange-300 font-medium mb-4">{selectedHero.title}</p>
                <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">{selectedHero.description}</p>
              </div>

              {/* Quotes */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-300 text-center mb-6">Inspiring Quotes</h3>
                <div className="grid gap-4">
                  {selectedHero.quotes.map((quote, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                      <blockquote className="text-white text-lg leading-relaxed">
                        "{quote}"
                      </blockquote>
                      <cite className="text-orange-300 text-sm mt-2 block">— {selectedHero.name}</cite>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Success Motivation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mt-12 text-center relative z-10"
            >
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-300/30">
                <h3 className="text-2xl font-bold text-white mb-4">Going All-In on Success</h3>
                <p className="text-orange-200 text-lg leading-relaxed max-w-2xl mx-auto">
                  These extraordinary individuals didn't just dream of greatness—they pursued it relentlessly. 
                  Like them, I'm committed to excellence, learning from the best, and making my mark on the world.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}