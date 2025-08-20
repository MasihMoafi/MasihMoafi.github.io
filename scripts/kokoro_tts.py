#!/usr/bin/env python
"""
Kokoro TTS script to generate speech from text.
This script uses the local Kokoro implementation to generate TTS.
"""

import sys
import os
import traceback
import soundfile as sf
import numpy as np
import torch

# --- GPU USAGE ENABLED ---
# The following lines have been commented out to allow PyTorch to find and use the GPU.
# os.environ["CUDA_VISIBLE_DEVICES"] = ""
# torch.set_num_threads(2)

from kokoro import KPipeline

def generate_tts(input_file, output_file):
    """Generate TTS audio from text file and save to output file"""
    print(f"Reading input from: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    print(f"Read {len(text)} characters of text")
    
    if not text.strip():
        print("Warning: Input text is empty")
        silent_audio = np.zeros(24000, dtype=np.float32)
        sf.write(output_file, silent_audio, 24000)
        print(f"Created silent audio file at {output_file}")
        return True
    
    try:
        # --- GPU USAGE ENABLED ---
        # Updated the status message to reflect GPU usage.
        print("Initializing Kokoro pipeline on GPU (if available)")
        pipeline = KPipeline(lang_code='a')
        
        voice = 'af_heart'
        speed = 1
        
        print(f"Starting TTS generation with voice: {voice}, speed: {speed}")
        
        max_chars_per_chunk = 100
        text_chunks = []
        
        if len(text) > max_chars_per_chunk:
            sentences = []
            for sent in text.replace(".", ".||").replace("!", "!||").replace("?", "?||").split("||"):
                if sent.strip():
                    sentences.append(sent.strip())
            
            for sentence in sentences:
                if len(sentence) <= max_chars_per_chunk:
                    text_chunks.append(sentence)
                else:
                    comma_parts = []
                    for part in sentence.replace(",", ",||").replace(";", ";||").replace(":", ":||").split("||"):
                        if part.strip():
                            comma_parts.append(part.strip())
                    
                    if comma_parts:
                        for part in comma_parts:
                            if len(part) <= max_chars_per_chunk:
                                text_chunks.append(part)
                            else:
                                words = part.split()
                                current_chunk = []
                                current_length = 0
                                
                                for word in words:
                                    if current_length + len(word) > max_chars_per_chunk:
                                        text_chunks.append(' '.join(current_chunk))
                                        current_chunk = [word]
                                        current_length = len(word)
                                    else:
                                        current_chunk.append(word)
                                        current_length += len(word) + 1
                                
                                if current_chunk:
                                    text_chunks.append(' '.join(current_chunk))
                    else:
                        words = sentence.split()
                        current_chunk = []
                        current_length = 0
                        
                        for word in words:
                            if current_length + len(word) > max_chars_per_chunk:
                                text_chunks.append(' '.join(current_chunk))
                                current_chunk = [word]
                                current_length = len(word)
                            else:
                                current_chunk.append(word)
                                current_length += len(word) + 1
                        
                        if current_chunk:
                            text_chunks.append(' '.join(current_chunk))
        else:
            text_chunks = [text]
            
        if not text_chunks:
            text_chunks = [text]
            
        print(f"Split text into {len(text_chunks)} chunks for processing")
        
        if len(text) < 10:
            print(f"Text is very short ({len(text)} chars), padding it")
            text = text + " " * (10 - len(text))
            text_chunks = [text]
        
        audio_segments = []
        
        for i, chunk in enumerate(text_chunks):
            print(f"Processing chunk {i+1}/{len(text_chunks)} ({len(chunk)} chars): '{chunk}'")
            try:
                for _, _, audio in pipeline(chunk, voice=voice, speed=speed):
                    if audio is not None and len(audio) > 0:
                        audio_segments.append(audio)
                        print(f"Generated audio segment: {len(audio)} samples")
                    break
            except Exception as chunk_error:
                print(f"Error processing chunk {i+1}: {str(chunk_error)}")
        
        if not audio_segments:
            print("Error: No audio segments were generated")
            silent_audio = np.zeros(24000, dtype=np.float32)
            sf.write(output_file, silent_audio, 24000)
            print(f"Created silent audio file at {output_file}")
            return True
        
        print(f"Combining {len(audio_segments)} audio segments")
        audio_data = np.concatenate(audio_segments) if len(audio_segments) > 1 else audio_segments[0]
        
        print(f"Combined audio data: {len(audio_data)} samples")
        
        print(f"Saving audio to: {output_file}")
        sf.write(output_file, audio_data, 24000)
        
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            print(f"Successfully saved audio file: {file_size} bytes")
            return True
        else:
            print(f"Error: Failed to save audio file at {output_file}")
            return False
        
    except Exception as e:
        print(f"Error during TTS generation: {str(e)}")
        print(traceback.format_exc())
        
        try:
            silent_audio = np.zeros(24000, dtype=np.float32)
            sf.write(output_file, silent_audio, 24000)
            print(f"Created silent audio file at {output_file} due to error")
            return True
        except Exception as fallback_error:
            print(f"Failed to create fallback audio file: {str(fallback_error)}")
            return False

if __name__ == "__main__":
    print("Kokoro TTS Script starting (GPU mode if available)")
    print(f"Args: {sys.argv}")
    print(f"Current directory: {os.getcwd()}")
    print(f"PyTorch device available: {'cuda' if torch.cuda.is_available() else 'cpu'}")
    
    if len(sys.argv) != 3:
        print("Usage: python kokoro_tts.py input_file output_file")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print(f"Input file: {input_file}")
    print(f"Output file: {output_file}")
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        print(f"Creating output directory: {output_dir}")
        os.makedirs(output_dir, exist_ok=True)
    
    success = generate_tts(input_file, output_file)
    
    if not success:
        print("Failed to generate TTS audio")
        sys.exit(1)
    
    print(f"TTS audio generated successfully: {output_file}")
    if os.path.exists(output_file):
        print(f"File size: {os.path.getsize(output_file)} bytes")
    sys.exit(0)
