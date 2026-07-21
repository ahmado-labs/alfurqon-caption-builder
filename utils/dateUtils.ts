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

// Format Masehi: "21 Juli 2026"
export function getTodayMasehi(): string {
  const today = new Date();
  const date = today.getDate();
  const month = BULAN_INDONESIA[today.getMonth()];
  const year = today.getFullYear();

  return `${date} ${month} ${year}`;
}

export function getTodayDayName(): string {
  const today = new Date();
  return HARI_INDONESIA[today.getDay()] || 'Selasa';
}

// Simple Hijri Estimator
export function getTodayHijri(offsetDays: number = 0): string {
  const today = new Date();
  today.setDate(today.getDate() + offsetDays);

  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(today);
    
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