'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Loan, PaginatedResponse } from '@/types';
import { formatDate, getLoanStatusLabel, cn } from '@/lib/utils';
import { BookMarked, RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusVariant: Record<string, 'success' | 'destructive' | 'secondary' | 'info'> = {
  ACTIVE: 'success',
  OVERDUE: 'destructive',
  RETURNED: 'secondary',
  RENEWED: 'info',
};

export default function LoansPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Loan>>({
    queryKey: ['loans', { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const res = await api.get(`/loans?${params}`);
      return res.data.data ?? res.data;
    },
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => api.post(`/loans/${id}/return`),
    onSuccess: () => {
      toast.success('Devolução registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao registrar devolução'),
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => api.post(`/loans/${id}/renew`),
    onSuccess: () => {
      toast.success('Empréstimo renovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao renovar'),
  });

  const isLibrarian = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const colSpan = isLibrarian ? 6 : 5;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empréstimos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ?? 0} registro(s)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Select
          value={status || 'all'}
          onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-48 h-9 text-sm">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="OVERDUE">Em atraso</SelectItem>
            <SelectItem value="RETURNED">Devolvido</SelectItem>
            <SelectItem value="RENEWED">Renovado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livro</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empréstimo</TableHead>
              <TableHead>Devolução</TableHead>
              <TableHead>Status</TableHead>
              {isLibrarian && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-12 text-center">
                  <BookMarked className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Nenhum empréstimo encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{loan.bookCopy?.book?.title}</p>
                    <p className="text-xs text-muted-foreground">{loan.bookCopy?.book?.author?.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{loan.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{loan.user?.matriculation}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(loan.loanedAt)}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-sm',
                      loan.status === 'OVERDUE' ? 'text-destructive font-medium' : 'text-muted-foreground',
                    )}>
                      {formatDate(loan.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[loan.status] ?? 'secondary'}>
                      {getLoanStatusLabel(loan.status)}
                    </Badge>
                  </TableCell>
                  {isLibrarian && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => returnMutation.mutate(loan.id)}
                            disabled={returnMutation.isPending}
                            className="h-7 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Devolver
                          </Button>
                        )}
                        {loan.status === 'ACTIVE' && loan.renewalCount < loan.maxRenewals && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => renewMutation.mutate(loan.id)}
                            disabled={renewMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Renovar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {data?.meta && data.meta.totalPages > 1 && (
          <CardContent className="flex items-center justify-between pt-0 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {data.meta.total} registros — Página {data.meta.page} / {data.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.meta.hasPrev}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 text-xs"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.meta.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 text-xs"
              >
                Próxima
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
