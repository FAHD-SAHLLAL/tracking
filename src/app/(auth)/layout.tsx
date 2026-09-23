import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(15,118,110,0.16),_transparent_55%),linear-gradient(180deg,#f3f7f6,#e8eef0)]" />
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-heading text-3xl font-semibold text-teal-950">
            Rythme
          </Link>
          <p className="mt-1 text-sm text-teal-900/60">Votre rythme, clairement.</p>
        </div>
        <div className="rounded-3xl border border-teal-900/8 bg-white/80 p-6 shadow-sm backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
