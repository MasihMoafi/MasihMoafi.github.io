import { Roboto, Inter } from 'next/font/google';
import './globals.css';
// import ModernChatbot from './components/ModernChatbot';
import MusicProvider from './components/MusicProvider';

const roboto = Roboto({ subsets: ['latin'], weight: '300' }); // Light weight for all text
const inter = Inter({ subsets: ['latin'] }); // For your name

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <MusicProvider>
          {children}
          {/* <ModernChatbot /> */}
        </MusicProvider>
      </body>
    </html>
  );
}