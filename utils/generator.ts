import { ScheduleItem } from '@/types/schedule';

// Helper Title Case
// Helper Title Case cerdas (Mendukung gelar & singkatan)
export function toTitleCase(str: string): string {
  if (!str) return '';

  // Daftar kata/gelar yang harus SELALU KAPITAL
  const ALWAYS_UPPERCASE = [
    'LC', 'MA', 'M.A', 'M.A.', 'MPD', 'M.PD', 'M.PD.', 
    'PHD', 'PH.D', 'PH.D.', 'S.AG', 'S.AG.', 'S.PD', 'S.PD.', 
    'S.H', 'S.H.', 'S.SI', 'S.SI.', 'B.A', 'B.A.', 'M.SI', 'M.SI.'
  ];

  return str
    .split(' ')
    .map((word) => {
      // 1. Cek jika kata sesuai dengan daftar gelar kapital
      const cleanWordUpper = word.toUpperCase().trim();
      if (ALWAYS_UPPERCASE.includes(cleanWordUpper)) {
        return cleanWordUpper;
      }

      // 2. Format Kapitalisasi per kata (memperhatikan karakter setelah titik/kurung)
      return word.replace(/(?:^|[\s\(\/\.-])\S/g, (match) => match.toUpperCase());
    })
    .join(' ')
    // Perbaikan tambahan untuk gelar spesifik ber-titik koma (seperti M.A., Lc., dll)
    .replace(/\bM\.a\b/g, 'M.A')
    .replace(/\bM\.a\./g, 'M.A.')
    .replace(/\bL\.c\b/g, 'L.c')
    .replace(/\bL\.c\./g, 'L.c.');
}

// Helper Format Masehi Teks (Konversi otomatis 21/07/2026 -> 21 Juli 2026)
export function formatMasehiText(dateStr: string): string {
  if (!dateStr) return '';

  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const cleanStr = dateStr.replace(/\s*M\s*$/i, '').trim();
  const parts = cleanStr.split(/[\/\.-]/);

  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];

    if (!isNaN(day) && !isNaN(monthIdx) && monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }

  return cleanStr;
}

// Helper untuk menghapus format Markdown (*bold*, _italic_, ~strikethrough~, dll)
export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*([^*]+)\*/g, '$1') // Hapus *bold*
    .replace(/_([^_]+)_/g, '$1')   // Hapus _italic_
    .replace(/~([^~]+)~/g, '$1')   // Hapus ~strikethrough~
    .replace(/`([^`]+)`/g, '$1');  // Hapus `code`
}

// Block Footer
const FOOTER_TEMPLATE = (ytUrl: string, fbUrl: string) => `📺 Kajian dapat disaksikan melalui:

🔴 Live YouTube:
${ytUrl}

🔴 Live Facebook:
${fbUrl}

▶ Live Streaming YouTV
https://youtv.id/

📲 Download Aplikasi MeGo (intech apps)
https://play.google.com/store/apps/details?id=one.mego&hl=id

📷 Instagram Resmi
https://www.instagram.com/alfurqontvofficial

📻 Radio Suara Al Furqon 102.3 FM
(Sidayu, Gresik, dan sekitarnya)

❓ Ingin bertanya? hubungi:
📱 WhatsApp: +62 812-5952-1312

🤝 Dukung Syiar Dakwah Al Furqon TV
🏦 BSI 224-224-2206
a.n. TV AL FURQON

Konfirmasi:
📱 0852-8903-1400

📨 Silakan bagikan informasi ini. Semoga Allah menjadikannya sebagai amal jariyah.

