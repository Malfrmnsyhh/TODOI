'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/lib/types';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api-client';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilters from '@/components/TaskFilters';
import StatsCard from '@/components/StatsCard';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import { Loader } from 'lucide-react';

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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenForm();
      }
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
    <div className="h-screen w-full bg-[#0b1326] flex overflow-hidden font-sans">
      
      {/* Left Sidebar */}
      <Sidebar onNewTask={() => handleOpenForm()} />

      {/* Center Workspace */}
      <main className="flex-1 h-full overflow-y-auto px-8 py-8 custom-scrollbar">
        {/* Workspace Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Good morning, Alex!</h1>
          <p className="text-gray-400">
            You have <span className="text-white font-semibold">{tasks.filter(t => !t.isCompleted).length} tasks</span> to complete today. Let's make it productive.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <StatsCard />

            {/* Task Filters (Tabs) */}
            <TaskFilters />

            {/* Task List */}
            <div className="glass-panel p-6 rounded-2xl">
              <TaskList tasks={filteredTasks} onEdit={handleOpenForm} />
            </div>
          </div>
        )}
      </main>

      {/* Right Panel */}
      <RightPanel />

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
