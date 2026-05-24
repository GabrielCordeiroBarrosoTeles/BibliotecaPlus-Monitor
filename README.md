# BibliotecaPlus Monitor

Painel administrativo web da plataforma BibliotecaPlus — Next.js 15 + Shadcn/UI.

## Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: TailwindCSS + Shadcn/UI + Radix UI
- **Estado servidor**: TanStack Query v5
- **Estado cliente**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios com interceptors JWT

---

## Estrutura de Páginas

```mermaid
graph TD
    Root["/"]

    subgraph Auth ["(auth)"]
        Login["/login\n🔐 Login"]
    end

    subgraph Dashboard ["(dashboard) — requer autenticação"]
        Home["/dashboard\n📊 Visão Geral"]
        Books["/dashboard/books\n📚 Catálogo de Livros"]
        Loans["/dashboard/loans\n🔖 Empréstimos"]
        Reservations["/dashboard/reservations\n🗓️ Reservas"]
        Fines["/dashboard/fines\n⚠️ Multas"]
        Documents["/dashboard/documents\n📄 Acervo Digital"]
        Users["/dashboard/users\n👥 Usuários"]
        Settings["/dashboard/settings\n⚙️ Configurações"]
    end

    Root --> Login
    Root --> Dashboard
    Dashboard --> Home
    Dashboard --> Books
    Dashboard --> Loans
    Dashboard --> Reservations
    Dashboard --> Fines
    Dashboard --> Documents
    Dashboard --> Users
    Dashboard --> Settings
```

---

## Fluxo de Estado

```mermaid
flowchart LR
    subgraph Client ["Estado do Cliente (Zustand)"]
        AuthStore["authStore\n(user · token · logout)"]
    end

    subgraph Server ["Estado do Servidor (TanStack Query)"]
        BooksQ["useQuery books"]
        LoansQ["useQuery loans"]
        UsersQ["useQuery users"]
    end

    subgraph API ["BibliotecaPlus API"]
        direction TB
        REST["REST /api/v1"]
    end

    AuthStore -->|"Bearer Token\n(Axios interceptor)"| REST
    REST --> BooksQ
    REST --> LoansQ
    REST --> UsersQ
    BooksQ -->|"staleTime · retry · refetch"| Cache["Cache TanStack\n(memória)"]
```

---

## RBAC — Controle por Papel

```mermaid
graph LR
    ADMIN["👑 ADMIN\nAcesso total"]
    LIBRARIAN["📚 LIBRARIAN\nLivros · Empréstimos\nMultas · Usuários"]
    PROFESSOR["🎓 PROFESSOR\nConsulta · Reserva"]
    STUDENT["🎒 STUDENT\nConsulta · Reserva"]

    ADMIN --> LIBRARIAN
    ADMIN --> PROFESSOR
    ADMIN --> STUDENT
```

---

## Início Rápido

```bash
# 1. Variáveis de ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env.local

# 2. Instalar e rodar
npm install
npm run dev
# → http://localhost:3000
```

## Credenciais de Teste

| Usuário | Email | Senha | Papel |
|---------|-------|-------|-------|
| Admin | admin@biblioteca.com | Senha@123 | ADMIN |
| Bibliotecário | bibliotecario@biblioteca.com | Senha@123 | LIBRARIAN |
| Professor | prof@biblioteca.com | Senha@123 | PROFESSOR |
| Aluno | aluno@biblioteca.com | Senha@123 | STUDENT |
