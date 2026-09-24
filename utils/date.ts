import {
  addDays,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, d MMM', { locale: ptBR });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

export function formatTimeFromString(time: string | null): string {
  if (!time) return '';
  return time.slice(0, 5);
}

export function formatRelativeDay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  return format(d, "d 'de' MMM", { locale: ptBR });
}

export function toDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export { addDays, isSameDay, isToday, isTomorrow, parseISO };

export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAY_LABELS_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function greetingForHour(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
