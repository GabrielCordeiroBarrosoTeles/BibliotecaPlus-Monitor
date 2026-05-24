'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Document, PaginatedResponse } from '@/types';
import { FileText, Download, Eye, Search, Upload, Filter } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';

const DOC_TYPE_LABELS: Record<string, string> = {
  PDF: 'PDF', EPUB: 'E-book', ARTICLE: 'Artigo', TCC: 'TCC',
  MONOGRAPH: 'Monografia', EBOOK: 'E-book', OTHER: 'Outro',
};

const DOC_TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-50 text-red-600', EPUB: 'bg-purple-50 text-purple-600',
  TCC: 'bg-blue-50 text-blue-600', ARTICLE: 'bg-green-50 text-green-600',
  MONOGRAPH: 'bg-amber-50 text-amber-600', OTHER: 'bg-gray-50 text-gray-600',
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Document>>({
    queryKey: ['documents', { search, type, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (type) params.set('type', type);
      const res = await api.get(`/documents?${params}`);
      return res.data.data ?? res.data;
    },
  });

  const handleDownload = async (id: string, title: string) => {
    try {
      const res = await api.get(`/documents/${id}/download`);
      const { url } = res.data.data ?? res.data;
      window.open(url, '_blank');
      toast.success(`Download de "${title}" iniciado`);
    } catch {
      toast.error('Erro ao gerar link de download');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acervo Digital</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.meta?.total ?? 0} documentos</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Upload className="w-4 h-4" /> Enviar Documento
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar documentos..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
          <option value="">Todos os tipos</option>
          {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${DOC_TYPE_COLORS[doc.type] || 'bg-gray-50 text-gray-600'}`}>
                    {DOC_TYPE_LABELS[doc.type] || doc.type}
                  </span>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{doc.title}</h3>
                  {doc.authorName && <p className="text-xs text-gray-500 mt-0.5">{doc.authorName}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{doc.downloadCount} downloads</span>
                    <span>·</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownload(doc.id, doc.title)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
