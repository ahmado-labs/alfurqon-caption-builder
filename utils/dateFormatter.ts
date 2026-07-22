// Helper untuk mendapatkan string YYYY-MM-DD dari Date (sesuai zona waktu lokal)
export function getFormattedDateInput(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper untuk konversi YYYY-MM-DD ke Nama Hari
export function getDayNameFromDateString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
  return days[date.getDay()] || '';
}

// Helper untuk konversi YYYY-MM-DD ke Teks Tanggal Masehi Lengkap (misal: 22 Juli 2026)
export function getFullMasehiFromDateString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}