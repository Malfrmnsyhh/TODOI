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
  Search,
  SlidersHorizontal,
  Calendar,
  Check,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { isOverdue } from "@/lib/utils";
import MobileHeader from "@/components/MobileHeader";

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

  // State collapsible kelompok tugas
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    overdue: false,
    today: false,
    upcoming: false,
    noDueDate: false,
    completed: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // States untuk filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");
  const [showFilter, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">(
    "dueDate",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isFilterActive =
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "dueDate" ||
    activeTab !== "all" ||
    searchQuery !== "";

  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean)),
  );

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

  // 1. Saring/Filter Tugas
  const filteredTasks = tasks.filter((task) => {
    // A. Filter Pencarian
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(task.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // B. Filter Tab Status
    const taskOverdue = isOverdue(task.dueDate) && !task.isCompleted;
    if (activeTab === "pending") {
      if (task.isCompleted) return false;
    } else if (activeTab === "completed") {
      if (!task.isCompleted) return false;
    } else if (activeTab === "overdue") {
      if (!taskOverdue) return false;
    }

    // C. Filter Prioritas (dari Dropdown)
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    // D. Filter Kategori (dari Dropdown)
    if (categoryFilter !== "all" && task.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // 2. Urutkan (Sorting) Tugas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "priority") {
      const priorityOrder: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };
      return (
        (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9)
      );
    }
    // Urutan default: Tanggal dibuat (terbaru dahulu)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 3. Pengelompokan Tugas Terperinci (Jatuh Tempo, Hari Ini, Mendatang, Tanpa Tenggat, Selesai)
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const todayString = new Date().toDateString();

  // Overdue / Terlambat: Belum selesai & due date sudah lewat dari kemarin
  const overdueTasks = sortedTasks.filter((task) => {
    if (task.isCompleted || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate < todayMidnight && taskDate.toDateString() !== todayString;
  });

  // Hari Ini: Belum selesai & due date hari ini
  const todayTasks = sortedTasks.filter((task) => {
    if (task.isCompleted || !task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === todayString;
  });

  // Mendatang: Belum selesai & due date di masa depan (besok atau lebih baru)
  const upcomingTasks = sortedTasks.filter((task) => {
    if (task.isCompleted || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= todayMidnight && taskDate.toDateString() !== todayString;
  });

  // Tanpa Tenggat: Belum selesai & tidak punya due date
  const noDueDateTasks = sortedTasks.filter((task) => {
    return !task.isCompleted && !task.dueDate;
  });

  // Selesai: Semua tugas yang telah dicentang/selesai
  const completedTasks = sortedTasks.filter((task) => task.isCompleted);

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

  const renderTaskGroupSection = (
    title: string,
    groupTasks: Task[],
    sectionKey: "overdue" | "today" | "upcoming" | "noDueDate" | "completed",
    bulletColor: string
  ) => {
    if (groupTasks.length === 0) return null;
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div className="space-y-3">
        {/* Header Section Interaktif */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between text-left py-2.5 hover:bg-white/5 px-2 rounded-xl transition group/hdr"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${bulletColor}`} />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-normal">
                {groupTasks.length}
              </span>
            </h3>
          </div>
          <div className="text-gray-500 group-hover/hdr:text-white transition">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* List Tugas */}
        {!isCollapsed && (
          <div className="space-y-3 pl-2 transition-all duration-300">
            {groupTasks.map((task) => (
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
        )}
      </div>
    );
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
        <MobileHeader />

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
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilter)}
                      className={`p-2 border rounded-xl transition ${
                        showFilter ||
                        priorityFilter !== "all" ||
                        categoryFilter !== "all" ||
                        sortBy !== "dueDate"
                          ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
                          : "text-gray-400 hover:text-white border-white/10 hover:bg-white/5"
                      }`}
                      title="Filter & Urutan"
                    >
                      <SlidersHorizontal size={18} />
                    </button>

                    {showFilter && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowFilters(false)}
                        />

                        <div className="absolute right-0 mt-2 w-64 bg-[#1e293b]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                          {/* Sorting */}
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                              Urutkan
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-300">
                              {[
                                {
                                  id: "dueDate",
                                  name: "Tenggat Waktu (Terdekat)",
                                },
                                {
                                  id: "priority",
                                  name: "Prioritas (Tertinggi)",
                                },
                                {
                                  id: "createdAt",
                                  name: "Tanggal Dibuat (Terbaru)",
                                },
                              ].map((option) => (
                                <label
                                  key={option.id}
                                  className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-white/5 rounded transition hover:text-white"
                                >
                                  <input
                                    type="radio"
                                    name="sortBy"
                                    checked={sortBy === option.id}
                                    onChange={() => setSortBy(option.id as any)}
                                    className="accent-indigo-500"
                                  />
                                  <span>{option.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <hr className="border-white/5 mb-4" />

                          {/* Priority Filter */}
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                              Filter Prioritas
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-300">
                              {[
                                { id: "all", name: "Semua Prioritas" },
                                { id: "high", name: "Tinggi (High)" },
                                { id: "medium", name: "Sedang (Medium)" },
                                { id: "low", name: "Rendah (Low)" },
                              ].map((option) => (
                                <label
                                  key={option.id}
                                  className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-white/5 rounded transition hover:text-white"
                                >
                                  <input
                                    type="radio"
                                    name="priorityFilter"
                                    checked={priorityFilter === option.id}
                                    onChange={() =>
                                      setPriorityFilter(option.id as any)
                                    }
                                    className="accent-indigo-500"
                                  />
                                  <span>{option.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <hr className="border-white/5 mb-4" />

                          {/* Category Filter */}
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                              Filter Kategori
                            </h4>
                            <select
                              value={categoryFilter}
                              onChange={(e) =>
                                setCategoryFilter(e.target.value)
                              }
                              className="w-full bg-[#0b1326] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="all">Semua Kategori</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  #{cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Reset */}
                          {isFilterActive && (
                            <>
                              <hr className="border-white/5 mt-4 mb-3" />
                              <button
                                onClick={() => {
                                  setPriorityFilter("all");
                                  setCategoryFilter("all");
                                  setSortBy("dueDate");
                                  setActiveTab("all");
                                  setSearchQuery("");
                                }}
                                className="w-full text-xs text-rose-400 hover:text-rose-300 font-semibold py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl transition"
                              >
                                Reset Filter
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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

              {/* Active Filter Badges */}
              {(priorityFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-[11px] text-indigo-300 font-medium">
                      Cari: &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")}>
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {priorityFilter !== "all" && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-medium">
                      Prioritas: {priorityFilter}
                      <button onClick={() => setPriorityFilter("all")}>
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== "all" && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full text-[11px] text-sky-300 font-medium">
                      #{categoryFilter}
                      <button onClick={() => setCategoryFilter("all")}>
                        <X size={11} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="animate-spin text-indigo-500" size={40} />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-gray-400">Tidak ada tugas ditemukan.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Kelompok 1: Terlambat / Jatuh Tempo */}
                  {renderTaskGroupSection("Jatuh Tempo", overdueTasks, "overdue", "bg-rose-500")}

                  {/* Kelompok 2: Hari Ini */}
                  {renderTaskGroupSection("Hari Ini", todayTasks, "today", "bg-indigo-500")}

                  {/* Kelompok 3: Mendatang */}
                  {renderTaskGroupSection("Mendatang", upcomingTasks, "upcoming", "bg-sky-500")}

                  {/* Kelompok 4: Tanpa Tenggat */}
                  {renderTaskGroupSection("Tanpa Tenggat", noDueDateTasks, "noDueDate", "bg-gray-500")}

                  {/* Kelompok 5: Selesai */}
                  {renderTaskGroupSection("Selesai", completedTasks, "completed", "bg-emerald-500")}
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
