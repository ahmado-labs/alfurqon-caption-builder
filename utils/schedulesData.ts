export interface FixedSchedule {
  hari: string;
  jam: string;
  kitab: string;
  ustadz: string;
  tema?: string;
  kategori?: 'studio' | 'masjid' | 'konsultasi' | 'program_anak';
}

export const MASTER_SCHEDULES: FixedSchedule[] = [
  // SABTU
  { hari: 'Sabtu', jam: '05.00', kitab: 'SIFAT SHOLAT NABI ﷻ', ustadz: 'Ustadz Abu Yahya Rohmanto, Lc.' },
  { hari: 'Sabtu', jam: '07.00', kitab: 'MARI BELAJAR BAHASA ARAB', ustadz: 'Ustadz Shofwu Mi\'wan, Lc.' },
  { hari: 'Sabtu', jam: '08.30', kitab: 'TAJWID', ustadz: 'Ustadz Dennis Manuputty, Lc.' },
  { hari: 'Sabtu', jam: '13.00', kitab: 'MENDIDIK SI BUAH HATI', ustadz: 'Ustadz Iqbal Astar, Lc.' },
  { hari: 'Sabtu', jam: '15.45', kitab: 'MUKHTASAR MINHAJUL QASHIDIN', ustadz: 'Ustadz Khoirul Fajar, Lc.' },
  { hari: 'Sabtu', jam: '18.00', kitab: '40 HADITS KEUTAMAAN AHLUL QUR\'AN', ustadz: 'Ustadz Dennis Manuputty Lc.' },
  { hari: 'Sabtu', jam: '18.00', kitab: 'TEGAR DI ATAS AQIDAH SALAF', ustadz: 'Ustadz Khoirul Fajar, Lc.' },

  // AHAD
  { hari: 'Ahad', jam: '08.30', kitab: 'PROGRAM ANAK', ustadz: 'Ustadz Abu Ilyas Zainal Musthofa', kategori: 'program_anak' },
  { hari: 'Ahad', jam: '13.00', kitab: 'HADITS SEPUTAR PRAHARA AKHIR ZAMAN', ustadz: 'Ustadz Rokhmat Nashor, Lc., M.A.' },
  { hari: 'Ahad', jam: '18.00', kitab: 'RINGKASAN HADITS SHAHIH BUKHARI', ustadz: 'Ustadz Muhammad Nadhirin Lc.' },
  { hari: 'Ahad', jam: '20.00', kitab: '40 HADITS SEPUTAR MENIDIK ANAK', ustadz: 'Ustadz Fatih Mufarrikh, Lc., M.Pd.' },

  // SENIN
  { hari: 'Senin', jam: '05.00', kitab: 'KEMULIAAN ADAB DAN AKHLAK', ustadz: 'Ustadz Taufiqurrahman, Lc.' },
  { hari: 'Senin', jam: '06.00', kitab: 'FIQH SIRAH NABI ﷻ', ustadz: 'Ustadz Sabilul Muhtadin, Lc., M.H.I.' },
  { hari: 'Senin', jam: '13.00', kitab: 'TARGHIB WA TARHIB', ustadz: 'Ustadz Anwar Samuri, Lc. M.A.' },
  { hari: 'Senin', jam: '15.45', kitab: 'PERJALANAN MANUSIA-MANUSIA TERBAIK', ustadz: 'Ustadz Muamar Sulaiman' },
  { hari: 'Senin', jam: '18.00', kitab: 'PRAHARA DOSA BESAR', ustadz: 'Ustadz Rifaq Asyfiya\', Lc.' },
  { hari: 'Senin', jam: '20.00', kitab: 'BAGAIMANA ENGKAU MEMPERBAIKI HATI', ustadz: 'Ustadz Ahmad Zamroni' },

  // SELASA
  { hari: 'Selasa', jam: '05.00', kitab: 'TIPU DAYA IBLIS', ustadz: 'Ustadz Yusuf Rustam, Lc., M.A.' },
  { hari: 'Selasa', jam: '07.30', kitab: 'AT-TIBYAN: SYARAH AKHLAK PENGHAFAL AL-QUR\'AN', ustadz: 'Ustadz Ibrohim Ghozi Lc.' },
  { hari: 'Selasa', jam: '13.00', kitab: 'HIDUP BERKAH DENGAN ETIKA ISLAM', ustadz: 'Ustadz Aunush Shofi' },
  { hari: 'Selasa', jam: '15.45', kitab: 'TAFSIR AYAT-AYAT HUKUM', ustadz: 'Ustadz Hafidz Al-Mushtofa, Lc.' },
  { hari: 'Selasa', jam: '18.00', kitab: 'MA\'ALIM AT TAUHID', ustadz: 'Ustadz Fatih Mufarrikh, Lc., M.Pd.' },
  { hari: 'Selasa', jam: '18.00', kitab: 'MENELADANI AKHLAK NABI', ustadz: 'Ustadz Hafidz Al-Mushtofa, Lc.' },
  { hari: 'Selasa', jam: '20.00', kitab: 'Konsultasi Syari\'ah', ustadz: 'Ustadz Ahmad Sabiq, Lc.', kategori: 'konsultasi' },

  // RABU
  { hari: 'Rabu', jam: '05.00', kitab: 'BIMBINGAN MENUJU AQIDAH YANG BENAR', ustadz: 'Ustadz Rohmad Hadi' },
  { hari: 'Rabu', jam: '13.00', kitab: 'INTISARI AQIDAH SALAF', ustadz: 'Ustadz Abu Faiz Sholahuddin' },
  { hari: 'Rabu', jam: '15.45', kitab: 'HADITS SEPUTAR TAUHID IBADAH', ustadz: 'Ustadz Muhammad Nadhirin, Lc.' },
  { hari: 'Rabu', jam: '18.00', kitab: 'RAHASIA KELEMBUTAN HATI', ustadz: 'Ustadz Iqbal Astar, Lc.' },
  { hari: 'Rabu', jam: '20.00', kitab: 'ULUMUL QUR\'AN', ustadz: 'Ustadz Fida\' Bin Munadzir, B.A' },

  // KAMIS
  { hari: 'Kamis', jam: '05.00', kitab: 'SENJATA SEORANG MUSLIM', ustadz: 'Ustadz Abu Harist Ainun Novi, Lc.' },
  { hari: 'Kamis', jam: '10.00', kitab: 'PELAJARAN PENTING BAGI WANITA MUSLIMAH', ustadz: 'Ustadz Anwari Ahmad' },
  { hari: 'Kamis', jam: '13.00', kitab: 'PENYAKIT-PENYAKIT LISAN', ustadz: 'Ustadz Yahya Najaty, Lc.' },
  { hari: 'Kamis', jam: '15.45', kitab: 'FIQH AL-WAJIZ', ustadz: 'Ustadz Ma\'ruf Nur Salam, Lc.' },
  { hari: 'Kamis', jam: '18.00', kitab: 'RISALAH AT TABUKIYAH IBNUL QOYYIM', ustadz: 'Ustadz Abu Rima, Lc.' },
  { hari: 'Kamis', jam: '18.00', kitab: 'TAFSIR AL-QUR\'AN SYEKH AS-SA\'ADI', ustadz: 'Ustadz Aunus Shofi' },
  { hari: 'Kamis', jam: '20.00', kitab: 'AD-DAA\' WA AD-DAWAA\'', ustadz: 'Ustadz Abu Rima, Lc.' },

  // JUM'AT
  { hari: 'Jum\'at', jam: '05.00', kitab: 'TAMAN BAGI ORANG-ORANG SHOLEH', ustadz: 'Ustadz Shofwu Mi\'wan, Lc.' },
  { hari: 'Jum\'at', jam: '18.00', kitab: 'MUKHTASOR TADZKIRATUS SAMI\' WAL MUTAKALLIM', ustadz: 'Ustadz Ahmad Sabiq, Lc.' },
  { hari: 'Jum\'at', jam: '20.00', kitab: 'TAFSIR AL-QUR\'AN (TAFSIR JALALAIN)', ustadz: 'Ustadz Ahmad Sabiq, Lc.' },
];