'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Plus, Search, BookX } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Book, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

export default function BooksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [available, setAvailable] = useState<string>('all');

  const { data, isLoading } = useQuery<PaginatedResponse<Book>>({
    queryKey: ['books', { search, page, available }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (available !== 'all') params.set('available', available);
      const res = await api.get(`/books?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Livros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ?? 0} livros no catálogo
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/books/new')}>
          <Plus className="w-4 h-4" />
          Novo Livro
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar por título, ISBN, autor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select
          value={available}
          onValueChange={(v) => { setAvailable(v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Disponibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Disponíveis</SelectItem>
            <SelectItem value="false">Indisponíveis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <BookX className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhum livro encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou adicione um novo livro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data?.data?.map((book) => (
            <Card
              key={book.id}
              onClick={() => router.push(`/dashboard/books/${book.id}`)}
              className="cursor-pointer overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    <BookOpen className="w-10 h-10 text-primary/30" />
                  </div>
                )}
                <div className={cn(
                  'absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm',
                  book.availableCopies > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700',
                )}>
                  {book.availableCopies > 0 ? `${book.availableCopies} disp.` : 'Esgotado'}
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-3 space-y-0.5">
                <p className="text-sm font-medium text-card-foreground leading-snug line-clamp-2">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{book.author?.name}</p>
                {book.year && (
                  <p className="text-xs text-muted-foreground/70">{book.year}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!data.meta.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.meta.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
