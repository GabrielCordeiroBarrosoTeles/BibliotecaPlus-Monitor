# BibliotecaPlus Monitor

> Painel administrativo web da plataforma BibliotecaPlus — Next.js 15 + React 19 + TypeScript + Tailwind CSS

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5.7 |
| Estilo | Tailwind CSS 3.4 + class-variance-authority |
| Componentes | Radix UI (Dialog, DropdownMenu, Select, Tabs, Tooltip...) |
| Formulários | React Hook Form 7 + Zod 3.23 |
| Estado | Zustand 5 (auth) + TanStack Query 5 (cache de servidor) |
| HTTP | Axios (com interceptor de refresh token automático) |
| Gráficos | Recharts 2.13 |
| Animações | Framer Motion 11 |
| Toasts | Sonner |
| PDF Viewer | react-pdf 9 |
| QR Code | qrcode.react |
| Utilitários | date-fns · dayjs · lucide-react |

---

## Pré-requisitos

- Node.js 20+
- API BibliotecaPlus rodando em `http://localhost:3333`

---

## Instalação e Execução

```bash
npm install
cp .env.local.example .env.local   # configurar API URL
npm run dev                        # http://localhost:3000
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API | `http://localhost:3333/api/v1` |

---

## Páginas e Funcionalidades

### Autenticação
- `/login` — Login com email e senha, "lembrar por 30 dias", refresh token automático

### Dashboard — `/dashboard`
Visão geral do sistema em tempo real (atualiza a cada 30s):
- **6 stat cards** linkáveis: livros no catálogo, usuários, empréstimos ativos, em atraso, multas pendentes, acervo digital
- **Alert de urgência** quando há empréstimos em atraso
- **Gráfico de área** — empréstimos por dia nos últimos 30 dias (ADMIN/LIBRARIAN)
- **Ranking** dos 5 livros mais emprestados (ADMIN/LIBRARIAN)

### Livros — `/dashboard/books`
- Grid visual com capa do livro (imagem do MinIO)
- Busca em tempo real por título, ISBN ou autor
- Filtro de disponibilidade: todos / disponíveis / indisponíveis
- Badge de quantidade disponível em cada card
- Paginação (20 por página)
- Botão "Novo Livro"

### Acervo Digital — `/dashboard/documents`
- Documentos: PDF, E-book, TCC, Artigo Científico, Monografia
- Busca por título ou autor
- Filtro por tipo de documento
- Download via presigned URL do MinIO (1 hora)
- Exibe: tamanho, contador de downloads, data de envio
- Botão "Enviar Documento"

### Empréstimos — `/dashboard/loans`
- Filtros de status: Ativo / Em Atraso / Devolvido / Renovado
- Exibe: usuário (nome + matrícula), livro (título + autor), datas
- Ações (ADMIN/LIBRARIAN): **Devolver** e **Renovar** por linha
- Status em atraso destacado em vermelho

### Reservas — `/dashboard/reservations`
- Status: Pendente / Disponível / Retirado / Cancelado / Expirado
- Exibe: livro, usuário (nome + matrícula), data de solicitação, validade
- Ação (ADMIN/LIBRARIAN): **Cancelar** reservas ativas

### Multas — `/dashboard/fines`
- Exibe: usuário (nome + matrícula), livro, dias de atraso, valor em R$
- Status: Pendente / Pago / Dispensado
- Ações (ADMIN/LIBRARIAN): **Receber pagamento** e **Dispensar**

### Usuários — `/dashboard/users` *(ADMIN/LIBRARIAN)*
- Tabela com avatar, nome, e-mail, matrícula, cargo, status e data de cadastro
- Filtro por cargo: Administrador / Bibliotecário / Professor / Aluno
- Ação (ADMIN): ativar ou desativar conta

### Configurações — `/dashboard/settings` *(ADMIN)*
- Configurações gerais do sistema

---

## Controle de Acesso por Role

| Seção | ADMIN | LIBRARIAN | PROFESSOR | STUDENT |
|-------|:-----:|:---------:|:---------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Livros | ✅ | ✅ | ✅ | ✅ |
| Acervo Digital | ✅ | ✅ | ✅ | ✅ |
| Empréstimos (todos) | ✅ | ✅ | 👁️ próprios | 👁️ próprios |
| Reservas (todas) | ✅ | ✅ | 👁️ próprias | 👁️ próprias |
| Multas | ✅ | ✅ | ❌ | ❌ |
| Usuários | ✅ | 👁️ ver | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ | ❌ |
| Gráficos no dashboard | ✅ | ✅ | ❌ | ❌ |

---

## Autenticação e Sessão

**Arquivo:** `src/lib/api.ts`

- Access token armazenado em `localStorage`
- **Request interceptor:** injeta `Authorization: Bearer {token}` automaticamente
- **Response interceptor:** em erro 401, tenta refresh automático do token sem interromper o fluxo — as requisições pendentes são enfileiradas e reprocessadas após o refresh
- Logout redireciona para `/login`

---

## Componentes de Layout

| Componente | Localização | Função |
|-----------|-------------|--------|
| `Sidebar` | `components/layout/Sidebar.tsx` | Navegação por grupos, controle de acesso por role, avatar do usuário |
| `Header` | `components/layout/Header.tsx` | Busca rápida, toggle de tema, sino de notificações |
| `NotificationBell` | `components/layout/NotificationBell.tsx` | Dropdown com notificações em tempo real, mark as read |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard principal
│   │       ├── books/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── loans/page.tsx
│   │       ├── reservations/page.tsx
│   │       ├── fines/page.tsx
│   │       ├── users/page.tsx
│   │       └── settings/page.tsx
│   └── not-found.tsx              # Página 404 personalizada
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── NotificationBell.tsx
│   └── ui/                        # Componentes Radix UI customizados
├── lib/
│   ├── api.ts                     # Axios instance + interceptors
│   └── utils.ts                   # formatDate, formatCurrency, formatFileSize, cn
├── stores/
│   └── auth.store.ts              # Zustand — user, tokens, setAuth, logout
└── types/
    └── index.ts                   # Todas as interfaces TypeScript
```

---

## Credenciais de Teste (seed:dev)

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Cordeiro (Admin) | `cordeiro@adm.com` | `123456` | ADMIN |
| Cordeiro (Aluno) | `cordeiro@aluno.com` | `123456` | STUDENT |
| Cordeiro (Prof) | `cordeiro@prof.com` | `123456` | PROFESSOR |
