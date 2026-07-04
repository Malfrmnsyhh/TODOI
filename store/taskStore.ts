import { create } from 'zustand';
import { Task, FilterState } from '@/lib/types';

export interface AppNotification {
  id: string;
  type: 'deadline' | 'completed' | 'new';
  title: string;
  message: string;
  timestamp: number; // epoch ms – dipakai untuk hitung timeAgo real-time
  timeAgo: string;  // dihitung saat generate, opsional untuk render langsung
  isRead: boolean;
  taskId?: string;
}

// Helper: hitung waktu relatif ("5 menit yang lalu", "2 jam yang lalu", dsb.)
export function timeAgoFromTimestamp(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay === 1) return 'Kemarin';
  return `${diffDay} hari lalu`;
}

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
  notifications: AppNotification[]; // State Notifikasi

  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  setLoading: (loading: boolean) => void;
  
  // Actions Notifikasi
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  generateNotifications: () => void;

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
  notifications: [], // Initial state

  setUser: (user) => set({ user }),

  setTasks: (tasks) => {
    set({ tasks });
    get().generateNotifications();
  },

  addTask: (task) => {
    set((state) => ({ tasks: [task, ...state.tasks] }));
    get().generateNotifications();
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    get().generateNotifications();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    get().generateNotifications();
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
    get().generateNotifications();
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  generateNotifications: () => {
    const { tasks } = get();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const list: AppNotification[] = [];

    // 1. DEADLINE — tugas overdue (belum selesai & tenggat sudah lewat)
    const overdueTasks = tasks.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < todayMidnight
    );
    overdueTasks.forEach((t) => {
      // Gunakan timestamp dueDate sebagai waktu acuan notif
      const ts = t.dueDate ? new Date(t.dueDate).getTime() : Date.now();
      list.push({
        id: `deadline-${t.id}`,
        type: 'deadline',
        title: 'Tugas Terlambat',
        message: `"${t.title}" telah melewati tenggat waktu. Segera selesaikan!`,
        timestamp: ts,
        timeAgo: timeAgoFromTimestamp(ts),
        isRead: false,
        taskId: t.id,
      });
    });

    // 2. COMPLETED — tugas yang sudah ditandai selesai
    const completedTasks = tasks.filter((t) => t.isCompleted);
    completedTasks.forEach((t) => {
      // Gunakan updatedAt sebagai waktu tugas diselesaikan
      const ts = new Date(t.updatedAt).getTime();
      list.push({
        id: `completed-${t.id}`,
        type: 'completed',
        title: 'Tugas Selesai',
        message: `"${t.title}" telah diselesaikan. Kerja bagus!`,
        timestamp: ts,
        timeAgo: timeAgoFromTimestamp(ts),
        isRead: false,
        taskId: t.id,
      });
    });

    // 3. NEW — tugas baru yang belum selesai (berdasarkan createdAt)
    const newTasks = tasks.filter((t) => !t.isCompleted);
    newTasks.forEach((t) => {
      // Gunakan createdAt sebagai waktu tugas dibuat
      const ts = new Date(t.createdAt).getTime();
      list.push({
        id: `new-${t.id}`,
        type: 'new',
        title: 'Tugas Ditambahkan',
        message: `"${t.title}" berhasil ditambahkan ke daftar tugas Anda.`,
        timestamp: ts,
        timeAgo: timeAgoFromTimestamp(ts),
        isRead: false,
        taskId: t.id,
      });
    });

    // Urutkan dari yang paling baru ke paling lama
    list.sort((a, b) => b.timestamp - a.timestamp);

    // Pertahankan status isRead sebelumnya agar tidak ter-reset setiap render
    const prevNotifications = get().notifications || [];
    const updatedList = list.map((notif) => {
      const match = prevNotifications.find((p) => p.id === notif.id);
      if (match) {
        return { ...notif, isRead: match.isRead };
      }
      return notif;
    });

    set({ notifications: updatedList });
  },

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
