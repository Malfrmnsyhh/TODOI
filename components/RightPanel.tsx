import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useRouter } from "next/navigation";
import ActivityChart from "./ActivityChart";

export default function RightPanel() {
  const {
    tasks,
    user,
    setUser,
    setTasks,
    notifications,
    markAllAsRead,
    markAsRead,
  } = useTaskStore();
  const router = useRouter();
  const days = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false); // Toggle Popover
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const numDaysPrev = new Date(year, month, 0).getDate();

    const datesList: {
      date: number;
      isCurrentMonth: boolean;
      fullDate: Date;
    }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      datesList.push({
        date: numDaysPrev - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, numDaysPrev - i),
      });
    }

    for (let i = 1; i <= numDays; i++) {
      datesList.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    const remaining = 42 - datesList.length;
    for (let i = 1; i <= remaining; i++) {
      datesList.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return datesList;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setTasks([]);
      router.push("/login");
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  };

  const dates = getDaysInMonth();
  const today = new Date();

  // Hitung jumlah notifikasi belum dibaca
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const deadlineNotifs = notifications.filter((n) => n.type === "deadline");
  const completedNotifs = notifications.filter((n) => n.type === "completed");
  const newNotifs = notifications.filter((n) => n.type === "new");

  return (
    <aside className="w-84 flex-shrink-0 flex flex-col p-6 bg-[#0b1326] border-l border-white/10 hidden lg:flex overflow-y-auto">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-7 text-gray-400 relative">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="hover:text-white transition relative p-1.5 rounded-lg hover:bg-white/5"
            title="Notifikasi"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-[#0b1326]" />
            )}
          </button>

          {/* Popover Notifikasi Melayang */}
          {showNotifications && (
            <>
              {/* Overlay Klik Luar */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute left-0 mt-3 w-80 bg-[#151f32]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-white">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      Tandai semua sudah dibaca
                    </button>
                  )}
                </div>

                <hr className="border-white/5 mb-3" />

                {/* List Notifikasi */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar-indigo">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {/* DEADLINES */}
                      {deadlineNotifs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-2">
                            DEADLINES
                          </span>
                          <div className="space-y-2">
                            {deadlineNotifs.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition border ${
                                  n.isRead
                                    ? "bg-transparent border-transparent hover:bg-white/5"
                                    : "bg-indigo-600/5 border-indigo-500/10 hover:border-indigo-500/20"
                                }`}
                              >
                                {!n.isRead && (
                                  <span className="absolute top-3 left-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                )}
                                <div
                                  className={`p-1.5 rounded-lg bg-rose-500/20 text-rose-400 ${!n.isRead ? "ml-1.5" : ""}`}
                                >
                                  <AlertTriangle size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-1">
                                    <span className="text-xs font-bold text-gray-200 block truncate">
                                      {n.title}
                                    </span>
                                    <span className="text-[9px] text-gray-500 whitespace-nowrap">
                                      {n.timeAgo}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TUGAS SELESAI */}
                      {completedNotifs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-2 mt-1">
                            TUGAS SELESAI
                          </span>
                          <div className="space-y-2">
                            {completedNotifs.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition border ${
                                  n.isRead
                                    ? "bg-transparent border-transparent hover:bg-white/5"
                                    : "bg-indigo-600/5 border-indigo-500/10 hover:border-indigo-500/20"
                                }`}
                              >
                                {!n.isRead && (
                                  <span className="absolute top-3 left-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                )}
                                <div
                                  className={`p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 ${!n.isRead ? "ml-1.5" : ""}`}
                                >
                                  <CheckCircle2 size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-1">
                                    <span className="text-xs font-bold text-gray-200 block truncate">
                                      {n.title}
                                    </span>
                                    <span className="text-[9px] text-gray-500 whitespace-nowrap">
                                      {n.timeAgo}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TUGAS BARU */}
                      {newNotifs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-2 mt-1">
                            TUGAS BARU
                          </span>
                          <div className="space-y-2">
                            {newNotifs.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition border ${
                                  n.isRead
                                    ? "bg-transparent border-transparent hover:bg-white/5"
                                    : "bg-indigo-600/5 border-indigo-500/10 hover:border-indigo-500/20"
                                }`}
                              >
                                {!n.isRead && (
                                  <span className="absolute top-3 left-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                )}
                                <div
                                  className={`p-1.5 rounded-lg bg-sky-500/20 text-sky-400 ${!n.isRead ? "ml-1.5" : ""}`}
                                >
                                  <Plus size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-1">
                                    <span className="text-xs font-bold text-gray-200 block truncate">
                                      {n.title}
                                    </span>
                                    <span className="text-[9px] text-gray-500 whitespace-nowrap">
                                      {n.timeAgo}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <hr className="border-white/5 mt-3" />

                {/* Footer */}
                <div className="text-center pt-2.5">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center justify-center gap-1 mx-auto"
                  >
                    Tutup Notifikasi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {user && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="hover:text-red-400 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <LogOut size={14} />
            Keluar
          </button>
        )}
      </div>

      {/* Dynamic Calendar */}
      <div className="glass-panel p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold text-sm">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-1 text-gray-100">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
          {days.map((day) => (
            <div key={day} className="text-gray-500 font-medium py-1">
              {day}
            </div>
          ))}

          {dates.map((item, i) => {
            const isToday =
              item.fullDate.toDateString() === today.toDateString();

            const hasTask = tasks.some((task) => {
              if (!task.dueDate || task.isCompleted) return false;
              return (
                new Date(task.dueDate).toDateString() ===
                item.fullDate.toDateString()
              );
            });

            return (
              <div key={i} className="relative py-0.5">
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full mx-auto transition-all
                    ${isToday ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/40" : ""}
                    ${!item.isCurrentMonth ? "text-gray-700" : isToday ? "" : "text-gray-300 hover:bg-white/10 cursor-pointer"}
                  `}
                >
                  {item.date}
                </div>
                {hasTask && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="mt-4 flex-1 glass-panel rounded-2xl p-4 flex flex-col min-h-0">
        <h3 className="text-white font-semibold mb-3 text-sm">
          Riwayat Aktivitas
        </h3>
        <div className="flex-1">
          <ActivityChart />
        </div>
      </div>
    </aside>
  );
}
