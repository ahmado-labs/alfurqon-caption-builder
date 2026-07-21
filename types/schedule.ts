// Definisi kategori/format acara siaran langsung
export type KategoriKajian = 'studio' | 'masjid' | 'tabligh_akbar' | 'konsultasi' | 'program_anak';

// Schema Data Utama Jadwal Kajian
export interface ScheduleItem {
  id: string;
  hari: string;            // Contoh: "Selasa"
  tanggalMasehi: string;   // Contoh: "21/07/2026"
  tanggalHijri: string;    // Contoh: "7 Safar 1448 H"
  jam: string;             // Contoh: "07.30"
  pertemuanKe?: string;    // Contoh: "8"
  tema?: string;           // Contoh: "MANDHUMATU TSAIRI ILALLAHI LISSA'DI"
  kitab?: string;          // Contoh: "At-Tibyan: Syarah Akhlak Penghafal Al-Qur'an"
  ustadz: string;          // Contoh: "Ustadz Ibrohim Ghozi Lc."
  youtubeUrl?: string;     // Link streaming YT
  facebookUrl?: string;    // Link streaming FB
  
  // Fitur Khusus Tematik / Tabligh Akbar / Badal
  isTematik?: boolean;
  narsumTematik?: string;
  kategoriTematik?: string; // Contoh: "Tabligh Akbar" / "Badal"
  
  kategori: KategoriKajian;
  createdAt: number;
}