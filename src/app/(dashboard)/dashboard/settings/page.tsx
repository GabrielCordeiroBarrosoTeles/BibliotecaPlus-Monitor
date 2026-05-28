'use client';

import { Settings, Shield, Bell, Info, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ROLE_LABELS: Record<string, string> = {
  ADMIN:     'Administrador',
  LIBRARIAN: 'Bibliotecário',
  PROFESSOR: 'Professor',
  STUDENT:   'Aluno',
};

export default function SettingsPage() {
  const { user } = useAuthStore();

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas preferências e informações de conta.</p>
      </div>

      {/* ── Perfil ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações de conta no sistema.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-1 text-xs" variant="secondary">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </Badge>
            </div>
          </div>

          {user?.matriculation && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Matrícula</span>
              <span className="text-sm font-mono font-medium text-foreground">{user.matriculation}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Limite de empréstimos</span>
            <span className="text-sm font-medium text-foreground">{user?.maxLoans ?? '—'} livros</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Prazo padrão</span>
            <span className="text-sm font-medium text-foreground">{user?.loanDays ?? '—'} dias</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Segurança ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Segurança</CardTitle>
          </div>
          <CardDescription>Gerencie sua senha e autenticação.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Senha</p>
              <p className="text-xs text-muted-foreground mt-0.5">Altere sua senha de acesso ao sistema.</p>
            </div>
            <Button variant="outline" size="sm">Alterar Senha</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Notificações ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Notificações</CardTitle>
          </div>
          <CardDescription>Controle quais alertas você recebe por e-mail.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-3">
          {[
            { label: 'Devolução próxima', desc: 'Aviso 2 dias antes do prazo' },
            { label: 'Reserva disponível', desc: 'Quando seu livro reservado estiver disponível' },
            { label: 'Multa gerada', desc: 'Ao registrar uma nova multa' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Badge variant="secondary" className="text-xs">Em breve</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Sobre ──────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Sobre o Sistema</CardTitle>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">BibliotecaPlus</p>
              <p className="text-xs text-muted-foreground">Sistema de gestão de bibliotecas</p>
            </div>
          </div>
          {[
            ['Versão', '1.0.0'],
            ['Ambiente', process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'],
            ['API',     process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-sm font-mono text-foreground">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
