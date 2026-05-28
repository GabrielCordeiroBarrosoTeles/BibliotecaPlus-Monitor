'use client';

import { Search, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBell } from './NotificationBell';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/dashboard/books':        'Livros',
  '/dashboard/documents':    'Acervo Digital',
  '/dashboard/loans':        'Empréstimos',
  '/dashboard/reservations': 'Reservas',
  '/dashboard/fines':        'Multas',
  '/dashboard/users':        'Usuários',
  '/dashboard/settings':     'Configurações',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  const pageTitle = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1]
    ?? 'BibliotecaPlus';

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 h-16 px-4 md:px-6 bg-background/90 backdrop-blur-md border-b border-border shrink-0">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden h-9 w-9 text-muted-foreground shrink-0"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      <h1 className="text-[15px] font-semibold text-foreground tracking-tight shrink-0">
        {pageTitle}
      </h1>

      {/* Separator */}
      <div className="hidden md:block h-5 w-px bg-border mx-1 shrink-0" />

      {/* Search */}
      <div className="relative hidden md:flex flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar livro, usuário..."
          className="pl-9 h-9 text-sm bg-muted/40 border-muted focus-visible:ring-1 focus-visible:ring-primary/40"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-muted bg-muted/60">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <NotificationBell />
      </div>
    </header>
  );
}
