export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function formatDateOnly(dateString) {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}