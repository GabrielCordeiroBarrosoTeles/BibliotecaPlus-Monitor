// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'PROFESSOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matriculation?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerifiedAt?: string;
  maxLoans: number;
  loanDays: number;
  createdAt: string;
}

// ─── Book ─────────────────────────────────────────────────────────────────────
export interface Author {
  id: string;
  name: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  isbn?: string;
  synopsis?: string;
  coverUrl?: string;
  year?: number;
  edition?: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  isActive: boolean;
  author: Author;
  publisher?: Publisher;
  categories: Array<{ category: Category }>;
  createdAt: string;
}

// ─── Loan ─────────────────────────────────────────────────────────────────────
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RENEWED';

export interface Loan {
  id: string;
  userId: string;
  bookCopyId: string;
  loanedAt: string;
  dueDate: string;
  returnedAt?: string;
  renewalCount: number;
  maxRenewals: number;
  status: LoanStatus;
  user: Pick<User, 'id' | 'name' | 'email' | 'matriculation'>;
  bookCopy: {
    id: string;
    code: string;
    book: Pick<Book, 'id' | 'title' | 'coverUrl'> & { author: Pick<Author, 'name'> };
  };
  fine?: Fine;
}

// ─── Fine ─────────────────────────────────────────────────────────────────────
export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED';

export interface Fine {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  daysLate: number;
  status: FineStatus;
  paidAt?: string;
  waivedAt?: string;
  createdAt: string;
}

// ─── Document ─────────────────────────────────────────────────────────────────
export type DocumentType = 'PDF' | 'EPUB' | 'ARTICLE' | 'TCC' | 'MONOGRAPH' | 'EBOOK' | 'OTHER';

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number;
  isPublic: boolean;
  downloadCount: number;
  isApproved: boolean;
  authorName?: string;
  year?: number;
  uploadedBy: Pick<User, 'id' | 'name'>;
  createdAt: string;
}

// ─── Reservation ─────────────────────────────────────────────────────────────
export type ReservationStatus = 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: ReservationStatus;
  expiresAt?: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'matriculation'>;
  book: Pick<Book, 'id' | 'title' | 'coverUrl'> & { author: Pick<Author, 'name'> };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  pendingFines: number;
  totalDocuments: number;
}
