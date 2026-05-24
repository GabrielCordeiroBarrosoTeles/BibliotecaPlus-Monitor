'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Book, PaginatedResponse } from '@/types';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import { cn, truncate } from '@/lib/utils';

export default function BooksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [available, setAvailable] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useQuery<PaginatedResponse<Book>>({
    queryKey: ['books', { search, page, available }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (available !== undefined) params.set('available', String(available));
      const res = await api.get(`/books?${params}`);
      return res.data.data ?? res.data;
    },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livros</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.meta?.total ?? 0} livros no catálogo
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/books/new')}
          className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Livro
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, ISBN, autor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
          />
        </div>
        <select
          value={available === undefined ? '' : String(available)}
          onChange={(e) => setAvailable(e.target.value === '' ? undefined : e.target.value === 'true')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Todos</option>
          <option value="true">Disponíveis</option>
          <option value="false">Indisponíveis</option>
        </select>
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.data?.map((book) => (
            <div
              key={book.id}
              onClick={() => router.push(`/dashboard/books/${book.id}`)}
              className="cursor-pointer group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] bg-gray-50">
                {book.coverUrl ? (
                  <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-200" />
                  </div>
                )}
                {/* Disponibilidade badge */}
                <div className={cn(
                  'absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium',
                  book.availableCopies > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700',
                )}>
                  {book.availableCopies > 0 ? `${book.availableCopies} disp.` : 'Indisponível'}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                  {book.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{book.author?.name}</p>
                {book.year && <p className="text-xs text-gray-400">{book.year}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={!data.meta.hasPrev}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <button
            disabled={!data.meta.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
