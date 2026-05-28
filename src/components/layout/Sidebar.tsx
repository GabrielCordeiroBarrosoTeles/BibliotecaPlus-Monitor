'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BookOpen,
  Users,
  FileText,
  LayoutDashboard,
  BookMarked,
  AlertTriangle,
  CalendarSearch,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Geral',
    items: [
      { href: '/dashboard',             label: 'Dashboard',      icon: LayoutDashboard, roles: ['ADMIN','LIBRARIAN','PROFESSOR','STUDENT'] },
      { href: '/dashboard/books',        label: 'Livros',         icon: BookOpen,        roles: ['ADMIN','LIBRARIAN','PROFESSOR','STUDENT'] },
      { href: '/dashboard/documents',    label: 'Acervo Digital', icon: FileText,        roles: ['ADMIN','LIBRARIAN','PROFESSOR','STUDENT'] },
    ],
  },
  {
    label: 'Circulação',
    items: [
      { href: '/dashboard/loans',        label: 'Empréstimos',   icon: BookMarked,     roles: ['ADMIN','LIBRARIAN','PROFESSOR','STUDENT'] },
      { href: '/dashboard/reservations', label: 'Reservas',      icon: CalendarSearch, roles: ['ADMIN','LIBRARIAN','PROFESSOR','STUDENT'] },
      { href: '/dashboard/fines',        label: 'Multas',        icon: AlertTriangle,  roles: ['ADMIN','LIBRARIAN'] },
    ],
  },
  {
    label: 'Administração',
    items: [
      { href: '/dashboard/users',        label: 'Usuários',      icon: Users,    roles: ['ADMIN','LIBRARIAN'] },
      { href: '/dashboard/settings',     label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LIBRARIAN: 'Bibliotecário',
  PROFESSOR: 'Professor',
  STUDENT: 'Aluno',
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role ?? '';

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay, slides in/out
        'fixed inset-y-0 left-0 z-30 flex flex-col sidebar-slide',
        // Desktop: sticky in normal flow
        'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
        'bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]',
      )}
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BibliotecaPlus" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-[hsl(var(--sidebar-fg))]">
              BibliotecaPlus
            </p>
            <p className="text-[11px] text-[hsl(var(--sidebar-fg-muted))]">
              {ROLE_LABELS[role] ?? role}
            </p>
          </div>
        </div>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg transition-colors text-[hsl(var(--sidebar-fg-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover-bg))]"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((i) => i.roles.includes(role));
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.12em] uppercase text-[hsl(var(--sidebar-fg-muted))]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const isExact = pathname === item.href;
                  const isChild = item.href !== '/dashboard' && pathname.startsWith(item.href + '/');
                  const active = isExact || isChild;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-fg))]'
                          : 'text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover-bg))]',
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User ─────────────────────────────────────────────────────────── */}
      <div className="p-3 shrink-0 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback
              className="text-xs font-bold bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-fg))]"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-[hsl(var(--sidebar-fg))]">
              {user?.name}
            </p>
            <p className="text-[11px] truncate text-[hsl(var(--sidebar-fg-muted))]">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-[hsl(var(--sidebar-fg-muted))] hover:bg-red-900/30 hover:text-red-400"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
