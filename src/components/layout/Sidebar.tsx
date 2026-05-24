'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BookOpen,
  Users,
  FileText,
  Home,
  BookMarked,
  AlertTriangle,
  Search,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    roles: ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT'],
  },
  {
    href: '/dashboard/books',
    label: 'Livros',
    icon: BookOpen,
    roles: ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT'],
  },
  {
    href: '/dashboard/loans',
    label: 'Empréstimos',
    icon: BookMarked,
    roles: ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT'],
  },
  {
    href: '/dashboard/reservations',
    label: 'Reservas',
    icon: Search,
    roles: ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT'],
  },
  {
    href: '/dashboard/fines',
    label: 'Multas',
    icon: AlertTriangle,
    roles: ['ADMIN', 'LIBRARIAN'],
  },
  {
    href: '/dashboard/documents',
    label: 'Acervo Digital',
    icon: FileText,
    roles: ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT'],
  },
  {
    href: '/dashboard/users',
    label: 'Usuários',
    icon: Users,
    roles: ['ADMIN', 'LIBRARIAN'],
  },
  {
    href: '/dashboard/settings',
    label: 'Configurações',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  LIBRARIAN: 'Bibliotecário',
  PROFESSOR: 'Professor',
  STUDENT: 'Aluno',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role ?? ''));

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex flex-col w-64 min-h-screen bg-card border-r border-border">
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BibliotecaPlus" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
              BibliotecaPlus
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {roleLabels[user?.role ?? ''] ?? user?.role}
            </p>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* ── User section ───────────────────────────────────────────────── */}
        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <Separator />

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair da conta
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
