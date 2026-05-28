'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock, AlertTriangle, BookCheck, CheckCheck, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

function notificationIcon(type: string) {
  switch (type) {
    case 'LOAN_DUE':          return <Clock className="w-4 h-4 text-amber-500" />;
    case 'LOAN_OVERDUE':      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'RESERVATION_AVAILABLE': return <BookCheck className="w-4 h-4 text-emerald-500" />;
    default:                  return <Info className="w-4 h-4 text-blue-500" />;
  }
}

export function NotificationBell() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full pointer-events-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-1 px-2"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.slice(0, 20).map((n, i) => (
              <div key={n.id}>
                <DropdownMenuItem
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-accent',
                    !n.readAt && 'bg-primary/5',
                  )}
                  onClick={() => { if (!n.readAt) markRead.mutate(n.id); }}
                >
                  <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={cn('text-sm leading-tight', !n.readAt ? 'font-semibold' : 'font-medium')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!n.readAt && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </DropdownMenuItem>
                {i < notifications.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
