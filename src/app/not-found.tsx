import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="BibliotecaPlus" className="h-16 w-auto object-contain" />
        </div>

        {/* 404 */}
        <div className="space-y-2">
          <p className="text-8xl font-black text-white/20 leading-none select-none">404</p>
          <h1 className="text-2xl font-bold text-white">Página não encontrada</h1>
          <p className="text-white/70 text-sm leading-relaxed">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
