import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let inputFilePath = '';
  let outputFilePath = '';
  
  try {
    console.log('TTS API: Request received');
    
    // Parse the request
    const body = await request.json().catch(e => {
      console.error('TTS API: Failed to parse request body', e);
      return null;
    });
    
    if (!body || !body.text) {
      console.error('TTS API: Missing text in request');
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const { text } = body;
    console.log(`TTS API: Processing text (${text.length} chars): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      console.log(`TTS API: Creating temp directory: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create unique filenames with timestamps and random numbers
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    inputFilePath = path.join(tempDir, `input_${timestamp}_${randomId}.txt`);
    outputFilePath = path.join(tempDir, `output_${timestamp}_${randomId}.wav`);
    
    // Write text to file
    console.log(`TTS API: Writing input to ${inputFilePath}`);
    fs.writeFileSync(inputFilePath, text);
    
    // Check script exists
    const scriptPath = path.join(process.cwd(), 'scripts', 'kokoro_tts.py');
    if (!fs.existsSync(scriptPath)) {
      console.error(`TTS API: Script not found at ${scriptPath}`);
      throw new Error(`Script not found at ${scriptPath}`);
    }
    
    // Run the Python script with verbose command and timeout
    const command = `python ${scriptPath} "${inputFilePath}" "${outputFilePath}"`;
    console.log(`TTS API: Executing command: ${command}`);
    
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 }); // 30-second timeout
      
      if (stderr) {
        console.warn(`TTS API: Script stderr: ${stderr}`);
      }
      
      console.log(`TTS API: Script stdout: ${stdout}`);
    } catch (execError: any) {
      console.error(`TTS API: Script execution error: ${execError.message}`);
      
      // Create a silent audio file if the script fails
      if (!fs.existsSync(outputFilePath)) {
        console.log("TTS API: Creating silent audio file as fallback");
        
        // Create or copy a silent audio file
        const silentAudioPath = path.join(process.cwd(), 'public', 'silent.wav');
        
        if (fs.existsSync(silentAudioPath)) {
          // Copy existing silent audio
          fs.copyFileSync(silentAudioPath, outputFilePath);
        } else {
          // Create minimal valid WAV file (1 sec of silence at 24000Hz)
          const silentWav = generateSilentWav(24000, 1);
          fs.writeFileSync(outputFilePath, silentWav);
        }
        console.log(`TTS API: Created silent audio file at ${outputFilePath}`);
      }
    }
    
    // Check if the output file exists and has content
    if (!fs.existsSync(outputFilePath)) {
      console.error(`TTS API: Output file not created: ${outputFilePath}`);
      throw new Error('Failed to generate audio file - file not created');
    }
    
    const stats = fs.statSync(outputFilePath);
    console.log(`TTS API: Output file size: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      console.error(`TTS API: Output file is empty: ${outputFilePath}`);
      throw new Error('Generated audio file is empty');
    }
    
    // Read the audio file
    const audioBuffer = fs.readFileSync(outputFilePath);
    console.log(`TTS API: Read ${audioBuffer.length} bytes from output file`);
    
    // Clean up temporary files
    try {
      fs.unlinkSync(inputFilePath);
      fs.unlinkSync(outputFilePath);
      console.log('TTS API: Cleaned up temporary files');
    } catch (cleanupError) {
      console.warn('TTS API: Failed to clean up temporary files', cleanupError);
    }
    
    // Return the audio data
    console.log('TTS API: Sending audio response');
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS API error:', error);
    
    // Clean up any temporary files if they exist
    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) {
        fs.unlinkSync(inputFilePath);
      }
      if (outputFilePath && fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath);
      }
    } catch (cleanupError) {
      console.warn('TTS API: Error during cleanup after exception', cleanupError);
    }
    
    // Generate a silent audio file as fallback
    const silentWav = generateSilentWav(24000, 1);
    
    return new NextResponse(silentWav, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': silentWav.length.toString(),
      },
    });
  }
}

// Function to generate a minimal valid WAV file with silence
function generateSilentWav(sampleRate: number, durationSec: number): Buffer {
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2; // 16-bit samples = 2 bytes per sample
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(1, 22); // num channels (mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Fill with zeros (silence)
  buffer.fill(0, 44);
  
  return buffer;
} 