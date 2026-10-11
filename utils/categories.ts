import { KategoriKajian } from '@/types/schedule';

export type CategoryKey = 'studio' | 'masjid' | 'konsultasi' | 'program_anak' | 'tematik';

export interface CategoryConfig {
  key: CategoryKey;
  slug: string;              // alamat halaman, contoh: /program-anak
  label: string;             // nama tampil, contoh: "Program Anak"
  deskripsi: string;         // penjelasan singkat di kartu Home
  pembuka: string;           // kalimat pembuka caption (untuk pengingat di form)
  kategoriData: KategoriKajian;
  temaAwal: string;
  // Field yang tampil di form kategori ini
  showJadwal: boolean;
  showTema: boolean;
  showKitab: boolean;
  showPertemuan: boolean;
  showUstadz: boolean;
  showTematik: boolean;
}

const TEMA_AWAL = 'Judul Kajian / Tema Kajian';

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  studio: {
    key: 'studio', slug: 'studio', label: 'Studio',
    deskripsi: 'Kajian harian dari Studio Al Furqon TV. Memakai kitab, pertemuan, dan ustadz.',
    pembuka: '"(LIVE) Studio Al Furqon TV"',
    kategoriData: 'studio', temaAwal: TEMA_AWAL,
    showJadwal: true, showTema: true, showKitab: true, showPertemuan: true, showUstadz: true, showTematik: false,
  },
  masjid: {
    key: 'masjid', slug: 'masjid', label: 'Masjid',
    deskripsi: "Kajian harian dari Masjid Jami' Al Furqon. Memakai kitab, pertemuan, dan ustadz.",
    pembuka: '"(LIVE) Masjid Jami\' Al Furqon"',
    kategoriData: 'masjid', temaAwal: TEMA_AWAL,
    showJadwal: true, showTema: true, showKitab: true, showPertemuan: true, showUstadz: true, showTematik: false,
  },
  konsultasi: {
    key: 'konsultasi', slug: 'konsultasi', label: 'Konsultasi',
    deskripsi: 'Konsultasi syariah. Hanya ustadz dan nomor WhatsApp pertanyaan.',
    pembuka: '"(LIVE) Studio Al Furqon TV" format Konsultasi Syariah',
    kategoriData: 'konsultasi', temaAwal: "Konsultasi Syari'ah",
    showJadwal: true, showTema: false, showKitab: false, showPertemuan: false, showUstadz: true, showTematik: false,
  },
  program_anak: {
    key: 'program_anak', slug: 'program-anak', label: 'Program Anak',
    deskripsi: 'Program anak dari studio. Memakai tema dan ustadz, tanpa kitab.',
    pembuka: '"(LIVE) Studio Al Furqon TV" format Program Anak',
    kategoriData: 'program_anak', temaAwal: TEMA_AWAL,
    showJadwal: true, showTema: true, showKitab: false, showPertemuan: false, showUstadz: true, showTematik: false,
  },
  tematik: {
    key: 'tematik', slug: 'tematik', label: 'Tematik / Tabligh Akbar / Kajian Spesial / Dauroh / dll',
    deskripsi: 'Acara khusus dengan narasumber dan jenis kegiatan sendiri.',
    pembuka: '"(LIVE) Masjid Jami\' Al Furqon" format acara khusus',
    kategoriData: 'tabligh_akbar', temaAwal: TEMA_AWAL,
    showJadwal: false, showTema: true, showKitab: false, showPertemuan: false, showUstadz: false, showTematik: true,
  },
};

export const CATEGORY_LIST: CategoryConfig[] = [
  CATEGORIES.studio,
  CATEGORIES.masjid,
  CATEGORIES.konsultasi,
  CATEGORIES.program_anak,
  CATEGORIES.tematik,
];
