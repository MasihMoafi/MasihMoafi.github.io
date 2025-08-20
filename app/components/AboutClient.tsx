'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import MovingStars from './MovingStars';

interface AboutClientProps {
  cvContent: string;
}

export default function AboutClient({ cvContent }: AboutClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-orange-900 flex flex-col items-center relative overflow-hidden">
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="z-10 mx-auto mt-20 mb-8 max-w-4xl px-6"
      >
        <div className="relative bg-gray-900/95 backdrop-blur-lg shadow-2xl overflow-hidden border border-gray-400/30 rounded-lg p-8">
          <div
            className="prose prose-invert prose-orange max-w-none cv-content"
            dangerouslySetInnerHTML={{ __html: cvContent }}
            style={{
              '--tw-prose-body': '#d1d5db',
              '--tw-prose-headings': '#ffffff',
              '--tw-prose-links': '#fed7aa',
              '--tw-prose-bold': '#ffffff',
              '--tw-prose-counters': '#fed7aa',
              '--tw-prose-bullets': '#fed7aa',
              '--tw-prose-hr': '#374151',
              '--tw-prose-quotes': '#d1d5db',
              '--tw-prose-quote-borders': '#fed7aa',
              '--tw-prose-captions': '#9ca3af',
              '--tw-prose-code': '#fed7aa',
              '--tw-prose-pre-code': '#fed7aa',
              '--tw-prose-pre-bg': '#1f2937',
              '--tw-prose-th-borders': '#374151',
              '--tw-prose-td-borders': '#374151',
            } as any}
          />
        </div>
      </motion.div>
    </div>
  );
}