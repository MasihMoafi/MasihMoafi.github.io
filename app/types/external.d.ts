declare module 'gtts' {
  export class gTTS {
    constructor(text: string, options?: { lang?: string; slow?: boolean });
    save(filename: string): Promise<void>;
  }
}

declare module 'pydub' {
  export class AudioSegment {
    static from_mp3(filename: string): AudioSegment;
    static ffprobe: string;
    raw_data: any;
    frame_rate: number;
    _spawn(raw_data: any, overrides: { frame_rate: number }): AudioSegment;
    export(filename: string, format: string): Promise<void>;
  }
}

declare module 'ollama' {
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatOptions {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  }

  export interface ChatResponse {
    message: {
      content: string;
    };
  }

  export class Client {
    constructor(options: { host: string });
    chat(params: {
      model: string;
      messages: ChatMessage[];
      options?: ChatOptions;
    }): Promise<ChatResponse>;
  }
}

declare module 'httpx' {
  export interface Response {
    status_code: number;
    json(): Promise<any>;
  }

  export function post(url: string, options: {
    json?: any;
    headers?: Record<string, string>;
  }): Promise<Response>;

  export function get(url: string, params?: Record<string, any>): Promise<Response>;
}

declare module 'react-markdown' {
  import { ReactNode } from 'react';
  
  export interface ReactMarkdownProps {
    children: string;
    className?: string;
    components?: Record<string, React.ComponentType<any>>;
  }
  
  export default function ReactMarkdown(props: ReactMarkdownProps): ReactNode;
} 