import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

export async function getCVContent(): Promise<string> {
  try {
    const cvPath = path.join(process.cwd(), 'public/CV/CV.md');
    
    if (!fs.existsSync(cvPath)) {
      return '<p>CV not found</p>';
    }
    
    const fileContents = fs.readFileSync(cvPath, 'utf8');
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(fileContents);
    
    return processedContent.toString();
  } catch (error) {
    console.error('Error reading CV:', error);
    return '<p>Error loading CV</p>';
  }
}