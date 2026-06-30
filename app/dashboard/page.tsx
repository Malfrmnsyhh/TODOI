'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/lib/types';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api-client';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilters from '@/components/TaskFilters';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import StatsGrid from '@/components/StatsGrid';
import ActivitySection from '@/components/ActivitySection';
import MobileNav from '@/components/MobileNav';
import { Loader, Plus, Menu, X } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    tasks,
    setTasks,
    addTask,
    updateTask: storeUpdateTask,
    getFilteredTasks,
    loading,
    setLoading,
    user,
    setUser,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router, setUser]);

  // Load tasks only when user is authenticated
  useEffect(() => {
    if (!user) return;
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [user, setTasks, setLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenForm();
      }
      if (e.key === 'Escape') {
        handleCloseForm();
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showForm]);

  const handleAddTask = async (formData: Omit<Task, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createTask(formData);
      addTask(response);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async (formData: Omit<Task, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, formData);
      storeUpdateTask(editingTask.id, updated);
      setEditingTask(undefined);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = getFilteredTasks();

  if (!user && !loading) {
    return (
      <div className="h-screen w-full bg-[#0b1326] flex items-center justify-center">
        <Loader className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="h-screen w-full bg-[#0b1326] flex overflow-hidden font-sans">
      
      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop always visible / Mobile as drawer) ── */}
      <div
        className={`
          fixed md:relative z-40 md:z-auto h-full transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onNewTask={() => { handleOpenForm(); setSidebarOpen(false); }} />
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1326] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-lg">TODOI</span>
          <button
            onClick={() => handleOpenForm()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus size={22} />
          </button>
        </header>

        {/* Main Content (scrollable) */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex h-full">
            {/* ── Center Workspace ── */}
            <div className="flex-1 px-4 md:px-8 py-6 md:py-8 min-w-0">

              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  Kamu punya{' '}
                  <span className="text-white font-semibold">
                    {tasks.filter((t) => !t.isCompleted).length} tugas
                  </span>{' '}
                  yang perlu diselesaikan hari ini.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="animate-spin text-indigo-500" size={40} />
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Stats Grid — 4 cards */}
                  <StatsGrid />

                  {/* Activity Chart */}
                  <ActivitySection />

                  {/* Task List Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Daftar Tugas</h2>
                      <button
                        onClick={() => handleOpenForm()}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30"
                      >
                        <Plus size={16} />
                        Tugas Baru
                      </button>
                    </div>
                    <TaskFilters />
                    <div className="mt-4 glass-panel p-4 md:p-6 rounded-2xl">
                      <TaskList tasks={filteredTasks} onEdit={handleOpenForm} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Panel (Desktop only) ── */}
            <RightPanel />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav onNewTask={() => handleOpenForm()} />
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
