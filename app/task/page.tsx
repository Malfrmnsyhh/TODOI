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
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import MobileNav from "@/components/MobileNav";
import {
  Loader,
  Plus,
  Menu,
  Search,
  SlidersHorizontal,
  Calendar,
  Check,
  Edit2,
  Trash2,
} from "lucide-react";
import { isOverdue } from "@/lib/utils";

export default function MyTasksPage() {
  const router = useRouter();
  const {
    tasks,
    setTasks,
    addTask,
    updateTask: storeUpdateTask,
    deleteTask: storeDeleteTask,
    loading,
    setLoading,
    user,
    setUser,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States untuk filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  // Autentikasi
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

  // Load Tugas
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

  // Handle Ubah Status / Checkbox Click
  const handleToggleTask = async (task: Task) => {
    try {
      const updated = await updateTask(task.id, {
        isCompleted: !task.isCompleted,
      });
      storeUpdateTask(task.id, updated);
    } catch (err) {
      console.error("Gagal mengubah status tugas:", err);
    }
  };

  // Handle Hapus Tugas
  const handleDeleteTask = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;
    try {
      await deleteTask(id);
      storeDeleteTask(id);
    } catch (err) {
      console.error("Gagal menghapus tugas:", err);
    }
  };

  // Form Submit
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

  // Saring/Filter Tugas
  const filteredTasks = tasks.filter((task) => {
    // 1. Filter Pencarian
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(task.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // 2. Filter Tab
    const todayStr = new Date().toDateString();
    const taskOverdue = isOverdue(task.dueDate) && !task.isCompleted;

    if (activeTab === "pending") return !task.isCompleted;
    if (activeTab === "completed") return task.isCompleted;
    if (activeTab === "overdue") return taskOverdue;

    return true;
  });

  // Pengelompokan Tugas (Hari Ini vs Mendatang)
  const todayTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === new Date().toDateString();
  });

  const upcomingTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return true; // Tanpa tenggat masuk ke upcoming/lainnya
    return new Date(task.dueDate).toDateString() !== new Date().toDateString();
  });

  if (!user && !loading) {
    return (
      <div className="h-screen w-full bg-[#0b1326] flex items-center justify-center">
        <Loader className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // Format Helper
  const formatTaskDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Hari ini";

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Besok";

    return d.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (p: string) => {
    if (p === "high") return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    if (p === "medium")
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  return (
    <div className="h-screen w-full bg-[#0b1326] flex overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1326] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-lg">Tugas Anda</span>
          <button
            onClick={() => handleOpenForm()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus size={22} />
          </button>
        </header>

        {/* Content Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Middle Task Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
              {/* Header Title with Search and Filter button icons */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Tugas Anda
                </h1>
                <div className="flex items-center gap-2">
                  {showSearch && (
                    <input
                      type="text"
                      placeholder="Cari tugas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  )}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2 text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition"
                    title="Cari"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition"
                    title="Saring"
                  >
                    <SlidersHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs Buttons */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: "all", name: "Semua" },
                  { id: "pending", name: "Tertunda" },
                  { id: "completed", name: "Selesai" },
                  { id: "overdue", name: "Jatuh Tempo" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      activeTab === tab.id
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="animate-spin text-indigo-500" size={40} />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-gray-400">Tidak ada tugas ditemukan.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* KELOMPOK 1: HARI INI */}
                  {todayTasks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                        Hari Ini
                      </h3>
                      <div className="space-y-3">
                        {todayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`group flex items-start gap-4 p-4 md:p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl transition-all ${
                              task.isCompleted ? "opacity-60" : ""
                            }`}
                          >
                            <button
                              onClick={() => handleToggleTask(task)}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                task.isCompleted
                                  ? "bg-indigo-500 text-white"
                                  : "border-2 border-white/20 hover:border-indigo-400 bg-transparent"
                              }`}
                            >
                              {task.isCompleted && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`text-sm md:text-base font-bold text-white truncate ${
                                    task.isCompleted
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <span
                                  className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${getPriorityColor(
                                    task.priority,
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                  <Calendar size={12} />
                                  {formatTaskDate(task.dueDate)}
                                </span>
                                <span className="text-[10px] text-indigo-400 font-semibold">
                                  #{task.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenForm(task)}
                                className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KELOMPOK 2: MENDATANG */}
                  {upcomingTasks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                        Mendatang / Lainnya
                      </h3>
                      <div className="space-y-3">
                        {upcomingTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`group flex items-start gap-4 p-4 md:p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl transition-all ${
                              task.isCompleted ? "opacity-60" : ""
                            }`}
                          >
                            <button
                              onClick={() => handleToggleTask(task)}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                task.isCompleted
                                  ? "bg-indigo-500 text-white"
                                  : "border-2 border-white/20 hover:border-indigo-400 bg-transparent"
                              }`}
                            >
                              {task.isCompleted && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`text-sm md:text-base font-bold text-white truncate ${
                                    task.isCompleted
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <span
                                  className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${getPriorityColor(
                                    task.priority,
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                {task.dueDate ? (
                                  <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {formatTaskDate(task.dueDate)}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-500">
                                    Tanpa tenggat
                                  </span>
                                )}
                                <span className="text-[10px] text-indigo-400 font-semibold">
                                  #{task.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenForm(task)}
                                className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Right Calendar Panel (Desktop only) */}
          <RightPanel />
        </div>

        {/* Mobile Bottom Navigation */}
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
