import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let inputFilePath = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    inputFilePath = path.join(tempDir, `audio_${timestamp}_${randomId}.wav`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inputFilePath, fileBuffer);

    const scriptPath = path.join(process.cwd(), 'scripts', 'transcribe.sh');
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found at ${scriptPath}`);
    }

    const command = `bash ${scriptPath} "${inputFilePath}"`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn(`STT API: Script stderr: ${stderr}`);
    }

    // The transcription is in a file with the same name as the input file, but with a .txt extension
    const outputFilePath = `${inputFilePath}.txt`;
    if (!fs.existsSync(outputFilePath)) {
      throw new Error('Transcription file not created');
    }

    const transcription = fs.readFileSync(outputFilePath, 'utf-8');

    // Clean up temporary files
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(outputFilePath);

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('STT API error:', error);

    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
