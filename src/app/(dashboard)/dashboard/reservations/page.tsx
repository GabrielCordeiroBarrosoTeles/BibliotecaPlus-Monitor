'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Reservation, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';
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
  PENDING:   { label: 'Pendente',    variant: 'default' },
  READY:     { label: 'Disponível',  variant: 'default' },
  FULFILLED: { label: 'Retirado',    variant: 'secondary' },
  CANCELLED: { label: 'Cancelado',   variant: 'destructive' },
  EXPIRED:   { label: 'Expirado',    variant: 'outline' },
};

export default function ReservationsPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isLibrarian = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const { data, isLoading } = useQuery<PaginatedResponse<Reservation>>({
    queryKey: ['reservations', { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status !== 'all') params.set('status', status);
      const res = await api.get(`/reservations?${params}`);
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      toast.success('Reserva cancelada.');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao cancelar reserva'),
  });

  const colSpan = isLibrarian ? 6 : 5;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Reservas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.meta?.total ?? 0} reserva(s) registrada(s)
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
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
              <TableHead>Livro</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Solicitado em</TableHead>
              <TableHead>Expira em</TableHead>
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
                  <CalendarClock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Nenhuma reserva encontrada</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.PENDING;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{r.book?.title}</p>
                      <p className="text-xs text-muted-foreground">{r.book?.author?.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{r.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{r.user?.matriculation}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.expiresAt ? formatDate(r.expiresAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    {isLibrarian && (
                      <TableCell className="text-right">
                        {(r.status === 'PENDING' || r.status === 'READY') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelMutation.mutate(r.id)}
                            disabled={cancelMutation.isPending}
                            className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <X className="w-3 h-3" />
                            Cancelar
                          </Button>
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
