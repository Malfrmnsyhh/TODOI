import { create } from 'zustand';
import { Task, FilterState } from '@/lib/types';

interface User {
  id: string;
  name: string;
  nickname?: string | null;
  email: string;
  photoUrl?: string | null;
  bio?: string | null;
}

interface TaskStore {
  tasks: Task[];
  filters: FilterState;
  loading: boolean;
  user: User | null;

  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  setLoading: (loading: boolean) => void;

  // computed
  getFilteredTasks: () => Task[];
  getStats: () => {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

const initialFilters: FilterState = {
  category: null,
  priority: null,
  status: 'all',
  searchQuery: '',
  sortBy: 'date',
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: initialFilters,
  loading: false,
  user: null,

  setUser: (user) => set({ user }),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  setLoading: (loading) => set({ loading }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks
      .filter((task) => {
        if (
          filters.searchQuery &&
          !task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (filters.category && task.category !== filters.category) {
          return false;
        }
        if (filters.priority && task.priority !== filters.priority) {
          return false;
        }
        if (filters.status === 'completed' && !task.isCompleted) {
          return false;
        }
        if (filters.status === 'pending' && task.isCompleted) {
          return false;
        }
        if (
          filters.status === 'overdue' &&
          (!task.dueDate || new Date(task.dueDate) >= new Date())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'priority') {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (filters.sortBy === 'date') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  getStats: () => {
    const { tasks } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.isCompleted).length,
      pending: tasks.filter((t) => !t.isCompleted).length,
      overdue: tasks.filter(
        (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < today
      ).length,
    };
  },
}));
