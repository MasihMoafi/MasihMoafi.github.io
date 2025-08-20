'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import MovingStars from '../components/MovingStars';

const projects = [
  {
    id: 1,
    title: 'A-Modular-Kingdom',
    description: 'The Foundation for AI-Powered Multi-Agent Systems',
    longDescription: 'A comprehensive AI infrastructure providing building blocks for sophisticated multi-agent workflows. Built with modularity and standardization at its core, seamlessly connecting different multi-agent architectures through a unified foundation. Features Council Chamber (hierarchical) and Gym (sequential) workflows, MCP protocol integration, advanced RAG system, persistent memory, vision capabilities, code execution, and more.',
    githubUrl: 'https://github.com/MasihMoafi/A-Modular-Kingdom',
    blogUrl: '/blog/a-modular-kingdom',
    tags: ['AI', 'Multi-Agent', 'Python', 'RAG', 'MCP', 'LLM'],
    featured: true,
    image: '/projects/a-modular-kingdom.png'
  },
  {
    id: 2,
    title: 'TTS-STT Voice Assistant',
    description: 'Local AI Voice Assistant with Whisper & Kokoro',
    longDescription: 'A personal, local, and fast voice assistant built with advanced speech recognition and synthesis. Uses whisper.cpp for accurate speech-to-text and Kokoro TTS for natural speech generation, providing seamless voice interaction experience.',
    githubUrl: 'https://github.com/MasihMoafi/TTS-STT-Voice-Assistant',
    tags: ['Voice AI', 'Whisper', 'TTS', 'Python', 'Local AI'],
    featured: false
  }
];

export default function Projects() {
  const [mounted, setMounted] = useState(false);

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
        <h1 className="text-2xl font-bold text-white bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">My Projects</h1>
      </motion.div>

      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                  className="relative z-10"
                >
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-orange-300/50 transition-all duration-300 group">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {project.longDescription}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {project.blogUrl ? (
                          <Link
                            href={project.blogUrl}
                            className="flex items-center justify-center px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 rounded-xl border border-orange-500/30 transition-all duration-300"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        ) : null}
                        
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white hover:text-orange-200 rounded-xl border border-white/20 transition-all duration-300"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          <span>View Code</span>
                        </a>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}