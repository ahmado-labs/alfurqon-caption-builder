'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScheduleItem } from '@/types/schedule';
import { MASTER_SCHEDULES } from '@/utils/schedulesData';
import { getTodayMasehi, getTodayDayName, getTodayHijri } from '@/utils/dateUtils';
import { getFormattedDateInput } from '@/utils/dateFormatter';
import { useIdleTimeout } from '@/utils/useIdleTimeout';
import { AppHeader } from '@/components/AppHeader';
import { CATEGORIES, CategoryKey } from '@/utils/categories';
import { Copy, Check, Trash2, Video, Calendar, Eye, RefreshCw, Plus, Minus, Clipboard, HelpCircle, Lock } from 'lucide-react';
import {
  generateStandardTitle,
  generateTematikTitle,
  generateCaptionText,
  toTitleCase,
  stripMarkdown
} from '@/utils/generator';

const HARI_LIST = ['Sabtu', 'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];

// Nilai awal form, menyesuaikan field yang dipakai kategori
function buatFormAwal(kategori: CategoryKey): ScheduleItem {
  const cfg = CATEGORIES[kategori];
  return {
    id: '1',
    hari: 'Selasa',
    tanggalMasehi: '',
    tanggalHijri: '',
    jam: '07.30',
    pertemuanKe: cfg.showPertemuan ? '0' : '',
    tema: cfg.temaAwal,
    kitab: cfg.showKitab ? 'Nama Kitab / Materi Kajian' : '',
    ustadz: cfg.showUstadz ? 'Ustadz Fulan Lc. حَفِظَهُ اللهُ تَعَالَى' : '',
    youtubeUrl: '',
    facebookUrl: '',
    isTematik: kategori === 'tematik',
    narsumTematik: '',
    kategoriTematik: 'Kegiatan apa?',
    kategori: cfg.kategoriData,
    createdAt: Date.now(),
  };
}

export function CaptionForm({ kategori }: { kategori: CategoryKey }) {
  const router = useRouter();
  const cfg = CATEGORIES[kategori];

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Selasa');
  // Set angka awal selalu 0 agar Server & Browser sama-sama setuju di awal
  const [hijriOffset, setHijriOffset] = useState<number>(0);

  // Baca memori browser SETELAH halaman sukses tampil di layar
  useEffect(() => {
    const savedOffset = localStorage.getItem('alfurqon_hijri_offset');
    if (savedOffset !== null) {
      setHijriOffset(parseInt(savedOffset, 10));
    }
  }, []);

  // ID/Key unik kajian yang sedang aktif (untuk menyimpan nomor pertemuan)
  const [currentScheduleKey, setCurrentScheduleKey] = useState<string>('');

  // Date Picker Kalender (format: YYYY-MM-DD)
  const [pickerDate, setPickerDate] = useState<string>(getFormattedDateInput());

  const [formData, setFormData] = useState<ScheduleItem>(() => buatFormAwal(kategori));

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // PENGAMAN: tombol salin baru aktif setelah operator mencentang pemeriksaan Hijriah
  const [hijriChecked, setHijriChecked] = useState<boolean>(false);
  // Penanda sudah ada caption yang disalin (untuk tombol Selesai)
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Centang dibatalkan otomatis jika tanggal / hari / jam berubah setelah dicentang
  useEffect(() => {
    setHijriChecked(false);
  }, [formData.tanggalHijri, formData.tanggalMasehi, formData.hari, formData.jam]);

  // Helper untuk memperbarui seluruh tanggal (Hari, Masehi, Hijriah) dari objek Date
  const applyDateChange = (targetDate: Date, offset: number = hijriOffset) => {
    const dayName = getTodayDayName(targetDate);
    const masehiStr = getTodayMasehi(targetDate);
    const hijriStr = getTodayHijri(offset, targetDate);

    setSelectedDayFilter(dayName);
    setFormData(prev => ({
      ...prev,
      hari: dayName,
      tanggalMasehi: masehiStr,
      tanggalHijri: hijriStr
    }));
  };

  // Auto set tanggal hari ini saat halaman dimuat
  useEffect(() => {
    const today = new Date();
    setPickerDate(getFormattedDateInput(today));
    applyDateChange(today, hijriOffset);
  }, []);

  // Apabila offset Hijriah diubah (+ / -), hitung ulang Hijriah berdasarkan tanggal aktif di picker
  useEffect(() => {
    if (pickerDate) {
      const currentDate = new Date(pickerDate + 'T00:00:00');
      setFormData(prev => ({
        ...prev,
        tanggalHijri: getTodayHijri(hijriOffset, currentDate)
      }));
    }
    // SIMPAN KALIBRASI KE LOCALSTORAGE
    if (typeof window !== 'undefined') {
      localStorage.setItem('alfurqon_hijri_offset', hijriOffset.toString());
    }
  }, [hijriOffset]);

  // Handler saat Tanggal pada Kalender Diubah Manual
  const handlePickerChange = (dateValue: string) => {
    setPickerDate(dateValue);
    if (dateValue) {
      const selectedDate = new Date(dateValue + 'T00:00:00');
      applyDateChange(selectedDate, hijriOffset);
    }
  };

  // Tambah/kurangi angka tanggal Hijriah saja secara langsung
  const handleShiftHijriDayOnly = (delta: number) => {
    setFormData(prev => {
      const match = prev.tanggalHijri.match(/\d+/);
      if (!match) return prev;

      const currentNum = parseInt(match[0], 10);
      const newNum = Math.max(1, currentNum + delta);

      return {
        ...prev,
        tanggalHijri: prev.tanggalHijri.replace(/\d+/, newNum.toString())
      };
    });
  };

  // Tombol Sync / Reset Ke Hari Ini
  const handleSyncDate = () => {
    const today = new Date();
    setPickerDate(getFormattedDateInput(today));
    applyDateChange(today, hijriOffset);
  };

  const filteredSchedules = MASTER_SCHEDULES.filter(s => s.hari === selectedDayFilter);

  // PILIH JADWAL KAJIAN: kategori TIDAK berubah, ditentukan di Home
  const handleSelectSchedule = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (isNaN(index)) return;

    const selected = filteredSchedules[index];
    if (!selected) return;

    const scheduleKey = `pertemuan_${selected.kitab.replace(/\s+/g, '_')}`;
    setCurrentScheduleKey(scheduleKey);

    // Nomor pertemuan terakhir dari localStorage (default "1"), hanya untuk kategori yang memakainya
    const savedPertemuan = cfg.showPertemuan ? (localStorage.getItem(scheduleKey) || '1') : '';

    setFormData(prev => ({
      ...prev,
      jam: selected.jam,
      kitab: cfg.showKitab ? selected.kitab : '',
      ustadz: cfg.showUstadz ? selected.ustadz : prev.ustadz,
      tema: cfg.showTema ? selected.kitab : prev.tema,
      pertemuanKe: savedPertemuan,
    }));
  };

  // Nomor "Pertemuan Ke" diubah (ketik manual atau tombol +1 / -1)
  const handlePertemuanChange = (value: string) => {
    setFormData(prev => ({ ...prev, pertemuanKe: value }));
    if (currentScheduleKey && value !== '') {
      localStorage.setItem(currentScheduleKey, value);
    }
  };

  const handleIncrementPertemuan = (delta: number) => {
    const currentNum = parseInt(formData.pertemuanKe || '0');
    const newNum = Math.max(1, (isNaN(currentNum) ? 0 : currentNum) + delta).toString();
    handlePertemuanChange(newNum);
  };

  const handleCopy = (text: string, key: string, caption: boolean = false) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (caption) setHasCopied(true);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Paste Link dari Clipboard secara Otomatis
  const handlePasteLink = async (field: 'youtubeUrl' | 'facebookUrl') => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData(prev => ({ ...prev, [field]: text }));
    } catch (err) {
      console.error('Gagal membaca clipboard:', err);
      alert('Akses clipboard ditolak atau tidak didukung oleh browser.');
    }
  };

  // Otomatis kembali ke Home jika tidak ada aktivitas 30 menit (peringatan 60 detik sebelumnya)
  const { sisaDetik, tetapDisini } = useIdleTimeout(() => router.push('/'), 30 * 60 * 1000);

  // Kembali ke Home dari header: konfirmasi jika form terisi dan belum ada yang disalin
  const handleKembali = () => {
    const terisi = Boolean(formData.youtubeUrl || formData.facebookUrl || currentScheduleKey);
    if (!hasCopied && terisi) {
      const yakin = window.confirm('Form sudah terisi dan belum ada caption yang disalin. Yakin kembali ke Home? Isian akan hilang.');
      if (!yakin) return;
    }
    router.push('/');
  };

  // Selesai: form dikosongkan (halaman dibuka ulang dari Home) dan kembali ke Home
  const handleSelesai = () => {
    if (!hasCopied) {
      const yakin = window.confirm('Belum ada caption yang disalin. Yakin kembali ke Home?');
      if (!yakin) return;
    }
    router.push('/');
  };

  const caption = generateCaptionText({ ...formData, isTematik: kategori === 'tematik' }, kategori);
  const judul = kategori === 'tematik' ? generateTematikTitle(formData) : generateStandardTitle(formData);

  const kunci = !hijriChecked;
  const bannerBorder = kategori === 'tematik' ? 'border-alfurqon-gold' : 'border-alfurqon-lightgreen';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-12">

      <AppHeader
        subtitle={`Home / ${cfg.label}`}
        aksi={
          <button
            onClick={handleKembali}
            className="text-xs bg-transparent border border-alfurqon-green hover:bg-alfurqon-green px-3 py-2 rounded-lg text-white transition font-semibold cursor-pointer"
          >
            Kembali ke Home
          </button>
        }
      />

      {sisaDetik !== null && (
        <div
          role="alertdialog"
          aria-live="assertive"
          aria-label="Peringatan tidak ada aktivitas"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="bg-alfurqon-dark text-white rounded-2xl border-2 border-alfurqon-gold p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-xl font-extrabold">Tidak ada aktivitas</h2>
            <p className="text-sm leading-relaxed text-emerald-100">
              Kembali ke Home otomatis dalam <b className="text-alfurqon-gold text-lg">{sisaDetik}</b> detik.
              {!hasCopied && ' Isian yang belum disalin akan hilang.'}
            </p>
            <button
              onClick={tetapDisini}
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-alfurqon-green hover:bg-alfurqon-lightgreen text-white font-bold cursor-pointer"
            >
              Tetap di sini
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto mt-6 px-4 space-y-5">

        {/* PITA KATEGORI TERPILIH */}
        <div className={`bg-alfurqon-dark text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border-2 ${bannerBorder}`}>
          <div>
            <div className="text-xs font-bold tracking-widest text-emerald-200">KATEGORI TERPILIH</div>
            <div className="text-3xl font-extrabold">{cfg.label.toUpperCase()}</div>
          </div>
          <p className="text-sm text-emerald-100/90 max-w-md md:text-right">
            Caption dibuka dengan {cfg.pembuka}. Salah kategori? Kembali ke Home.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ================= KOLOM KIRI: FORM ================= */}
          <div className="lg:col-span-5 space-y-5">

            {/* JADWAL & TANGGAL */}
            <div className="bg-alfurqon-dark text-white p-4 rounded-xl shadow-md border border-alfurqon-green/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-alfurqon-gold" />
                  <h2 className="font-bold text-sm text-emerald-100">AUTO-FILL JADWAL & TANGGAL</h2>
                </div>
                <button
                  onClick={handleSyncDate}
                  className="text-[11px] bg-alfurqon-green hover:bg-alfurqon-lightgreen px-2.5 py-1 rounded flex items-center gap-1 text-white transition font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Sync Hari Ini
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-emerald-100 mb-1 font-semibold">1. Pilih Hari</label>
                  <select
                    value={selectedDayFilter}
                    onChange={(e) => {
                      setSelectedDayFilter(e.target.value);
                      setFormData({ ...formData, hari: e.target.value });
                    }}
                    className="w-full p-2 bg-black/30 border border-alfurqon-green/40 rounded text-white font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold"
                  >
                    {HARI_LIST.map(day => (
                      <option key={day} value={day} className="bg-slate-900 text-white">{day}</option>
                    ))}
                  </select>
                </div>

                {cfg.showJadwal && (
                  <div className="col-span-2">
                    <label className="block text-emerald-100 mb-1 font-semibold">2. Pilih Jadwal Kajian</label>
                    <select
                      key={selectedDayFilter}
                      onChange={handleSelectSchedule}
                      defaultValue=""
                      className="w-full p-2 bg-black/30 border border-alfurqon-green/40 rounded text-white font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold"
                    >
                      <option value="" disabled className="bg-slate-900 text-slate-300">-- Pilih Jadwal --</option>
                      {filteredSchedules.map((item, idx) => (
                        <option key={idx} value={idx} className="bg-slate-900 text-white">
                          [{item.jam}] {item.kitab.length > 25 ? item.kitab.substring(0, 25) + '...' : item.kitab}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* FORM DATA KAJIAN */}
            <div className="bg-card p-5 rounded-xl shadow-sm border border-card-border space-y-3">
              <h2 className="font-bold text-sm border-b border-card-border pb-2 flex justify-between items-center">
                <span>📝 FORM DATA ({cfg.label.toUpperCase()})</span>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    tema: cfg.showTema ? '' : formData.tema,
                    youtubeUrl: '',
                    facebookUrl: '',
                    kitab: cfg.showKitab ? '' : formData.kitab,
                    pertemuanKe: cfg.showPertemuan ? '' : formData.pertemuanKe,
                  })}
                  className="text-xs text-alfurqon-orange hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Reset Input
                </button>
              </h2>

              {/* INPUT KALENDER & HARI */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Pilih Tanggal Kalender</label>
                  <input
                    type="date"
                    value={pickerDate}
                    onChange={(e) => handlePickerChange(e.target.value)}
                    className="w-full p-2 bg-background border border-card-border rounded font-semibold text-alfurqon-green dark:text-alfurqon-lightgreen focus:ring-2 focus:ring-alfurqon-green outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hari</label>
                  <input
                    type="text"
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full p-2 bg-background border border-card-border rounded font-medium focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-background/50 p-2.5 rounded-lg border border-card-border">
                <div>
                  <div className="flex items-center gap-1">
                    <label className="block font-semibold mb-1 opacity-80">Tanggal Masehi</label>
                    <div className="relative flex items-center group cursor-pointer">
                      <HelpCircle className="w-3.5 h-3.5 text-alfurqon-gold hover:text-amber-400 transition" />
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-2.5 bg-slate-900 text-white text-[11px] leading-tight rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700">
                        <p className="font-bold text-alfurqon-gold mb-1">📌 Info Pergantian Hari:</p>
                        <p>Tanggal Masehi akan berubah saat hari berikutnya setelah pukul 00:00</p>
                        <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={formData.tanggalMasehi}
                    onChange={(e) => setFormData({ ...formData, tanggalMasehi: e.target.value })}
                    className="w-full p-2 bg-card border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none font-semibold"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <label className="font-semibold opacity-80">Tanggal Hijriah</label>
                      <div className="relative flex items-center group cursor-pointer">
                        <HelpCircle className="w-3.5 h-3.5 text-alfurqon-gold hover:text-amber-400 transition" />
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-2.5 bg-slate-900 text-white text-[11px] leading-tight rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700">
                          <p className="font-bold text-alfurqon-gold mb-1">📌 Info Pergantian Hari:</p>
                          <p>Sistem penanggalan Islam, hari berganti saat <b>Maghrib</b>. Jadi, untuk kajian Maghrib & Malam, sementara sesuaikan tanggal Hijriah (+1) yang di dalam form, bukan yang diluar. Yang luar Khusus <b>kalibrasi kalender</b>.</p>
                          <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setHijriOffset(prev => prev - 1)}
                        className="bg-card-border hover:bg-alfurqon-green hover:text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                        title="Kurangi 1 hari Hijriah"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setHijriOffset(prev => prev + 1)}
                        className="bg-card-border hover:bg-alfurqon-green hover:text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                        title="Tambah 1 hari Hijriah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center border border-card-border rounded overflow-hidden bg-card focus-within:ring-2 focus-within:ring-alfurqon-green">
                    <button
                      type="button"
                      onClick={() => handleShiftHijriDayOnly(-1)}
                      className="px-2.5 py-2 bg-card-border/50 hover:bg-alfurqon-green hover:text-white transition font-bold text-xs cursor-pointer text-foreground"
                      title="Kurangi tanggal Hijriah (-1)"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      value={formData.tanggalHijri}
                      onChange={(e) => setFormData({ ...formData, tanggalHijri: e.target.value })}
                      className="w-full p-2 bg-card border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleShiftHijriDayOnly(1)}
                      className="px-2.5 py-2 bg-card-border/50 hover:bg-alfurqon-green hover:text-white transition font-bold text-xs cursor-pointer text-foreground"
                      title="Tambah tanggal Hijriah (+1 untuk Maghrib/Malam)"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-amber-500 mt-1">
                    <strong>Kalibrasi Kalender:</strong> {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} hari dari Kalender Global.
                  </div>
                  <div className="text-[10px] text-amber-500 mt-1">
                    <strong> Periksa & sesuaikan jika ada perbedaan!</strong>
                  </div>
                </div>
              </div>

              <div className={`grid gap-2 text-xs ${cfg.showPertemuan ? 'grid-cols-3' : 'grid-cols-1'}`}>
                <div className={cfg.showPertemuan ? 'col-span-2' : ''}>
                  <label className="block font-semibold mb-1">Jam (WIB)</label>
                  <input
                    type="text"
                    value={formData.jam}
                    onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                    className="w-full p-2 bg-background border border-card-border rounded font-medium focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>

                {cfg.showPertemuan && (
                  <div>
                    <label className="block font-semibold mb-1 text-alfurqon-green dark:text-alfurqon-lightgreen">
                      Pertemuan Ke
                    </label>
                    <div className="flex items-center border border-alfurqon-green/50 rounded overflow-hidden bg-background">
                      <button
                        type="button"
                        onClick={() => handleIncrementPertemuan(-1)}
                        className="px-2 py-2 bg-card-border/50 hover:bg-alfurqon-green hover:text-white transition font-bold text-xs cursor-pointer"
                        title="Kurangi pertemuan (-1)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        value={formData.pertemuanKe || ''}
                        onChange={(e) => handlePertemuanChange(e.target.value)}
                        className="w-full p-2 text-center font-bold text-alfurqon-green dark:text-alfurqon-lightgreen outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrementPertemuan(1)}
                        className="px-2 py-2 bg-alfurqon-green hover:bg-alfurqon-lightgreen text-white transition font-bold text-xs cursor-pointer"
                        title="Lanjut pertemuan berikutnya (+1)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {cfg.showTema && (
                <div className="text-xs">
                  <label className="block font-semibold mb-1">Judul / Tema Kajian</label>
                  <input
                    type="text"
                    value={formData.tema}
                    onChange={(e) => setFormData({ ...formData, tema: toTitleCase(e.target.value) })}
                    placeholder="misal: rukun-rukun sholat"
                    className="w-full p-2 bg-background border border-card-border rounded font-bold text-alfurqon-green dark:text-alfurqon-lightgreen focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>
              )}

              {cfg.showKitab && (
                <div className="text-xs">
                  <label className="block font-semibold mb-1">Pembahasan Kitab</label>
                  <input
                    type="text"
                    value={formData.kitab || ''}
                    onChange={(e) => setFormData({ ...formData, kitab: e.target.value })}
                    className="w-full p-2 bg-background border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>
              )}

              {cfg.showUstadz && (
                <div className="text-xs">
                  <label className="block font-semibold mb-1">Ustadz / Pemateri Harian</label>
                  <input
                    type="text"
                    value={formData.ustadz}
                    onChange={(e) => setFormData({ ...formData, ustadz: e.target.value })}
                    className="w-full p-2 bg-background border border-card-border rounded font-semibold text-alfurqon-green dark:text-alfurqon-lightgreen focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>
              )}

              {cfg.showTematik && (
                <div className="bg-alfurqon-gold/10 p-3 rounded-lg border border-alfurqon-gold/30 space-y-2 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Narsum / Ustadz Khusus</label>
                    <input
                      type="text"
                      value={formData.narsumTematik || ''}
                      onChange={(e) => setFormData({ ...formData, narsumTematik: toTitleCase(e.target.value) })}
                      placeholder="misal: Ustadz Ahmad Mahmud M.A."
                      className="w-full p-2 bg-card border border-alfurqon-gold/40 rounded font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Jenis Kegiatan</label>
                    <input
                      type="text"
                      value={formData.kategoriTematik || ''}
                      onChange={(e) => setFormData({ ...formData, kategoriTematik: toTitleCase(e.target.value) })}
                      className="w-full p-2 bg-card border border-alfurqon-gold/40 rounded outline-none focus:ring-2 focus:ring-alfurqon-gold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {/* INPUT YOUTUBE */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-red-500">Link YouTube</label>
                    <button
                      type="button"
                      onClick={() => handlePasteLink('youtubeUrl')}
                      className="text-[10px] bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer font-medium"
                      title="Paste link dari clipboard"
                    >
                      <Clipboard className="w-3 h-3" /> Paste
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.youtubeUrl || ''}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/live/..."
                    className="w-full p-2 bg-background border border-card-border rounded text-blue-500 focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>

                {/* INPUT FACEBOOK */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-blue-500">Link Facebook</label>
                    <button
                      type="button"
                      onClick={() => handlePasteLink('facebookUrl')}
                      className="text-[10px] bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer font-medium"
                      title="Paste link dari clipboard"
                    >
                      <Clipboard className="w-3 h-3" /> Paste
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.facebookUrl || ''}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full p-2 bg-background border border-card-border rounded text-blue-500 focus:ring-2 focus:ring-alfurqon-green outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= KOLOM KANAN: PREVIEW PANEL ================= */}
          <div className="lg:col-span-7 space-y-4">

            {/* PREVIEW TITLE BOX */}
            <div className="bg-card p-4 rounded-xl border border-card-border shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-card-border pb-1 opacity-80">
                Preview Title Youtube & Facebook (Judul Siaran Langsung)
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className={`font-bold ${kategori === 'tematik' ? 'text-alfurqon-gold' : 'text-alfurqon-green dark:text-alfurqon-lightgreen'}`}>
                    {kategori === 'tematik' ? '✨ Title Tematik / Tabligh Akbar / Kajian Spesial:' : '📌 Title Standard (Harian):'}
                  </span>
                  <button
                    onClick={() => handleCopy(judul, 'title')}
                    className={`px-2 py-0.5 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      kategori === 'tematik' ? 'bg-alfurqon-gold hover:bg-amber-600' : 'bg-alfurqon-green hover:bg-alfurqon-lightgreen'
                    }`}
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    Salin Judul
                  </button>
                </div>
                <div className={`p-2.5 bg-slate-900 font-mono text-xs rounded-lg break-all border border-slate-800 ${
                  kategori === 'tematik' ? 'text-alfurqon-gold' : 'text-alfurqon-lightgreen'
                }`}>
                  {judul}
                </div>
              </div>
            </div>

            {/* MAIN CAPTION PREVIEW */}
            <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">

              <div className="bg-slate-900 p-3 flex items-center gap-2 border-b border-slate-800">
                <Eye className="w-4 h-4 text-alfurqon-lightgreen" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Preview Caption: {cfg.label}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <textarea
                  readOnly
                  value={caption}
                  className="w-full h-80 p-3 bg-background border border-card-border rounded-lg text-xs font-mono leading-relaxed resize-none focus:outline-none"
                />

                {/* PENGAMAN HIJRIAH */}
                <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-alfurqon-gold bg-alfurqon-gold/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hijriChecked}
                    onChange={(e) => setHijriChecked(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-alfurqon-green cursor-pointer shrink-0"
                  />
                  <span className="text-xs leading-relaxed">
                    <b className="block text-sm">Tanggal Hijriah sudah saya periksa</b>
                    Tertulis: <b>{formData.tanggalHijri} H</b>. Kajian setelah Maghrib? Geser +1.
                    Cocokkan juga dengan kalender nasional. Centang untuk mengaktifkan tombol salin.
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={kunci}
                    onClick={() => handleCopy(stripMarkdown(caption), `copy_clean_${kategori}`, true)}
                    className={`px-3 py-3 font-semibold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 transition ${
                      kunci
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 active:scale-95 text-white cursor-pointer'
                    }`}
                    title={kunci ? 'Centang pemeriksaan Hijriah dulu' : 'Salin tanpa tanda * dan _'}
                  >
                    {kunci ? (
                      <><Lock className="w-4 h-4" /> Polosan FB (terkunci)</>
                    ) : copiedKey === `copy_clean_${kategori}` ? (
                      <><Check className="w-4 h-4 text-emerald-400" /> Polosan Tersalin!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Polosan FB</>
                    )}
                  </button>

                  <button
                    disabled={kunci}
                    onClick={() => handleCopy(caption, `copy_${kategori}`, true)}
                    className={`px-3 py-3 font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 transition ${
                      kunci
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-alfurqon-green hover:bg-alfurqon-lightgreen active:scale-95 text-white cursor-pointer'
                    }`}
                    title={kunci ? 'Centang pemeriksaan Hijriah dulu' : 'Salin dengan format WhatsApp'}
                  >
                    {kunci ? (
                      <><Lock className="w-4 h-4" /> Salin Share WA (terkunci)</>
                    ) : copiedKey === `copy_${kategori}` ? (
                      <><Check className="w-4 h-4" /> Tersalin!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Salin Share WA</>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-xs opacity-80 max-w-sm">
                    Tombol Selesai aktif setelah ada caption yang tersalin. Form dikosongkan dan kembali ke Home.
                  </p>
                  <button
                    onClick={handleSelesai}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition cursor-pointer ${
                      hasCopied
                        ? 'bg-alfurqon-dark text-white hover:bg-alfurqon-green'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    Selesai & kembali ke Home
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
