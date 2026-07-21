'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mencegah mismatch hydration saat pertama kali dirender di server
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // Placeholder berukuran sama
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-xl bg-alfurqon-green/10 text-alfurqon-green dark:text-alfurqon-lightgreen hover:bg-alfurqon-green/20 border border-alfurqon-green/20 transition-all font-medium text-sm flex items-center gap-2 cursor-pointer"
      title="Ubah Mode Tampilan"
    >
      {theme === 'dark' ? (
        <>
          <span>☀️</span> Ubah ke Mode Terang
        </>
      ) : (
        <>
          <span>🌙</span> Ubah ke Mode Gelap
        </>
      )}
    </button>
  );
}