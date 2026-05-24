'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardStats } from '@/types';
import {
  BookOpen, Users, BookMarked, AlertTriangle, FileText, TrendingUp, AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl shrink-0', colorClass)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 flex items-start gap-4">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats-overview'],
    queryFn: async () => {
      const res = await api.get('/stats/overview');
      return res.data.data ?? res.data;
    },
    refetchInterval: 30_000,
  });

  const stats = [
    { label: 'Total de Livros', value: data?.totalBooks ?? 0, icon: BookOpen, colorClass: 'bg-blue-500' },
    { label: 'Usuários Ativos', value: data?.totalUsers ?? 0, icon: Users, colorClass: 'bg-violet-500' },
    { label: 'Empréstimos Ativos', value: data?.activeLoans ?? 0, icon: BookMarked, colorClass: 'bg-emerald-500' },
    { label: 'Em Atraso', value: data?.overdueLoans ?? 0, icon: AlertTriangle, colorClass: 'bg-red-500' },
    { label: 'Multas Pendentes', value: data?.pendingFines ?? 0, icon: TrendingUp, colorClass: 'bg-amber-500' },
    { label: 'Acervo Digital', value: data?.totalDocuments ?? 0, icon: FileText, colorClass: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Alerta de empréstimos em atraso */}
      {!isLoading && (data?.overdueLoans ?? 0) > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-destructive">Empréstimos em atraso</p>
                <Badge variant="destructive">{data?.overdueLoans}</Badge>
              </div>
              <p className="text-xs text-destructive/70 mt-0.5">
                Verifique a lista de empréstimos para tomar as ações necessárias.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
