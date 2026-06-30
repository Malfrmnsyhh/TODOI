export type Priority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "completed" | "overdue";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface FilterState {
  category: string|null;
  priority: Priority|null;
  status: 'all' | 'completed' | 'pending' | 'overdue';
  searchQuery: string;
  sortBy: 'date' | 'priority' | 'created';
}