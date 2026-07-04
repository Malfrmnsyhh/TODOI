"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/lib/types";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api-client";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import TaskFilters from "@/components/TaskFilters";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import StatsGrid from "@/components/StatsGrid";
import ActivitySection from "@/components/ActivitySection";
import MobileNav from "@/components/MobileNav";
import { Loader, Plus, Menu, X } from "lucide-react";

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
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
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
        console.error("Error loading tasks:", error);
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
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleOpenForm();
      }
      if (e.key === "Escape") {
        handleCloseForm();
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showForm]);

  const handleAddTask = async (
    formData: Omit<Task, "id" | "isCompleted" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const response = await createTask(formData);
      addTask(response);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = async (
    formData: Omit<Task, "id" | "isCompleted" | "createdAt" | "updatedAt">,
  ) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, formData);
      storeUpdateTask(editingTask.id, updated);
      setEditingTask(undefined);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating task:", error);
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
    if (h < 12) return "Selamat pagi";
    if (h < 17) return "Selamat siang";
    return "Selamat malam";
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
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          onNewTask={() => {
            handleOpenForm();
            setSidebarOpen(false);
          }}
        />
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

        {/* Content Row: Main (scrollable) + RightPanel (fixed) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content (scrollable) */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-8 py-6 md:py-8">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {greeting()},{" "}
                  {user?.nickname || user?.name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  Kamu punya{" "}
                  <span className="text-white font-semibold">
                    {tasks.filter((t) => !t.isCompleted).length} tugas
                  </span>{" "}
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
                  <div className="mt-8">
                    <StatsGrid />
                  </div>

                  {/* Activity Chart */}
                  <div className="mt-8">
                    <ActivitySection />
                  </div>

                  {/* Task List Section */}
                  <div className="bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col overflow-hidden max-h-[600px] shadow-xl mt-8">
                    {/* Header: Sticky / Tetap */}
                    <div className="p-5 md:p-6 pb-4 border-b border-white/5 bg-[#0F172A]/95 backdrop-blur sticky top-0 z-10">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                        Daftar Tugas
                      </h2>
                      <TaskFilters />
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 pt-2 custom-scrollbar-indigo">
                      <TaskList
                        tasks={filteredTasks}
                        onEdit={handleOpenForm}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ── Right Panel (Desktop only) — OUTSIDE scrollable main ── */}
          <RightPanel />
        </div>

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
