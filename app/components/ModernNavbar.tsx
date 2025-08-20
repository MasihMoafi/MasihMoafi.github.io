'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, Home, User, Briefcase, Menu, X, BookOpen } from 'lucide-react';

interface ModernNavbarProps {
  onThemeChange: (theme: 'sunny' | 'gloomy') => void;
  currentTheme: 'sunny' | 'gloomy';
}

export default function ModernNavbar({ onThemeChange, currentTheme }: ModernNavbarProps) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const projectsMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      x: '100%',
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: User },
    { name: 'Blog', href: '/blog', icon: BookOpen },
  ];

  const projectItems = [
    { name: 'Architecture', href: '/architecture' },
    { name: 'Machine Learning', href: 'https://github.com/MasihMoafi?tab=repositories&q=&type=&language=&sort=name', external: true },
  ];

  const themeButtons = [
    { theme: 'sunny' as const, emoji: '☀️', label: 'Day' },
    { theme: 'gloomy' as const, emoji: '🌙', label: 'Night' },
  ];

  const getNavbarBg = () => {
    if (currentTheme === 'sunny') {
      return scrolled 
        ? 'bg-white/80 backdrop-blur-lg border-b border-black/10' 
        : 'bg-transparent';
    } else {
      return scrolled 
        ? 'bg-black/80 backdrop-blur-lg border-b border-white/10' 
        : 'bg-transparent';
    }
  };

  const getTextColor = () => {
    return currentTheme === 'sunny' ? 'text-black' : 'text-white';
  };

  const getTextColorSecondary = () => {
    return currentTheme === 'sunny' ? 'text-gray-700' : 'text-gray-300';
  };

  const getHoverColor = () => {
    return currentTheme === 'sunny' ? 'hover:text-black' : 'hover:text-white';
  };

  const getMenuBg = () => {
    return currentTheme === 'sunny' ? 'bg-white/90' : 'bg-black/90';
  };

  const getBorderColor = () => {
    return currentTheme === 'sunny' ? 'border-black/10' : 'border-white/10';
  };

  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavbarBg()}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Link href="/" className={`text-xl font-bold ${getTextColor()} hover:text-teal-400 transition-colors`}>
                Masih Moafi
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                  <Link 
                    href={item.href}
                    className={`flex items-center space-x-1 ${getTextColorSecondary()} ${getHoverColor()} transition-colors group`}
                  >
                    <item.icon className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className={`flex items-center space-x-1 ${getTextColorSecondary()} ${getHoverColor()} transition-colors group`}
                >
                  <Briefcase className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
                  <span>Projects</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isProjectsOpen && (
                    <motion.div
                      variants={projectsMenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className={`absolute top-full left-0 mt-2 w-64 ${getMenuBg()} backdrop-blur-lg border ${getBorderColor()} rounded-lg shadow-xl overflow-hidden`}
                      onMouseLeave={() => setIsProjectsOpen(false)}
                    >
                      {projectItems.map((item) => (
                        <motion.div
                          key={item.name}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          className="transition-colors"
                        >
                          {item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block px-4 py-3 ${getTextColorSecondary()} ${getHoverColor()} transition-colors`}
                            >
                              {item.name}
                              <span className="text-xs text-gray-500 ml-2">↗</span>
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              className={`block px-4 py-3 ${getTextColorSecondary()} ${getHoverColor()} transition-colors`}
                            >
                              {item.name}
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {themeButtons.map((theme) => (
                <motion.button
                  key={theme.theme}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onThemeChange(theme.theme)}
                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200"
                  title={theme.label}
                >
                  <span className="text-lg">{theme.emoji}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`fixed inset-0 ${currentTheme === 'sunny' ? 'bg-white/95' : 'bg-black/95'} backdrop-blur-lg z-[60] md:hidden`}
          >
            <div className="flex flex-col h-full">
              <div className={`flex items-center justify-between p-6 border-b ${getBorderColor()}`}>
                <span className={`text-xl font-bold ${getTextColor()}`}>Menu</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${getTextColor()} p-2`}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="flex-1 px-6 py-8 space-y-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 ${getTextColorSecondary()} ${getHoverColor()} transition-colors text-lg`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className={`flex items-center space-x-3 ${getTextColorSecondary()} text-lg`}>
                    <Briefcase className="w-5 h-5" />
                    <span>Projects</span>
                  </div>
                  <div className="pl-8 space-y-3">
                    {projectItems.map((item) => (
                      <div key={item.name}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block ${currentTheme === 'sunny' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'} transition-colors`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name} ↗
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className={`block ${currentTheme === 'sunny' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'} transition-colors`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <span className={`${getTextColorSecondary()} text-lg`}>Themes</span>
                  <div className="flex space-x-4">
                    {themeButtons.map((theme) => (
                      <button
                        key={theme.theme}
                        onClick={() => {
                          onThemeChange(theme.theme);
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200"
                        title={theme.label}
                      >
                        <span className="text-xl">{theme.emoji}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}