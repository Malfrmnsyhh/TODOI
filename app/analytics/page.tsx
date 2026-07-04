"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/lib/types";
import { fetchTasks } from "@/lib/api-client";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import MobileNav from "@/components/MobileNav";
import TaskForm from "@/components/TaskForm";
import {
  Loader,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const {
    tasks,
    setTasks,
    addTask,
    updateTask: storeUpdateTask,
    loading,
    setLoading,
    user,
    setUser,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check auth session
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

  // Load tasks
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

  if (!user && !loading) {
    return (
      <div className="h-screen w-full bg-[#0b1326] flex items-center justify-center">
        <Loader className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // --- LOGIKA HITUNG ANALITIK ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = tasks.filter((t) => !t.isCompleted).length;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(
    (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < todayMidnight,
  ).length;

  // Completion Rate
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Distribusi Prioritas (Data untuk Donut/Pie Chart)
  const highPriority = tasks.filter((t) => t.priority === "high").length;
  const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "low").length;

  const priorityData = [
    { name: "Tinggi", value: highPriority, color: "#f43f5e" }, // Rose-500
    { name: "Sedang", value: mediumPriority, color: "#f59e0b" }, // Amber-500
    { name: "Rendah", value: lowPriority, color: "#3b82f6" }, // Blue-500
  ].filter((d) => d.value > 0);

  // Fallback jika tidak ada data
  const defaultPriorityData = [
    { name: "Belum Ada Data", value: 1, color: "#475569" },
  ];

  // Distribusi Kategori (Data untuk Horizontal Bar Chart)
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const cat = t.category || "Tanpa Kategori";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name: `#${name}`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Tampilkan top 5 kategori

  // Data Tren Aktivitas (7 Hari Terakhir)
  const getTrendData = () => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const chartData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toDateString();

      const created = tasks.filter(
        (t) => new Date(t.createdAt).toDateString() === dateStr,
      ).length;

      const completed = tasks.filter(
        (t) =>
          t.isCompleted &&
          t.updatedAt &&
          new Date(t.updatedAt).toDateString() === dateStr,
      ).length;

      chartData.push({
        name: dayName,
        Selesai: completed,
        Baru: created,
      });
    }
    return chartData;
  };

  const trendData = getTrendData();

  const handleOpenForm = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  const handleAddTask = async (
    formData: Omit<Task, "id" | "isCompleted" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newTask = await res.json();
        addTask(newTask);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    }
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

      {/* ── Sidebar (Desktop / Mobile drawer) ── */}
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
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1326] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-lg">Analitik</span>
          <button
            onClick={handleOpenForm}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus size={22} />
          </button>
        </header>

        {/* Content Row */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-8">
              {/* Header Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Analitik Produktivitas
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">
                  Pantau performa, tren penyelesaian, dan distribusi beban tugas
                  Anda secara real-time.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader className="animate-spin text-indigo-500" size={40} />
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* ── Row 1: Key Metrics Grid ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Completion Card */}
                    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Selesai
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-0.5">
                          {completedTasks}
                        </h3>
                      </div>
                    </div>

                    {/* Pending Card */}
                    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10">
                      <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                        <Clock size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Tertunda
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-0.5">
                          {pendingTasks}
                        </h3>
                      </div>
                    </div>

                    {/* Overdue Card */}
                    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Terlambat
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-0.5">
                          {overdueTasks}
                        </h3>
                      </div>
                    </div>

                    {/* Rate Card */}
                    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10">
                      <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                        <Award size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Rasio Selesai
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-0.5">
                          {completionRate}%
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* ── Row 2: Tren Aktivitas ── */}
                  <div className="glass-panel p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="text-indigo-400" size={18} />
                      <h2 className="text-base font-bold text-white">
                        Tren Aktivitas 7 Hari Terakhir
                      </h2>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={trendData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorSelesai"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#6366f1"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="#6366f1"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorBaru"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Selesai"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSelesai)"
                          />
                          <Area
                            type="monotone"
                            dataKey="Baru"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBaru)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Row 3: Distribusi Prioritas & Kategori ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Donut Chart: Distribusi Prioritas */}
                    <div className="glass-panel p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col h-80">
                      <h2 className="text-base font-bold text-white mb-2">
                        Distribusi Prioritas
                      </h2>
                      <p className="text-gray-400 text-xs mb-4">
                        Porsi tugas berdasarkan tingkat kepentingannya.
                      </p>

                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="w-1/2 h-full min-h-[160px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={
                                  priorityData.length > 0
                                    ? priorityData
                                    : defaultPriorityData
                                }
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {(priorityData.length > 0
                                  ? priorityData
                                  : defaultPriorityData
                                ).map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1e293b",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Keterangan */}
                        <div className="w-1/2 flex flex-col gap-3">
                          {priorityData.length > 0 ? (
                            priorityData.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-xs text-gray-300 font-medium">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-xs text-white font-bold">
                                  {item.value} tugas
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-xs text-gray-500 py-8">
                              Tidak ada tugas aktif
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bar Chart: Kategori Teratas */}
                    <div className="glass-panel p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col h-80">
                      <h2 className="text-base font-bold text-white mb-2">
                        Beban per Kategori
                      </h2>
                      <p className="text-gray-400 text-xs mb-4">
                        Jumlah tugas di kategori teratas Anda.
                      </p>

                      <div className="flex-1 w-full min-h-[160px]">
                        {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={categoryData}
                              layout="vertical"
                              margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                              }}
                            >
                              <XAxis
                                type="number"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                              />
                              <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                width={80}
                              />
                              <Tooltip
                                cursor={false}
                                contentStyle={{
                                  backgroundColor: "#1e293b",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#6366f1"
                                radius={[0, 6, 6, 0]}
                                maxBarSize={16}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      index === 0
                                        ? "#6366f1"
                                        : "rgba(99, 102, 241, 0.6)"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-gray-500">
                            Belum ada kategori tugas
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Desktop RightPanel */}
          <RightPanel />
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav onNewTask={handleOpenForm} />
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm onSubmit={handleAddTask} onClose={handleCloseForm} />
      )}
    </div>
  );
}
