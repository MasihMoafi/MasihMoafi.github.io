'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Architecture() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 16;
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Disable scrolling on the page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle full screen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && imageContainerRef.current) {
      imageContainerRef.current.requestFullscreen();
      setIsFullScreen(true);
      imageContainerRef.current.focus();
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Handle keydown events on image container when in full-screen mode
  useEffect(() => {
    if (isFullScreen && imageContainerRef.current) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (currentPage > 0) setCurrentPage(currentPage - 1);
        }
      };
      imageContainerRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        if (imageContainerRef.current) {
          imageContainerRef.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [isFullScreen, currentPage, totalPages]);

  // Adjust padding for full screen mode
  useEffect(() => {
    if (imageContainerRef.current) {
      if (isFullScreen) {
        imageContainerRef.current.style.paddingLeft = '0';
      } else {
        imageContainerRef.current.style.paddingLeft = isSidebarMinimized ? '4rem' : '16rem';
      }
    }
  }, [isFullScreen, isSidebarMinimized]);

  // Ensure navigation bar is displayed correctly after exiting full screen mode
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Navigation handlers
  const handleNextPage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Zoom handlers
  const handleZoom = (event: React.MouseEvent<HTMLDivElement>) => {
    const image = imageRef.current;
    if (image) {
      if (isZoomed) {
        image.style.transform = 'scale(1.05)';
      } else {
        const { left, top, width, height } = image.getBoundingClientRect();
        const x = ((event.clientX - left) / width) * 100;
        const y = ((event.clientY - top) / height) * 100;
        image.style.transformOrigin = `${x}% ${y}%`;
        image.style.transform = 'scale(2.5)';
      }
      setIsZoomed(!isZoomed);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed && imageRef.current) {
      const { left, top, width, height } = imageRef.current.getBoundingClientRect();
      const x = ((event.clientX - left) / width) * 100;
      const y = ((event.clientY - top) / height) * 100;
      imageRef.current.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  // Table of Contents items
  const tableOfContentsItems = [
    { name: 'Front Cover', page: 0 },
    { name: 'CV', page: 1 },
    { name: 'Table of Contents', page: 2 },
    { name: 'Harmony Haven', page: 3 },
    { name: 'La Dolce Villa', page: 4 },
    { name: 'Feel Gallery', page: 5 },
    { name: 'CPU, Cultural Center', page: 6 },
    { name: 'Cinema, Library', page: 7 },
    { name: 'Sonography Clinic', page: 8 },
    { name: 'Architectural Visualizations', page: 9 },
    { name: 'Sketches', page: 10 },
    { name: 'Paintings', page: 12 },
    { name: 'Back Cover', page: 15 },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gray-900">
      {/* Table of Contents Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full ${isFullScreen ? 'w-0' : isSidebarMinimized ? 'w-12' : 'w-64'} bg-gray-800 p-4 z-30 overflow-y-auto transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="text-white text-xl font-bold mb-4 w-full flex justify-center"
        >
          {isSidebarMinimized ? '☰' : '✕'}
        </button>
        {!isSidebarMinimized && (
          <>
            <h2 className="text-white text-xl font-bold mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              {tableOfContentsItems.map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full text-left text-white p-2 rounded ${currentPage === item.page ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Portfolio Image */}
      <motion.div
        ref={imageContainerRef}
        tabIndex={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`relative w-full h-full flex justify-center items-center ${isFullScreen ? 'pl-0 pt-0' : isSidebarMinimized ? 'pl-12 pt-16' : 'pl-64 pt-16'} transition-all duration-300 ease-in-out`}
        onClick={handleZoom}
        onMouseMove={handleMouseMove}
      >
        <Image
          ref={imageRef}
          src={`/${currentPage}.${currentPage === 7 || currentPage === 8 || currentPage === 9 || currentPage === 10 ? 'jpg' : 'png'}`}
          alt={`Page ${currentPage}`}
          width={1200}
          height={800}
          className="object-contain scale-105 cursor-pointer"
          style={{ transform: 'scale(1.05)' }}
          quality={100}
          priority
        />
      </motion.div>

      {/* Navigation Arrows */}
      <div
        className="absolute bottom-8 z-20 flex gap-4"
        style={{
          left: `calc(50% + ${isFullScreen ? '0' : isSidebarMinimized ? '4rem' : '16rem'} / 2)`,
          transform: 'translateX(-50%)',
        }}
      >
        {currentPage > 0 && (
          <motion.button
            onClick={handlePreviousPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-black text-4xl cursor-pointer"
          >
            ◄
          </motion.button>
        )}
        {currentPage < totalPages - 1 && (
          <motion.button
            onClick={handleNextPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-black text-4xl cursor-pointer"
          >
            ►
          </motion.button>
        )}
      </div>

      {/* Full Screen Button */}
      <div className="absolute top-8 right-8 z-20 flex flex-col gap-4">
        <button
          onClick={toggleFullScreen}
          className="text-white bg-gray-700 p-2 rounded-full"
          title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
        >
          {isFullScreen ? '⤢' : '⤡'}
        </button>
      </div>

      {/* Back to Main Page Button */}
      {!isFullScreen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`fixed top-0 ${isSidebarMinimized ? 'left-12' : 'left-64'} right-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/10`}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-teal-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Architecture Portfolio</h1>
          </div>
        </motion.div>
      )}
    </div>
  );
}