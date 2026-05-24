'use client';

import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [hasNotifications] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 h-16 px-6 bg-background/80 backdrop-blur-sm border-b border-border">
      {/* Título da página */}
      {title && (
        <h2 className="text-base font-semibold text-foreground shrink-0">{title}</h2>
      )}
      {title && <Separator orientation="vertical" className="h-5" />}

      {/* Busca rápida */}
      <div className="relative hidden md:flex flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar livro, usuário..."
          className="pl-9 h-9 text-sm bg-muted/40 border-muted"
        />
      </div>

      <div className="flex-1" />

      {/* Ações do header */}
      <div className="flex items-center gap-1">
        {/* Alternar tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notificações */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
          )}
        </Button>
      </div>
    </header>
  );
}
