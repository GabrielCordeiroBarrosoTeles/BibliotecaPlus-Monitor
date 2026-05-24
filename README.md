# 🌐 Biblioteca+ Web

Painel administrativo da plataforma Biblioteca+.

## Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: TailwindCSS + Shadcn/UI
- **Estado**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios com interceptors JWT

## Início Rápido

```bash
cp .env.local.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

## Estrutura

```
src/
├── app/
│   ├── (auth)/       → Login, Registro, Senha
│   └── (dashboard)/  → Painel principal
├── components/        → UI components
├── hooks/             → TanStack Query hooks
├── lib/               → Axios, utils
├── stores/            → Zustand (auth)
├── types/             → TypeScript types
└── validations/       → Zod schemas
```
