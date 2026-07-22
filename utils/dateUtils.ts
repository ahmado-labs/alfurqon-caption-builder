const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const HARI_INDONESIA: { [key: number]: string } = {
  0: 'Ahad',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: "Jum'at",
  6: 'Sabtu',
};

// Format Masehi: contoh "21 Juli 2026"
export function getTodayMasehi(baseDate: Date = new Date()): string {
  const date = baseDate.getDate();
  const month = BULAN_INDONESIA[baseDate.getMonth()];
  const year = baseDate.getFullYear();

  return `${date} ${month} ${year}`;
}

// Mengambil Nama Hari
export function getTodayDayName(baseDate: Date = new Date()): string {
  return HARI_INDONESIA[baseDate.getDay()] || 'Selasa';
}

// Simple Hijri Estimator (Mendukung tanggal pilihan & offset hari)
export function getTodayHijri(offsetDays: number = 0, baseDate: Date = new Date()): string {
  // Salin objek tanggal agar tidak merubah tanggal asli
  const targetDate = new Date(baseDate.getTime());
  
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(targetDate);
    
    let day = '';
    let month = '';
    let year = '';

    parts.forEach(p => {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = p.value;
    });

    return `${day} ${month} ${year}`;
  } catch {
    return '7 Safar 1448';
  }
}