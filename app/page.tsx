'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '@/types/schedule';
import { MASTER_SCHEDULES } from '@/utils/schedulesData';
import { getTodayMasehi, getTodayDayName, getTodayHijri } from '@/utils/dateUtils';
import { 
  getFormattedDateInput, 
  getDayNameFromDateString, 
  getFullMasehiFromDateString 
} from '@/utils/dateFormatter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Copy, Check, Trash2, Video, Sparkles, Calendar, Eye, RefreshCw, Plus, Minus, Clipboard } from 'lucide-react';
import { 
  generateStandardTitle, 
  generateTematikTitle, 
  generateCaptionText, 
  toTitleCase, 
  stripMarkdown
} from '@/utils/generator';

type PreviewTab = 'studio' | 'masjid' | 'konsultasi' | 'program_anak' | 'tematik';

export default function AppDashboard() {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Selasa');
  const [activeTab, setActiveTab] = useState<PreviewTab>('studio');
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  
  // State untuk melacak ID/Key unik kajian yang sedang aktif
  const [currentScheduleKey, setCurrentScheduleKey] = useState<string>('');

  // State untuk kontrol Date Picker Kalender (format: YYYY-MM-DD)
  const [pickerDate, setPickerDate] = useState<string>(getFormattedDateInput());
  
  const [formData, setFormData] = useState<ScheduleItem>({
    id: '1',
    hari: 'Selasa',
    tanggalMasehi: '',
    tanggalHijri: '',
    jam: '07.30',
    pertemuanKe: '0',
    tema: "Judul Kajian / Tema Kajian",
    kitab: 'Nama Kitab / Materi Kajian',
    ustadz: 'Ustadz Fulan Lc. حَفِظَهُ اللهُ تَعَالَى',
    youtubeUrl: '',
    facebookUrl: '',
    isTematik: false,
    narsumTematik: '',
    kategoriTematik: 'Kegiatan apa?',
    kategori: 'studio',
    createdAt: Date.now(),
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper fungsi untuk memperbarui seluruh tanggal (Hari, Masehi, Hijriah) dari objek Date
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

  // Apabila offset Hijriah diubah (+ / -), hitung ulang Hijriah berdasarkan tanggal yang sedang aktif di picker
  useEffect(() => {
    if (pickerDate) {
      const currentDate = new Date(pickerDate + 'T00:00:00');
      setFormData(prev => ({
        ...prev,
        tanggalHijri: getTodayHijri(hijriOffset, currentDate)
      }));
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

  // Handler Tombol Sync / Reset Ke Hari Ini
  const handleSyncDate = () => {
    const today = new Date();
    setPickerDate(getFormattedDateInput(today));
    applyDateChange(today, hijriOffset);
  };

  // HANDLER PILIH JADWAL KAJIAN (AMBIL DATA TERAKHIR TANPA AUTO +1)
  const handleSelectSchedule = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (isNaN(index)) return;

    const selected = filteredSchedules[index];
    if (selected) {
      const category = selected.kategori || 'studio';
      
      // Buat Kunci Unik berdasarkan Nama Kitab
      const scheduleKey = `pertemuan_${selected.kitab.replace(/\s+/g, '_')}`;
      setCurrentScheduleKey(scheduleKey);

      // Ambil nilai pertemuan terakhir dari localStorage (jika belum ada, default ke "1")
      const savedPertemuan = localStorage.getItem(scheduleKey) || '1';

      setFormData(prev => ({
        ...prev,
        jam: selected.jam,
        kitab: selected.kitab,
        ustadz: selected.ustadz,
        tema: selected.kitab,
        pertemuanKe: savedPertemuan,
        kategori: category
      }));

      if (category === 'konsultasi') setActiveTab('konsultasi');
      else if (category === 'program_anak') setActiveTab('program_anak');
      else setActiveTab('studio');
    }
  };

  // Handler saat nomor "Pertemuan Ke" diubah (ketik manual atau tombol +1 / -1)
  const handlePertemuanChange = (value: string) => {
    setFormData(prev => ({ ...prev, pertemuanKe: value }));
    
    // Langsung update nilai ke localStorage
    if (currentScheduleKey && value !== '') {
      localStorage.setItem(currentScheduleKey, value);
    }
  };

  // Handler Tombol Pintas Tambah / Kurang Pertemuan
  const handleIncrementPertemuan = (delta: number) => {
    const currentNum = parseInt(formData.pertemuanKe || '0');
    const newNum = Math.max(1, (isNaN(currentNum) ? 0 : currentNum) + delta).toString();
    handlePertemuanChange(newNum);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Handler untuk Paste Link dari Clipboard secara Otomatis
  const handlePasteLink = async (field: 'youtubeUrl' | 'facebookUrl') => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData(prev => ({
        ...prev,
        [field]: text
      }));
    } catch (err) {
      console.error('Gagal membaca clipboard:', err);
      alert('Akses clipboard ditolak atau tidak didukung oleh browser.');
    }
  };

  const filteredSchedules = MASTER_SCHEDULES.filter(s => s.hari === selectedDayFilter);

  const getActiveCaption = () => {
    switch (activeTab) {
      case 'studio':
        return generateCaptionText({ ...formData, isTematik: false }, 'studio');
      case 'masjid':
        return generateCaptionText({ ...formData, isTematik: false }, 'masjid');
      case 'konsultasi':
        return generateCaptionText({ ...formData, isTematik: false }, 'konsultasi');
      case 'program_anak':
        return generateCaptionText({ ...formData, isTematik: false }, 'program_anak');
      case 'tematik':
        return generateCaptionText({ ...formData, isTematik: true });
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-12">
      
      {/* HEADER UTAMA */}
      <header className="bg-alfurqon-dark text-white p-4 shadow-md border-b-2 border-alfurqon-green">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-alfurqon-gold w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Al Furqon TV | Broadcast Generator 2.4</h1>
              <p className="text-xs text-emerald-200/80">Generator Schedule & Caption Live Streaming</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= KOLOM KIRI: FORM ================= */}
        <div className="lg:col-span-5 space-y-5">
          
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
                    setFormData({...formData, hari: e.target.value});
                  }}
                  className="w-full p-2 bg-black/30 border border-alfurqon-green/40 rounded text-white font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold"
                >
                  {['Sabtu', 'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"].map(day => (
                    <option key={day} value={day} className="bg-slate-900 text-white">{day}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-emerald-100 mb-1 font-semibold">2. Pilih Jadwal Kajian</label>
                <select 
                  onChange={handleSelectSchedule}
                  defaultValue=""
                  className="w-full p-2 bg-black/30 border border-alfurqon-green/40 rounded text-white font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-300">-- Pilih Jadwal --</option>
                  {filteredSchedules.map((item, idx) => (
                    <option key={idx} value={idx} className="bg-slate-900 text-white">
                      [{item.jam}] {item.kitab.substring(0, 25)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl shadow-sm border border-card-border space-y-3">
            <h2 className="font-bold text-sm border-b border-card-border pb-2 flex justify-between items-center">
              <span>📝 FORM DATA KAJIAN</span>
              <button 
                onClick={() => setFormData({...formData, tema: '', youtubeUrl: '', facebookUrl: '', kitab: '', pertemuanKe: ''})}
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
                  onChange={(e) => setFormData({...formData, hari: e.target.value})}
                  className="w-full p-2 bg-background border border-card-border rounded font-medium focus:ring-2 focus:ring-alfurqon-green outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-background/50 p-2.5 rounded-lg border border-card-border">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Tanggal Masehi</label>
                <input 
                  type="text" 
                  value={formData.tanggalMasehi} 
                  onChange={(e) => setFormData({...formData, tanggalMasehi: e.target.value})}
                  className="w-full p-2 bg-card border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none font-semibold" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold opacity-80">Tanggal Hijriah</label>
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
                <input 
                  type="text" 
                  value={formData.tanggalHijri} 
                  onChange={(e) => setFormData({...formData, tanggalHijri: e.target.value})}
                  className="w-full p-2 bg-card border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none font-semibold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold mb-1">Jam (WIB)</label>
                <input 
                  type="text" 
                  value={formData.jam} 
                  onChange={(e) => setFormData({...formData, jam: e.target.value})}
                  className="w-full p-2 bg-background border border-card-border rounded font-medium focus:ring-2 focus:ring-alfurqon-green outline-none" 
                />
              </div>

              {/* INPUT PERTEMUAN KE + TOMBOL PINTS (+1 / -1) */}
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
            </div>

            <div className="text-xs">
              <label className="block font-semibold mb-1">Judul / Tema Kajian</label>
              <input 
                type="text" 
                value={formData.tema} 
                onChange={(e) => setFormData({
                  ...formData, 
                  tema: toTitleCase(e.target.value)
                })}
                placeholder="misal: rukun-rukun sholat"
                className="w-full p-2 bg-background border border-card-border rounded font-bold text-alfurqon-green dark:text-alfurqon-lightgreen focus:ring-2 focus:ring-alfurqon-green outline-none" 
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold mb-1">Pembahasan Kitab</label>
              <input 
                type="text" 
                value={formData.kitab || ''} 
                onChange={(e) => setFormData({...formData, kitab: e.target.value})}
                className="w-full p-2 bg-background border border-card-border rounded focus:ring-2 focus:ring-alfurqon-green outline-none" 
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold mb-1">Ustadz / Pemateri Harian</label>
              <input 
                type="text" 
                value={formData.ustadz} 
                onChange={(e) => setFormData({...formData, ustadz: e.target.value})}
                className="w-full p-2 bg-background border border-card-border rounded font-semibold text-alfurqon-green dark:text-alfurqon-lightgreen focus:ring-2 focus:ring-alfurqon-green outline-none" 
              />
            </div>

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
                  onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                  placeholder="https://facebook.com/..."
                  className="w-full p-2 bg-background border border-card-border rounded text-blue-500 focus:ring-2 focus:ring-alfurqon-green outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="bg-alfurqon-gold/10 p-4 rounded-xl border border-alfurqon-gold/30 space-y-3 text-xs">
            <h3 className="font-bold text-alfurqon-gold uppercase tracking-wider">
              Khusus Tematik / Tabligh Akbar / Kajian Spesial
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block font-semibold mb-1">Narsum / Ustadz Khusus</label>
                <input 
                  type="text" 
                  value={formData.narsumTematik || ''} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    narsumTematik: toTitleCase(e.target.value)
                  })}
                  placeholder="misal: Ustadz Ahmad Mahmud M.A."
                  className="w-full p-2 bg-card border border-alfurqon-gold/40 rounded font-semibold outline-none focus:ring-2 focus:ring-alfurqon-gold" 
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jenis Kegiatan</label>
                <input 
                  type="text" 
                  value={formData.kategoriTematik || ''} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    kategoriTematik: toTitleCase(e.target.value)
                  })}
                  className="w-full p-2 bg-card border border-alfurqon-gold/40 rounded outline-none focus:ring-2 focus:ring-alfurqon-gold" 
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

            {/* Title Standard */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-alfurqon-green dark:text-alfurqon-lightgreen">📌 Title Standard (Harian):</span>
                <button
                  onClick={() => handleCopy(generateStandardTitle(formData), 'title_std')}
                  className="px-2 py-0.5 bg-alfurqon-green hover:bg-alfurqon-lightgreen text-white rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'title_std' ? <Check className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  Salin Judul Standard
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 text-alfurqon-lightgreen font-mono text-xs rounded-lg break-all border border-slate-800">
                {generateStandardTitle(formData)}
              </div>
            </div>

            {/* Title Tematik */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-alfurqon-gold">✨ Title Tematik / Tabligh Akbar / Kajian Spesial:</span>
                <button
                  onClick={() => handleCopy(generateTematikTitle(formData), 'title_tematik')}
                  className="px-2 py-0.5 bg-alfurqon-gold hover:bg-amber-600 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'title_tematik' ? <Check className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  Salin Judul Tematik
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 text-alfurqon-gold font-mono text-xs rounded-lg break-all border border-slate-800">
                {generateTematikTitle(formData)}
              </div>
            </div>
          </div>

          {/* MAIN CAPTION PREVIEW */}
          <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
            
            {/* TABS KATEGORI */}
            <div className="bg-slate-900 p-2 flex flex-wrap gap-1 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'studio' ? 'bg-alfurqon-green text-white shadow' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                1. Studio
              </button>

              <button
                onClick={() => setActiveTab('masjid')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'masjid' ? 'bg-alfurqon-green text-white shadow' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                2. Masjid
              </button>

              <button
                onClick={() => setActiveTab('konsultasi')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'konsultasi' ? 'bg-alfurqon-lightgreen text-slate-900 shadow font-bold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                3. Konsultasi
              </button>

              <button
                onClick={() => setActiveTab('program_anak')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'program_anak' ? 'bg-alfurqon-lightgreen text-slate-900 shadow font-bold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                4. Program Anak
              </button>

              <button
                onClick={() => setActiveTab('tematik')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'tematik' ? 'bg-alfurqon-gold text-slate-900 shadow font-bold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                5. Tematik / Tabligh Akbar / Kajian Spesial
              </button>
            </div>

            <div className="p-4 flex flex-col h-125">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-alfurqon-green" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Preview Caption: {activeTab.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(stripMarkdown(getActiveCaption()), `copy_clean_${activeTab}`)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-semibold rounded-lg text-xs shadow flex items-center gap-1.5 transition cursor-pointer"
                    title="Salin tanpa tanda * dan _"
                  >
                    {copiedKey === `copy_clean_${activeTab}` ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" /> Polosan Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Polosan FB
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(getActiveCaption(), `copy_${activeTab}`)}
                    className="px-3 py-2 bg-alfurqon-green hover:bg-alfurqon-lightgreen active:scale-95 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === `copy_${activeTab}` ? (
                      <>
                        <Check className="w-4 h-4" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Salin Share WA
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea 
                readOnly 
                value={getActiveCaption()}
                className="w-full flex-1 p-3 bg-background border border-card-border rounded-lg text-xs font-mono leading-relaxed resize-none focus:outline-none"
              />
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}