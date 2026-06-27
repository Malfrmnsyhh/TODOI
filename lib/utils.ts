export function isOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function formatDate(date: string | undefined): string {
  if (!date) return 'no date';
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function getPriorityColor(priority: string): string {
  const colors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-500 bg-yellow-50',
    low: 'text-green-500 bg-green-50',
  };
  return colors[priority as keyof typeof colors] || colors.low;
}

export function getCategoryColor(color: string): string {
  const colors: Record<string, string> = {
    'blue': 'bg-blue-100 text-blue-800 border-blue-300',
    'red': 'bg-red-100 text-red-800 border-red-300',
    'green': 'bg-green-100 text-green-800 border-green-300',
    'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'purple': 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return colors[color] || colors.blue;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}