import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the chat memory JSON file
const MEMORY_PATH = path.join(process.cwd(), 'data/chat_memory.json');

export async function POST(req: Request) {
  try {
    // Get sessionId from the request body, or use 'default' if not provided
    const { sessionId = 'default' } = await req.json();
    
    console.log(`Clearing chat history for session: ${sessionId}`);
    
    // Check if memory file exists
    if (!fs.existsSync(MEMORY_PATH)) {
      console.log('Memory file does not exist, no need to clear.');
      return new NextResponse(JSON.stringify({ success: true, message: 'No chat history existed' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Read the existing memory JSON
    const data = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
    
    // Remove the specified session
    if (sessionId === '*') {
      // Clear all sessions if '*' is passed
      console.log('Clearing all chat sessions');
      fs.writeFileSync(MEMORY_PATH, JSON.stringify({}));
    } else {
      // Clear only the specific session
      console.log(`Removing session: ${sessionId}`);
      if (data[sessionId]) {
        delete data[sessionId];
        fs.writeFileSync(MEMORY_PATH, JSON.stringify(data));
      }
    }
    
    return new NextResponse(JSON.stringify({ 
      success: true, 
      message: sessionId === '*' ? 'All chat history cleared' : `Chat history cleared for session: ${sessionId}` 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('Error clearing chat history:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: error.message || 'Failed to clear chat history'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 