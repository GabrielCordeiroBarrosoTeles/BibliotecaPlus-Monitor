'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Fine, PaginatedResponse } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const STATUS_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'destructive' },
  PAID:    { label: 'Pago',     variant: 'secondary' },
  WAIVED:  { label: 'Dispensado', variant: 'outline' },
};


export default function FinesPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isLibrarian = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const { data, isLoading } = useQuery<PaginatedResponse<Fine & { user?: { name: string; matriculation?: string }; loan?: { bookCopy?: { book?: { title: string } } } }>>({
    queryKey: ['fines', { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status !== 'all') params.set('status', status);
      const res = await api.get(`/fines?${params}`);
      return res.data;
    },
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => api.post(`/fines/${id}/pay`),
    onSuccess: () => {
      toast.success('Pagamento registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao registrar pagamento'),
  });

  const waiveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/fines/${id}/waive`),
    onSuccess: () => {
      toast.success('Multa dispensada.');
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao dispensar multa'),
  });

  const colSpan = isLibrarian ? 6 : 5;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Multas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.meta?.total ?? 0} multa(s) registrada(s)
        </p>
      </div>

      {/* ── Filter ─────────────────────────────────────────────────────────── */}
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Livro</TableHead>
              <TableHead>Dias de Atraso</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              {isLibrarian && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-14 text-center">
                  <Banknote className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Nenhuma multa encontrada</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((fine) => {
                const meta = STATUS_META[fine.status] ?? STATUS_META.PENDING;
                return (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{fine.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{fine.user?.matriculation}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{fine.loan?.bookCopy?.book?.title ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-destructive">{fine.daysLate}d</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(Number(fine.amount))}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    {isLibrarian && (
                      <TableCell className="text-right">
                        {fine.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm" variant="outline"
                              onClick={() => payMutation.mutate(fine.id)}
                              disabled={payMutation.isPending}
                              className="h-7 px-2 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Receber
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              onClick={() => waiveMutation.mutate(fine.id)}
                              disabled={waiveMutation.isPending}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <XCircle className="w-3 h-3" />
                              Dispensar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {data?.meta && data.meta.totalPages > 1 && (
          <CardContent className="flex items-center justify-between py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {data.meta.total} registros — Página {data.meta.page} / {data.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)} className="h-8 text-xs">Anterior</Button>
              <Button variant="outline" size="sm" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)} className="h-8 text-xs">Próxima</Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
