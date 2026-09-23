import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(15,118,110,0.22),_transparent_50%),radial-gradient(ellipse_at_90%_20%,_rgba(3,105,161,0.18),_transparent_45%),linear-gradient(165deg,#0b1f1c_0%,#12332e_40%,#0f2a38_100%)]" />
      <div className="pointer-events-none absolute -left-20 top-40 h-80 w-80 rounded-full bg-teal-400/25 blur-3xl motion-safe:animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-heading text-2xl font-semibold tracking-tight text-teal-50">
          Rythme
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-teal-50 hover:bg-white/10 hover:text-white"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Connexion
          </Button>
          <Button
            className="bg-teal-50 text-teal-950 hover:bg-white"
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            Commencer
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 pb-20 pt-10 md:pt-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-teal-50 md:text-6xl">
            Rythme
          </h1>
          <p className="text-xl font-medium text-teal-100/90 md:text-2xl">
            Des habitudes tenables, mesurées sans vanity metrics.
          </p>
          <p className="max-w-lg text-base text-teal-100/70">
            Cochez le jour, suivez vos séries dans votre fuseau, lisez un calendrier
            honnête. Pensé mobile-first, prêt pour Vercel + Supabase.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-teal-50 text-teal-950 hover:bg-white"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Créer mon espace
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-teal-100/30 bg-transparent text-teal-50 hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              J&apos;ai déjà un compte
            </Button>
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-sm md:mt-8">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-teal-950/80 to-slate-900/90 p-6 md:p-10">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { t: "Aujourd'hui", d: "Progression claire, coche instantanée." },
                { t: "Calendrier", d: "Succès, partiel, manqué — sans fard." },
                { t: "Stats utiles", d: "Taux, séries, évolution hebdo." },
              ].map((item) => (
                <div key={item.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-heading text-lg text-teal-50">{item.t}</p>
                  <p className="mt-1 text-sm text-teal-100/65">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
