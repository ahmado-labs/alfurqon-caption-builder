'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Aktivitas yang dianggap "sedang dipakai"
const EVENT_AKTIVITAS = ['mousemove', 'mousedown', 'click', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;

/**
 * Memanggil onTimeout jika tidak ada aktivitas selama idleMs.
 * Sebelum itu, selama warnMs terakhir, sisaDetik terisi untuk menampilkan peringatan.
 * Aktivitas apa pun (gerak mouse, klik, ketik, scroll, sentuh) membatalkan peringatan.
 */
export function useIdleTimeout(
  onTimeout: () => void,
  idleMs: number = 30 * 60 * 1000,
  warnMs: number = 60 * 1000
) {
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);
  const lastActivity = useRef<number>(0);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  const tetapDisini = useCallback(() => {
    lastActivity.current = Date.now();
    setSisaDetik(null);
  }, []);

  useEffect(() => {
    lastActivity.current = Date.now();

    EVENT_AKTIVITAS.forEach(ev => window.addEventListener(ev, tetapDisini, { passive: true, capture: true }));

    // Memakai selisih waktu (bukan satu setTimeout panjang) agar tetap akurat
    // walau tab di latar belakang atau PC sempat tidur.
    const timer = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle >= idleMs) {
        clearInterval(timer);
        onTimeoutRef.current();
      } else if (idle >= idleMs - warnMs) {
        setSisaDetik(Math.ceil((idleMs - idle) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      EVENT_AKTIVITAS.forEach(ev => window.removeEventListener(ev, tetapDisini, { capture: true }));
    };
  }, [idleMs, warnMs, tetapDisini]);

  return { sisaDetik, tetapDisini };
}
