'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { User, UserRole, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  ADMIN:      { label: 'Administrador', color: 'bg-violet-100 text-violet-700' },
  LIBRARIAN:  { label: 'Bibliotecário', color: 'bg-blue-100 text-blue-700' },
  PROFESSOR:  { label: 'Professor',     color: 'bg-emerald-100 text-emerald-700' },
  STUDENT:    { label: 'Aluno',         color: 'bg-amber-100 text-amber-700' },
};

export default function UsersPage() {
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { role, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (role !== 'all') params.set('role', role);
      const res = await api.get(`/users?${params}`);
      return res.data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}`, { isActive }),
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? 'Usuário ativado.' : 'Usuário desativado.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao atualizar usuário'),
  });

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Usuários</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.meta?.total ?? 0} usuário(s) cadastrado(s)
        </p>
      </div>

      {/* ── Filter ─────────────────────────────────────────────────────────── */}
      <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Filtrar por papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os papéis</SelectItem>
          {(Object.keys(ROLE_META) as UserRole[]).map((r) => (
            <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: isAdmin ? 6 : 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="py-14 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Nenhum usuário encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((u) => {
                const roleMeta = ROLE_META[u.role];
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {u.matriculation ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleMeta.color}`}>
                        {roleMeta.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'secondary'}>
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {u.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
                            disabled={toggleActiveMutation.isPending}
                            className={`h-7 px-2 text-xs ${
                              u.isActive
                                ? 'text-destructive border-destructive/30 hover:bg-destructive/10'
                                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive
                              ? <><UserX className="w-3 h-3" /> Desativar</>
                              : <><UserCheck className="w-3 h-3" /> Ativar</>
                            }
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
