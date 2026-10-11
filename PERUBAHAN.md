# Perubahan v3.0: alur kategori

Alur baru: Home (pilih kategori) -> form kategori -> periksa Hijriah -> salin -> Selesai -> Home.

## File baru
- `utils/categories.ts` : daftar 5 kategori dan field yang tampil di tiap form
- `components/CaptionForm.tsx` : form bersama untuk semua kategori (isi dari page.tsx lama)
- `components/AppHeader.tsx` : header bersama
- `app/studio`, `app/masjid`, `app/konsultasi`, `app/program-anak`, `app/tematik` : satu halaman per kategori

## File diubah
- `app/page.tsx` : sekarang Home (5 kartu kategori)

## Perilaku
- Tab kategori dihapus; kategori ditentukan di Home dan tidak berubah di form.
- Tombol salin (Share WA dan Polosan FB) terkunci sampai kotak "Tanggal Hijriah sudah saya periksa" dicentang.
- Centang batal otomatis jika hari, tanggal Masehi/Hijriah, atau jam berubah.
- Selesai: konfirmasi jika belum ada caption tersalin, lalu kembali ke Home (form kosong).
- Kembali ke Home: konfirmasi jika form sudah terisi dan belum disalin.
- Nomor pertemuan tetap tersimpan per kitab (localStorage), seperti sebelumnya.

## Otomatis kembali ke Home (tidak ada aktivitas)
- Halaman kategori kembali ke Home otomatis setelah 30 menit tanpa aktivitas (gerak mouse, klik, ketik, scroll, sentuh).
- 60 detik sebelumnya muncul peringatan dengan hitung mundur dan tombol "Tetap di sini". Aktivitas apa pun membatalkannya.
- Batas waktu diubah di `components/CaptionForm.tsx`: `useIdleTimeout(() => router.push('/'))`, parameter kedua dalam milidetik (default `30 * 60 * 1000`), ketiga lama peringatan (default 60 detik).
- Logika ada di `utils/useIdleTimeout.ts`. Halaman Home tidak memakainya.

## Catatan
Belum diuji dengan `npm run dev` (sandbox tidak punya akses jaringan untuk SWC). Lolos `tsc --noEmit`.
