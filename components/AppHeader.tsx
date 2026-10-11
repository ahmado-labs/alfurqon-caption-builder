import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader({ subtitle, aksi }: { subtitle: string; aksi?: React.ReactNode }) {
  return (
    <header className="bg-alfurqon-dark text-white p-4 shadow-md border-b-2 border-alfurqon-green">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="text-alfurqon-gold w-6 h-6" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Al Furqon TV | Broadcast Generator 3.0</h1>
            <p className="text-xs text-emerald-200/80">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {aksi}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
