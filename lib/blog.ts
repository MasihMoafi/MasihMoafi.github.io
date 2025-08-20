'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'app/blog/posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.md'))
      .map(async (name) => {
        const slug = name.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Convert markdown content to HTML
        let processedContent;
        try {
          processedContent = await remark()
            .use(html)
            .process(content);
        } catch (error) {
          console.error(`Error processing markdown for ${name}:`, error);
          processedContent = { toString: () => content }; // Fallback to raw content
        }

        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString().split('T')[0],
          excerpt: data.excerpt || '',
          author: data.author || 'Masih Moafi',
          tags: data.tags || [],
          content: processedContent.toString(),
        } as BlogPost;
      })
  );

  // Sort posts by date (newest first)
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(html)
      .process(content);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      author: data.author || 'Masih Moafi',
      tags: data.tags || [],
      content: processedContent.toString(),
    };
  } catch (error) {
    return null;
  }
}