✨ بارك الله فيكم`;

// Live Title Standard
export function generateStandardTitle(item: ScheduleItem): string {
  const temaInput = item.tema ? item.tema.toUpperCase().trim() : '';
  const kitabInput = item.kitab ? item.kitab.toUpperCase().trim() : '';
  
  // Mengambil nama ustadz sesuai input form (tanpa dipaksa uppercase)
  const ustadz = item.ustadz ? item.ustadz.trim() : '';
  
  // Ambil angka pertemuan jika diisi (Contoh: "2. ")
  const prefixPertemuan = item.pertemuanKe ? `${item.pertemuanKe.trim()}. ` : '';

  // 1. Jika Tema diisi
  if (temaInput) {
    return `[LIVE] ${prefixPertemuan}${temaInput} | ${ustadz}`;
  }

  // 2. Jika Tema kosong, gunakan Kitab
  if (kitabInput) {
    return `[LIVE] ${prefixPertemuan}${kitabInput} | ${ustadz}`;
  }

  // 3. Fallback jika dua-duanya kosong
  return `[LIVE] KAJIAN ISLAMI | ${ustadz}`;
}

// Live Title Tematik
export function generateTematikTitle(item: ScheduleItem): string {
  const temaInput = item.tema ? item.tema.toUpperCase().trim() : '';
  const kategori = (item.kategoriTematik || 'TABLIGH AKBAR').toUpperCase().trim();

  // Mengambil nama narsum/ustadz sesuai input form (tanpa dipaksa uppercase)
  const narsum = (item.narsumTematik || item.ustadz || '').trim();

  const judulUtama = temaInput || 'KAJIAN TEMATIK';

  return `[LIVE]  ${judulUtama} | ${narsum}`; // tambahkan ${kategori}: kalau suatu saatnya ingin menampilkan kategori tematik di judul, tapi untuk sekarang kita sembunyikan dulu
}

// Text Caption Generator
export function generateCaptionText(
  item: ScheduleItem,
  mode: 'studio' | 'masjid' | 'konsultasi' | 'program_anak' | 'tematik' = 'studio'
): string {
  const temaFormatted = toTitleCase(item.tema ?? '');
  const hari = toTitleCase(item.hari ?? '');

  const ytUrl = item.youtubeUrl ? item.youtubeUrl : '';
  const fbUrl = item.facebookUrl ? item.facebookUrl : '';
  const footer = FOOTER_TEMPLATE(ytUrl, fbUrl);

  const hijriClean = item.tanggalHijri ? item.tanggalHijri.replace(/\s*H\s*$/i, '').trim() : '';
  const masehiClean = formatMasehiText(item.tanggalMasehi);

  const headerWaktu = `📅 ${hari}, ${hijriClean} H / ${masehiClean} M\n🕣 ${item.jam} ( Waktu Indonesia Barat ) - Selesai`;

  // 1. KONSULTASI
  if (mode === 'konsultasi') {
    return `📡 (LIVE) Studio Al Furqon TV
Ma'had Al Furqon Al Islami, Srowo, Sidayu, Gresik - Jawa Timur

${headerWaktu}

*☎️ KONSULTASI SYARIAH*

_🎙️ Bersama:_
*${item.ustadz}*

_Silakan kirimkan pertanyaan via WhatsApp ke:_
*+62 812-5952-1312*

${footer}`;
  }

  // 2. PROGRAM ANAK
if (mode === 'program_anak') {
  return `📡 (LIVE) Studio Al Furqon TV
Ma'had Al Furqon Al Islami, Srowo, Sidayu, Gresik - Jawa Timur

${headerWaktu}

*📚 PROGRAM ANAK*

_📚 Tema:_
*${temaFormatted}*

_🎙️ Bersama:_
*${item.ustadz}*

${footer}`;
}

  // 3. TEMATIK / TABLIGH AKBAR
  if (mode === 'tematik' || item.isTematik) {
    const narsum = item.narsumTematik || item.ustadz;
    const kategori = item.kategoriTematik || 'Tabligh Akbar';

    return `📡 (LIVE) Masjid Jami' Al Furqon
Ma'had Al Furqon Al Islami, Srowo, Sidayu, Gresik - Jawa Timur

${headerWaktu}

*🕌 ${kategori}*

_📚 Tema:_
*${temaFormatted}*

_🎙️ Bersama:_
*${narsum}*

${footer}`;
  }

  // 4. MASJID (Reguler)
  if (mode === 'masjid') {
    return `📡 (LIVE) Masjid Jami' Al Furqon
Ma'had Al Furqon Al Islami, Srowo, Sidayu, Gresik - Jawa Timur

${headerWaktu}

_📚 Tema:_
*${temaFormatted}*

_📚 Pembahasan Kitab:_
*${item.kitab || '-'}${item.pertemuanKe ? ` (Pertemuan Ke-${item.pertemuanKe})` : ''}*

_🎙️ Bersama:_
*${item.ustadz}*

${footer}`;
  }

  // 5. STUDIO (Reguler / Standard)
  return `📡 (LIVE) Studio Al Furqon TV
Ma'had Al Furqon Al Islami, Srowo, Sidayu, Gresik - Jawa Timur

${headerWaktu}

_📚 Tema:_
*${temaFormatted}*

_📚 Pembahasan Kitab:_
*${item.kitab || '-'}${item.pertemuanKe ? ` (Pertemuan Ke-${item.pertemuanKe})` : ''}*

_🎙️ Bersama:_
*${item.ustadz}*

${footer}`;
}