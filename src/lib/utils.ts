import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format = 'DD/MM/YYYY') {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date) {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getLoanStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo',
    RETURNED: 'Devolvido',
    OVERDUE: 'Em atraso',
    RENEWED: 'Renovado',
  };
  return labels[status] ?? status;
}

export function getLoanStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    RETURNED: 'bg-gray-100 text-gray-800',
    OVERDUE: 'bg-red-100 text-red-800',
    RENEWED: 'bg-blue-100 text-blue-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    LIBRARIAN: 'Bibliotecário',
    PROFESSOR: 'Professor',
    STUDENT: 'Aluno',
  };
  return labels[role] ?? role;
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
