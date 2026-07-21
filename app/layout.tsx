import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Broadcast Generate 2.0 — Al-Furqon TV',
  description: 'Generator Caption & Title Live Streaming Al-Furqon TV',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}