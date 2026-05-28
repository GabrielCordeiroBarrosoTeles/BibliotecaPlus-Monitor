'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Search, Upload, FileQuestion, X, File } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { Document, PaginatedResponse } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DOC_TYPE_META: Record<string, { label: string; color: string; iconColor: string }> = {
  PDF:       { label: 'PDF',        color: 'bg-red-100 text-red-700',          iconColor: 'text-red-500 bg-red-50' },
  EPUB:      { label: 'E-book',     color: 'bg-purple-100 text-purple-700',    iconColor: 'text-purple-500 bg-purple-50' },
  TCC:       { label: 'TCC',        color: 'bg-blue-100 text-blue-700',        iconColor: 'text-blue-500 bg-blue-50' },
  ARTICLE:   { label: 'Artigo',     color: 'bg-emerald-100 text-emerald-700',  iconColor: 'text-emerald-500 bg-emerald-50' },
  MONOGRAPH: { label: 'Monografia', color: 'bg-amber-100 text-amber-700',      iconColor: 'text-amber-500 bg-amber-50' },
  EBOOK:     { label: 'E-book',     color: 'bg-purple-100 text-purple-700',    iconColor: 'text-purple-500 bg-purple-50' },
  OTHER:     { label: 'Outro',      color: 'bg-muted text-muted-foreground',   iconColor: 'text-muted-foreground bg-muted' },
};

const DOC_TYPE_OPTIONS = [
  { value: 'PDF',       label: 'PDF' },
  { value: 'EPUB',      label: 'E-book (EPUB)' },
  { value: 'TCC',       label: 'TCC' },
  { value: 'ARTICLE',   label: 'Artigo Científico' },
  { value: 'MONOGRAPH', label: 'Monografia' },
  { value: 'EBOOK',     label: 'E-book (outro)' },
  { value: 'OTHER',     label: 'Outro' },
];

const uploadSchema = z.object({
  title:      z.string().min(2, 'Título obrigatório'),
  description:z.string().optional(),
  type:       z.string().default('PDF'),
  authorName: z.string().optional(),
  year:       z.coerce.number().int().min(1000).max(2099).optional().or(z.literal('')),
  keywords:   z.string().optional(),
  isPublic:   z.boolean().default(true),
});

type UploadFormData = z.infer<typeof uploadSchema>;

function UploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { type: 'PDF', isPublic: true },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  function handleClose() {
    reset();
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  }

  async function onSubmit(data: UploadFormData) {
    if (!file) {
      toast.error('Selecione um arquivo para enviar');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', data.title);
      form.append('type', data.type);
      form.append('isPublic', String(data.isPublic));
      if (data.description) form.append('description', data.description);
      if (data.authorName)  form.append('authorName', data.authorName);
      if (data.year)        form.append('year', String(data.year));
      if (data.keywords)    form.append('keywords', data.keywords);

      await api.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Documento enviado com sucesso!');
      qc.invalidateQueries({ queryKey: ['documents'] });
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Erro ao enviar documento';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Arquivo */}
          <div className="space-y-1.5">
            <Label>
              Arquivo <span className="text-destructive">*</span>
            </Label>
            {file ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40">
                <File className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Clique para selecionar o arquivo</span>
                <span className="text-xs text-muted-foreground/60">PDF, EPUB, DOC · max 50MB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input id="title" placeholder="Ex: Algoritmos e Estruturas de Dados" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de documento</Label>
            <Select defaultValue="PDF" onValueChange={(v) => setValue('type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Autor + Ano */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="authorName">Autor</Label>
              <Input id="authorName" placeholder="Nome do autor" {...register('authorName')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Ano</Label>
              <Input id="year" type="number" placeholder="2024" min={1000} max={2099} {...register('year')} />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Breve descrição do documento..."
              {...register('description')}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Palavras-chave */}
          <div className="space-y-1.5">
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Input id="keywords" placeholder="algoritmos, estruturas de dados, programação" {...register('keywords')} />
          </div>

          {/* Visibilidade */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
              onChange={(e) => setValue('isPublic', e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium">Documento público</p>
              <p className="text-xs text-muted-foreground">Visível para todos os usuários</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !file} className="min-w-28">
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResponse<Document>>({
    queryKey: ['documents', { search, type, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (type !== 'all') params.set('type', type);
      const res = await api.get(`/documents?${params}`);
      return res.data;
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
    <div className="space-y-6">
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Acervo Digital</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ?? 0} documentos disponíveis
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4" />
          Enviar Documento
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select
          value={type}
          onValueChange={(v) => { setType(v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(DOC_TYPE_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhum documento encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou envie um novo documento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((doc) => {
            const meta = DOC_TYPE_META[doc.type] ?? DOC_TYPE_META.OTHER;
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${meta.iconColor}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className={`${meta.color} border-0 px-2 py-0.5 text-xs font-medium mb-1.5`}>
                        {meta.label}
                      </Badge>
                      <h3 className="font-medium text-card-foreground text-sm line-clamp-2 leading-snug">
                        {doc.title}
                      </h3>
                      {doc.authorName && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.authorName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/70">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>·</span>
                        <span>{doc.downloadCount} downloads</span>
                        <span>·</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.title)}
                    className="w-full mt-4 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
