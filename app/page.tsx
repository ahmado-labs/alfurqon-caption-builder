import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { CATEGORY_LIST } from '@/utils/categories';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <AppHeader subtitle="Generator Schedule & Caption Live Streaming" />

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-7">
        <div>
          <div className="text-sm font-bold tracking-widest text-alfurqon-green dark:text-alfurqon-lightgreen">
            LANGKAH PERTAMA
          </div>
          <h2 className="mt-1 mb-2 text-3xl font-extrabold">Ente Mau Ngeshare Apa?</h2>
          <p className="opacity-80">
            Pilih kategorinya dulu. Form dan caption akan menyesuaikan, sehingga caption yang tersalin
            pasti sesuai jenis siarannya. Mantap kan? 🫰🏻
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORY_LIST.map((c, i) => {
            const tematik = c.key === 'tematik';
            return (
              <Link
                key={c.key}
                href={`/${c.slug}`}
                className={`flex flex-col gap-3 p-6 rounded-2xl border-2 min-h-44 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-alfurqon-gold ${
                  tematik
                    ? 'bg-alfurqon-gold/15 border-alfurqon-gold'
                    : 'bg-card border-card-border'
                }`}
              >
                <b className="text-2xl font-extrabold">{i + 1}. {c.label}</b>
                <span className="text-[15px] leading-relaxed">{c.deskripsi}</span>
                <span
                  className={`mt-auto self-start px-4 py-2.5 rounded-lg text-sm font-bold ${
                    tematik ? 'bg-alfurqon-gold text-slate-900' : 'bg-alfurqon-dark text-white'
                  }`}
                >
                  Pilih {tematik ? 'Tematik' : c.label}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
