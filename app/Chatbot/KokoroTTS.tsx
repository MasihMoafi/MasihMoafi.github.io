'use client';

// KokoroTTS.tsx - Utility for connecting to Kokoro TTS API
import { useState, useCallback, useRef, useEffect } from 'react';

// Declare necessary types for browser compatibility
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface KokoroTTSHook {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  error: string | null;
  stopSpeaking: () => void;
}

// Custom hook for Kokoro TTS functionality
export function useKokoroTTS(): KokoroTTSHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch (err) {
          console.error('Error clearing audio:', err);
        }
      }
      
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort('Component unmounted');
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Function to stop speaking immediately
  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false);
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping audio playback:', err);
    }
    
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('User interrupted');
        abortControllerRef.current = null;
      }
    } catch (err) {
      console.error('Error aborting request:', err);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      console.log('KokoroTTS: Empty text received, not speaking');
      return;
    }
    
    try {
      // Stop any current speech
      stopSpeaking();
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      console.log("KokoroTTS: Starting speech synthesis");
      setIsSpeaking(true);
      setError(null);
      
      // For debugging: log the text being sent
      console.log(`KokoroTTS: Sending text (${text.length} chars): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      // Make a request to your local API endpoint that runs Kokoro
      const response = await fetch('/api/kokoro-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal // Allow aborting the fetch request
      });
      
      // Check if aborted during fetch
      if (signal.aborted) {
        console.log("KokoroTTS: Request was aborted during fetch");
        setIsSpeaking(false);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`KokoroTTS: API error (${response.status}):`, errorText);
        throw new Error(`TTS request failed with status: ${response.status} - ${errorText}`);
      }
      
      console.log("KokoroTTS: Received response, processing audio data");
      
      // Get audio data from response
      const audioData = await response.blob();
      
      // Check if aborted during blob processing
      if (signal.aborted) {
        console.log("KokoroTTS: Request was aborted after response");
        setIsSpeaking(false);
        return;
      }
      
      if (audioData.size === 0) {
        throw new Error("Received empty audio data from API");
      }
      
      console.log(`KokoroTTS: Audio data received, size: ${audioData.size} bytes`);
      
      const audioUrl = URL.createObjectURL(audioData);
      
      // Create a new audio element
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up audio element
      audio.src = audioUrl;
      
      // Set up event handlers
      audio.onended = () => {
        console.log("KokoroTTS: Audio playback ended");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error("KokoroTTS: Audio playback error:", e);
        setIsSpeaking(false);
        setError('Audio playback failed');
        URL.revokeObjectURL(audioUrl);
      };
      
      // Add safety timeout to ensure speaking state is reset
      const safetyTimeout = setTimeout(() => {
        if (isSpeaking) {
          console.log("KokoroTTS: Safety timeout triggered, resetting state");
          setIsSpeaking(false);
        }
      }, 30000); // 30 seconds max
      
      // Play the audio
      try {
        await audio.play();
        clearTimeout(safetyTimeout);
      } catch (err) {
        clearTimeout(safetyTimeout);
        console.error("KokoroTTS: Failed to play audio:", err);
        setIsSpeaking(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
      }
      
    } catch (err: any) {
      console.error('KokoroTTS error:', err);
      setError(err.message || 'Failed to generate speech');
      setIsSpeaking(false);
    }
  }, [stopSpeaking, isSpeaking]);

  return {
    speak,
    isSpeaking,
    error,
    stopSpeaking,
  };
}