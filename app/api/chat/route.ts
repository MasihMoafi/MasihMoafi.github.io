import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define types for messages and session data
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type SessionData = {
  [sessionId: string]: ChatMessage[];
};

// Memory store path
const MEMORY_PATH = path.join(process.cwd(), 'data/chat_memory.json');

// Language detection function (simple version)
function containsFarsi(text: string): boolean {
  // Persian/Farsi Unicode range (very simplified)
  const farsiPattern = /[\u0600-\u06FF]/;
  return farsiPattern.test(text);
}

// Initialize memory store
function initializeMemoryStore(): void {
  try {
    // Ensure directory exists
    const dir = path.dirname(MEMORY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create file if it doesn't exist
    if (!fs.existsSync(MEMORY_PATH)) {
      fs.writeFileSync(MEMORY_PATH, JSON.stringify({}));
    }
  } catch (error) {
    console.error('Failed to initialize memory store:', error);
  }
}

// Get chat history
function getChatHistory(sessionId: string): ChatMessage[] {
  try {
    if (!fs.existsSync(MEMORY_PATH)) {
      initializeMemoryStore();
      return [];
    }
    
    const data: SessionData = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
    return data[sessionId] || [];
  } catch (error) {
    console.error('Failed to read chat history:', error);
    return [];
  }
}

// Save chat history
function saveChatHistory(sessionId: string, messages: ChatMessage[]): void {
  try {
    if (!fs.existsSync(MEMORY_PATH)) {
      initializeMemoryStore();
    }
    
    const data: SessionData = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
    data[sessionId] = messages;
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

// Extract name from message (simple heuristic)
function extractName(message: string): string | null {
  // English patterns
  const englishPatterns = [
    /my name is\s+([A-Za-z\s]+)/i,
    /i am\s+([A-Za-z\s]+)/i,
    /call me\s+([A-Za-z\s]+)/i
  ];
  
  // Farsi patterns
  const farsiPatterns = [
    /اسم من\s+(.+?)\s+(?:است|هست)/,
    /من\s+(.+?)\s+(?:هستم)/,
    /(.+?)\s+(?:هستم)/
  ];
  
  // Check English patterns
  for (const pattern of englishPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Check Farsi patterns
  for (const pattern of farsiPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { prompt, sessionId = 'default', extraContext = "", imageData = null } = await req.json();
    const isFarsi = containsFarsi(prompt);
    
    console.time('api-chat-request');
    console.log('Using model: qwen3:8b');

    // Get previous messages (up to 10)
    const history = getChatHistory(sessionId);
    
    // Check if this might be a name introduction
    const potentialName = extractName(prompt);
    if (potentialName) {
      console.log(`Detected potential name: ${potentialName}`);
      // We don't need to add anything here as the model itself will remember it
    }
    
    // Add the new message
    history.push({ role: 'user', content: prompt });
    
    // Keep the most recent messages to avoid context length issues
    const recentHistory = history.slice(-8);
    
    // Format history for the model
    const formattedHistory = recentHistory.map((msg: ChatMessage) => 
      `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    // Prepare the prompt with any extra context (like extracted image text)
    let contextPrompt = "";
    
    if (extraContext) {
      contextPrompt = `# Additional context:\n${extraContext}\n\n`;
    }
    
    // Simplified prompt - removing Farsi instructions
    contextPrompt += `${formattedHistory}\n\nAssistant:`;
    
    // Use a standard system prompt with no translation instructions
    const systemPrompt = "You are a helpful, knowledgeable AI assistant. You provide accurate information in a natural, conversational style. Be concise and direct in your responses.";

    // Make Ollama call with optimized parameters
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3',
        prompt: contextPrompt,
        images: imageData ? [imageData] : [],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048,
          system: systemPrompt
        }
      })
    });

    if (!ollamaResponse.ok) {
      const error = await ollamaResponse.text();
      throw new Error(`Ollama error: ${error}`);
    }

    const responseData = await ollamaResponse.json();
    const assistantResponse = responseData.response;
    
    // Save the assistant's response to history
    recentHistory.push({ role: 'assistant', content: assistantResponse });
    saveChatHistory(sessionId, recentHistory);
    
    console.timeEnd('api-chat-request');
    
    return new NextResponse(JSON.stringify({
      response: assistantResponse
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return new NextResponse(JSON.stringify({
      error: error.message || 'Failed to process request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}