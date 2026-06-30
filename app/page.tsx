'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/lib/types';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api-client';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilters from '@/components/TaskFilters';
import StatsCard from '@/components/StatsCard';
import { Plus, Loader } from 'lucide-react';

export default function Home() {
  const {
    tasks,
    setTasks,
    addTask,
    updateTask: storeUpdateTask,
    deleteTask: storeDeleteTask,
    getFilteredTasks,
    loading,
    setLoading,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [setTasks, setLoading]);

  // Tambahkan kode ini di dalam komponen Home, di bawah useEffect loadTasks:
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N untuk memunculkan modal New Task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenForm();
      }
      // Tombol Escape untuk menutup modal
      if (e.key === 'Escape') {
        handleCloseForm();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showForm]);


  const handleAddTask = async (formData: any) => {
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Coba simpan lewat API (jika error, simpan lokal)
      try {
        const response = await createTask(formData);
        addTask(response);
      } catch {
        addTask(newTask);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async (formData: any) => {
    if (!editingTask) return;

    try {
      const updated: Task = {
        ...editingTask,
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      try {
        await updateTask(editingTask.id, formData);
      } catch {
        // Fallback local
      }

      storeUpdateTask(editingTask.id, updated);
      setEditingTask(undefined);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };


  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 animate-fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Tasks
              </h1>
              <p className="text-gray-600 mt-1">Stay organized and productive</p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <StatsCard />

            {/* Filters */}
            <TaskFilters />

            {/* Task List */}
            <TaskList tasks={filteredTasks} onEdit={handleOpenForm} />
          </div>
        )}
      </main>

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
