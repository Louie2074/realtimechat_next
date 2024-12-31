import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real-time Chat App',
  description: 'A real-time chat application built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold">Doug Chat</h1>
        </header>
        {children}
      </body>
    </html>
  );
}
