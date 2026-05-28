'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import type { Author, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  title:    z.string().min(2, 'Título obrigatório (mínimo 2 caracteres)'),
  subtitle: z.string().optional(),
  isbn:     z.string().optional(),
  synopsis: z.string().optional(),
  year:     z.coerce.number().int().min(1000).max(2099).optional().or(z.literal('')),
  edition:  z.string().optional(),
  language: z.string().optional(),
  location: z.string().optional(),
  authorId: z.string().uuid('Selecione um autor'),
});

type FormData = z.infer<typeof schema>;

const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (BR)' },
  { value: 'pt-PT', label: 'Português (PT)' },
  { value: 'en',    label: 'Inglês' },
  { value: 'es',    label: 'Espanhol' },
  { value: 'fr',    label: 'Francês' },
  { value: 'de',    label: 'Alemão' },
];

export default function NewBookPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: authors = [] } = useQuery<Author[]>({
    queryKey: ['authors-all'],
    queryFn: async () => {
      const res = await api.get('/authors');
      return res.data.data ?? res.data;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data ?? res.data;
    },
  });

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title:    data.title,
        authorId: data.authorId,
      };
      if (data.subtitle) payload.subtitle = data.subtitle;
      if (data.isbn)     payload.isbn     = data.isbn;
      if (data.synopsis) payload.synopsis = data.synopsis;
      if (data.year)     payload.year     = Number(data.year);
      if (data.edition)  payload.edition  = data.edition;
      if (data.language) payload.language = data.language;
      if (data.location) payload.location = data.location;
      if (selectedCategories.length) payload.categoryIds = selectedCategories;

      const bookRes = await api.post('/books', payload);
      const book = bookRes.data.data ?? bookRes.data;

      if (coverFile) {
        const form = new FormData();
        form.append('file', coverFile);
        await api.post(`/books/${book.id}/cover`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Livro cadastrado com sucesso!');
      router.push('/dashboard/books');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Erro ao cadastrar livro';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Novo Livro</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados para cadastrar um novo título.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Capa ──────────────────────────────────────────────────────── */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Capa do livro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 group">
                {coverPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4 text-center"
                  >
                    <BookOpen className="w-8 h-8" />
                    <span className="text-xs font-medium">Clique para adicionar capa</span>
                    <span className="text-[11px] text-muted-foreground/60">JPG, PNG, WEBP · max 5MB</span>
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Trocar imagem
                </Button>
              )}
            </CardContent>
          </Card>

          {/* ── Dados principais ──────────────────────────────────────────── */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Informações do título</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input id="title" placeholder="Ex: Clean Code" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Subtítulo */}
              <div className="space-y-1.5">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input id="subtitle" placeholder="Ex: A Handbook of Agile Software Craftsmanship" {...register('subtitle')} />
              </div>

              {/* Autor */}
              <div className="space-y-1.5">
                <Label>
                  Autor <span className="text-destructive">*</span>
                </Label>
                <Select onValueChange={(v) => setValue('authorId', v)}>
                  <SelectTrigger className={errors.authorId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.authorId && <p className="text-xs text-destructive">{errors.authorId.message}</p>}
              </div>

              {/* ISBN + Ano */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input id="isbn" placeholder="9780132350884" {...register('isbn')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year">Ano</Label>
                  <Input id="year" type="number" placeholder="2024" min={1000} max={2099} {...register('year')} />
                  {errors.year && <p className="text-xs text-destructive">{String(errors.year.message)}</p>}
                </div>
              </div>

              {/* Edição + Idioma */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edition">Edição</Label>
                  <Input id="edition" placeholder="1ª edição" {...register('edition')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Idioma</Label>
                  <Select defaultValue="pt-BR" onValueChange={(v) => setValue('language', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-1.5">
                <Label htmlFor="location">Localização no acervo</Label>
                <Input id="location" placeholder="Ex: Estante T - Prateleira 1" {...register('location')} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sinopse ──────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Sinopse</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="synopsis"
              rows={5}
              placeholder="Breve descrição do livro..."
              {...register('synopsis')}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </CardContent>
        </Card>

        {/* ── Categorias ───────────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Categorias
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {selectedCategories.length} selecionada{selectedCategories.length > 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-150 ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-32">
            {submitting ? 'Cadastrando...' : 'Cadastrar Livro'}
          </Button>
        </div>
      </form>
    </div>
  );
}
