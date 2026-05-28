'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { DashboardStats } from '@/types';
import {
  BookOpen, Users, BookMarked, AlertTriangle, FileText,
  TrendingUp, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoanPeriodItem { date: string; count: number; }
interface TrendingBook { book: { id: string; title: string; coverUrl?: string; author: { name: string } }; loanCount: number; }

const STATS_CONFIG = [
  { key: 'totalBooks'     as const, label: 'Livros no Catálogo', icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-l-blue-500',    href: '/dashboard/books' },
  { key: 'totalUsers'     as const, label: 'Usuários',           icon: Users,         color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950',border: 'border-l-violet-500',  href: '/dashboard/users' },
  { key: 'activeLoans'    as const, label: 'Empréstimos Ativos', icon: BookMarked,    color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-950',border: 'border-l-emerald-500', href: '/dashboard/loans' },
  { key: 'overdueLoans'   as const, label: 'Em Atraso',          icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950',     border: 'border-l-red-500',     href: '/dashboard/loans?status=OVERDUE' },
  { key: 'pendingFines'   as const, label: 'Multas Pendentes',   icon: TrendingUp,    color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-l-amber-500',   href: '/dashboard/fines' },
  { key: 'totalDocuments' as const, label: 'Acervo Digital',     icon: FileText,      color: 'text-cyan-600',   bg: 'bg-cyan-50 dark:bg-cyan-950',   border: 'border-l-cyan-500',    href: '/dashboard/documents' },
];

function StatCard({ label, value, icon: Icon, color, bg, border, href }: (typeof STATS_CONFIG)[number] & { value: number }) {
  return (
    <Link href={href}>
      <Card className={cn('border-l-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group', border)}>
        <CardContent className="p-5 flex items-center gap-4">
          <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl shrink-0', bg)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</p>
            <p className="text-sm text-muted-foreground truncate">{label}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

function StatSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardContent className="p-5 flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2"><Skeleton className="h-6 w-12" /><Skeleton className="h-4 w-24" /></div>
      </CardContent>
    </Card>
  );
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 },
  itemStyle: { color: 'hsl(var(--foreground))' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? '';
  const isAdmin = role === 'ADMIN' || role === 'LIBRARIAN';

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats-overview'],
    queryFn: async () => {
      const res = await api.get('/stats/overview');
      return res.data.data ?? res.data;
    },
    refetchInterval: 30_000,
  });

  const { data: loanPeriod = [] } = useQuery<LoanPeriodItem[]>({
    queryKey: ['loans-by-period'],
    queryFn: async () => {
      const res = await api.get('/stats/loans-by-period?days=30');
      return res.data.data ?? res.data;
    },
    enabled: isAdmin,
  });

  const { data: trending = [] } = useQuery<TrendingBook[]>({
    queryKey: ['top-books'],
    queryFn: async () => {
      const res = await api.get('/stats/top-books?limit=5');
      return res.data.data ?? res.data;
    },
  });

  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  const chartData = loanPeriod.map((d) => ({
    day: d.date.slice(5),
    empréstimos: d.count,
  }));

  return (
    <div className="space-y-8">
      {/* ── Greeting ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aqui está um resumo do sistema hoje.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Visão Geral
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
            : STATS_CONFIG.map(({ key, ...rest }) => (
              <StatCard key={key} {...rest} value={data?.[key] ?? 0} />
            ))}
        </div>
      </div>

      {/* ── Overdue Alert ───────────────────────────────────────────────────── */}
      {!isLoading && (data?.overdueLoans ?? 0) > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-destructive">Atenção: empréstimos em atraso</p>
                <Badge variant="destructive">{data?.overdueLoans}</Badge>
              </div>
              <p className="text-xs text-destructive/70 mt-0.5">
                Verifique a lista de empréstimos e notifique os usuários.
              </p>
            </div>
            <Button variant="destructive" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/loans?status=OVERDUE">Ver</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Charts + Trending (admin/librarian only) ────────────────────────── */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Empréstimos — últimos 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Sem dados no período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Area
                      type="monotone"
                      dataKey="empréstimos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#loanGrad)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Trending books */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Mais emprestados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trending.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sem dados ainda</p>
              ) : (
                trending.map((t, i) => (
                  <div key={t.book.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground/50 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.book.author.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{t.loanCount}×</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
