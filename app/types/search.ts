export type SearchMode = 'google' | 'docs' | 'wikipedia' | 'duckduckgo' | 'all';

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source?: string; // Added to track which search engine provided this
} 