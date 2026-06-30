import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Kita sesuaikan letak import CSS-nya ke folder app

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Modern To-Do App',
  description: 'Simple and elegant task management application',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
