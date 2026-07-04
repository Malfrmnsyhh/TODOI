"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import MobileNav from "@/components/MobileNav";
import TaskForm from "@/components/TaskForm";
import {
  User,
  Bell,
  Shield,
  Database,
  Loader,
  Camera,
  Save,
  LogOut,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Menu,
  Plus,
  Check,
  CheckCircle2,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { Task } from "@/lib/types";

// tipe
type TabId = "profile" | "appearance" | "notifications" | "security" | "data";

interface SettingsTab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, tasks } = useTaskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // state
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // profile state
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  // notification state
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifCompleted, setNotifCompleted] = useState(true);
  const [notifNew, setNotifNew] = useState(true);

  // appearance state
  const [accentColor, setAccentColor] = useState("indigo");

  // feedback state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // auth check & load
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

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setNickname(user.nickname || "");
    setBio(user.bio || "");
    setAvatarUrl(user.photoUrl || null);
  }, [user]);

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";

  // ── Handlers Profile ──
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      showFeedback("error", "Ukuran foto maksimal 2MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
      showFeedback("success", "Foto berhasil di-upload! Jangan lupa simpan.");
    } catch {
      showFeedback("error", "Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showFeedback("error", "Nama tidak boleh kosong.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim(),
          bio: bio.trim(),
          photoUrl: avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setUser(data.user);
      showFeedback("success", "Profil berhasil disimpan!");
    } catch (err: unknown) {
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  // handlers security
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showFeedback("error", "Harap isi semua kolom password.");
      return;
    }
    if (newPassword.length < 8) {
      showFeedback("error", "Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback("error", "Konfirmasi password tidak cocok.");
      return;
    }
    setChangingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showFeedback("success", "Password berhasil diubah!");
    } catch (err: unknown) {
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Gagal mengubah password.",
      );
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // handlers data
  const handleExportData = () => {
    const json = JSON.stringify(
      { exportedAt: new Date().toISOString(), totalTasks: tasks.length, tasks },
      null,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todoi_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", `${tasks.length} tugas berhasil diekspor.`);
  };

  // tabs config
  const tabs: SettingsTab[] = [
    { id: "profile", label: "Profil", icon: <User size={16} /> },
    { id: "appearance", label: "Tampilan", icon: <Palette size={16} /> },
    { id: "notifications", label: "Notifikasi", icon: <Bell size={16} /> },
    { id: "security", label: "Keamanan", icon: <Shield size={16} /> },
    { id: "data", label: "Data & Privasi", icon: <Database size={16} /> },
  ];

  const accentColors = [
    { id: "indigo", label: "Indigo", bg: "bg-indigo-500" },
    { id: "violet", label: "Violet", bg: "bg-violet-500" },
    { id: "sky", label: "Sky Blue", bg: "bg-sky-500" },
    { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
    { id: "rose", label: "Rose", bg: "bg-rose-500" },
  ];

  return (
    <div className="h-screen w-full bg-[#0b1326] flex overflow-hidden font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed md:relative z-40 md:z-auto h-full transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <Sidebar
          onNewTask={() => {
            setShowForm(true);
            setSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1326] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-lg">Pengaturan</span>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus size={22} />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
              {/* ── Page Header ── */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Pengaturan
                </h1>
                <p className="text-gray-400 text-sm">
                  Kelola profil, tampilan, notifikasi, dan keamanan akun Anda.
                </p>
              </div>

              {/* ── Global Feedback ── */}
              {feedback && (
                <div
                  className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm border transition-all ${
                    feedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  {feedback.text}
                </div>
              )}

              {/* ── Tab Bar ── */}
              <div className="flex items-center gap-1 mb-8 overflow-x-auto scrollbar-hide p-1 bg-white/5 rounded-2xl border border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB: PROFIL                                         */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-5">
                      Foto Profil
                    </h2>
                    <div className="flex items-center gap-6">
                      <div
                        className="relative w-20 h-20 rounded-full cursor-pointer group flex-shrink-0"
                        onClick={handleAvatarClick}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border-2 border-indigo-500/50"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500/50">
                            {getInitials(name)}
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploading ? (
                            <Loader
                              size={20}
                              className="text-white animate-spin"
                            />
                          ) : (
                            <Camera size={20} className="text-white" />
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div>
                        <button
                          onClick={handleAvatarClick}
                          disabled={uploading}
                          className="px-4 py-2 text-sm bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition disabled:opacity-50"
                        >
                          {uploading ? "Mengunggah…" : "Ganti Foto"}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, atau WebP. Maks 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Fields */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-bold text-white">
                      Informasi Akun
                    </h2>

                    {/* Email read-only */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 text-sm">
                        <User size={15} />
                        <span>{user?.email}</span>
                      </div>
                    </div>

                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap kamu"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {/* Nama Panggilan */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Nama Panggilan{" "}
                        <span className="normal-case text-gray-600 font-normal">
                          (opsional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Misal: Rizky"
                        maxLength={30}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                      />
                      {nickname && (
                        <p className="text-xs text-gray-600 mt-1.5">
                          Sapaan di dashboard:{" "}
                          <span className="text-gray-400">
                            Halo, {nickname}!
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Ceritakan sedikit tentang dirimu…"
                        rows={3}
                        maxLength={200}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
                      />
                      <p className="text-xs text-gray-600 mt-1 text-right">
                        {bio.length}/200
                      </p>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || uploading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader size={16} className="animate-spin" />{" "}
                          Menyimpan…
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Simpan Profil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: TAMPILAN*/}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-1">
                      Warna Aksen
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">
                      Pilih warna utama yang digunakan di seluruh antarmuka.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {accentColors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setAccentColor(c.id)}
                          title={c.label}
                          className={`relative w-10 h-10 rounded-full ${c.bg} transition-transform hover:scale-110 ${accentColor === c.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#0b1326]" : ""}`}
                        >
                          {accentColor === c.id && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check size={16} className="text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-4 italic">
                      * Fitur tema warna akan sepenuhnya aktif di pembaruan
                      berikutnya.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-1">
                      Tampilan Kartu Tugas
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">
                      Pilih gaya tampilan kartu di daftar tugas Anda.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: "default",
                          label: "Default",
                          desc: "Kartu dengan padding penuh",
                        },
                        {
                          id: "compact",
                          label: "Compact",
                          desc: "Hemat ruang, lebih padat",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${opt.id === "default" ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                        >
                          <p className="text-sm font-semibold text-white">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-4 italic">
                      * Pengaturan tampilan kartu akan aktif di pembaruan
                      berikutnya.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: NOTIFIKASI*/}
              {activeTab === "notifications" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-1">
                  <h2 className="text-base font-bold text-white mb-1">
                    Preferensi Notifikasi
                  </h2>
                  <p className="text-xs text-gray-500 mb-6">
                    Pilih jenis notifikasi yang ingin Anda terima di panel
                    kanan.
                  </p>

                  {[
                    {
                      label: "Tugas Jatuh Tempo",
                      desc: "Notifikasi ketika tenggat waktu tugas sudah terlewat.",
                      icon: (
                        <AlertTriangle size={18} className="text-rose-400" />
                      ),
                      value: notifDeadline,
                      toggle: () => setNotifDeadline(!notifDeadline),
                    },
                    {
                      label: "Tugas Selesai",
                      desc: "Notifikasi saat Anda menyelesaikan sebuah tugas.",
                      icon: (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ),
                      value: notifCompleted,
                      toggle: () => setNotifCompleted(!notifCompleted),
                    },
                    {
                      label: "Tugas Baru Ditambahkan",
                      desc: "Notifikasi saat Anda menambahkan tugas baru.",
                      icon: <Plus size={18} className="text-sky-400" />,
                      value: notifNew,
                      toggle: () => setNotifNew(!notifNew),
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{item.icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={item.toggle}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item.value ? "bg-indigo-600" : "bg-white/10"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: KEAMANAN*/}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Ganti Password */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-bold text-white">
                      Ubah Password
                    </h2>

                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                        <button
                          onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                        >
                          {showCurrentPwd ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 karakter"
                          className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                        <button
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                        >
                          {showNewPwd ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {newPassword && confirmPassword && (
                      <div
                        className={`flex items-center gap-2 text-xs ${newPassword === confirmPassword ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {newPassword === confirmPassword ? (
                          <>
                            <CheckCircle2 size={13} /> Password cocok
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={13} /> Password tidak cocok
                          </>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleChangePassword}
                      disabled={changingPwd || !newPassword || !confirmPassword}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {changingPwd ? (
                        <>
                          <Loader size={15} className="animate-spin" />{" "}
                          Menyimpan…
                        </>
                      ) : (
                        <>
                          <Shield size={15} /> Ubah Password
                        </>
                      )}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-1">
                      Keluar Akun
                    </h2>
                    <p className="text-sm text-gray-400 mb-5">
                      Anda akan keluar dari semua sesi aktif di perangkat ini.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition"
                    >
                      <LogOut size={15} /> Keluar dari Akun
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: DATA & PRIVASI*/}
              {activeTab === "data" && (
                <div className="space-y-6">
                  {/* Export */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-1">
                      Ekspor Data Tugas
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      Unduh seluruh data tugas Anda dalam format JSON sebagai
                      cadangan (backup).
                    </p>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-xs px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full font-medium">
                        {tasks.length} tugas tersimpan
                      </span>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={tasks.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition disabled:opacity-40"
                    >
                      <Download size={15} /> Unduh Backup JSON
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-rose-400 mb-1">
                      Perhatian
                    </h2>
                    <p className="text-sm text-gray-400 mb-5">
                      Tindakan berikut bersifat permanen dan tidak dapat
                      dibatalkan. Harap berhati-hati.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Hapus Semua Tugas
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Menghapus {tasks.length} tugas secara permanen dari
                            akun Anda.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Yakin ingin menghapus semua ${tasks.length} tugas? Tindakan ini tidak dapat diurungkan.`,
                              )
                            ) {
                              showFeedback(
                                "error",
                                "Fitur ini akan segera tersedia di pembaruan berikutnya.",
                              );
                            }
                          }}
                          disabled={tasks.length === 0}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition disabled:opacity-40"
                        >
                          <Trash2 size={13} /> Hapus Semua
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Hapus Akun
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Menghapus akun dan semua data Anda secara permanen.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            showFeedback(
                              "error",
                              "Untuk menghapus akun, hubungi support@todoi.app.",
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition"
                        >
                          <Trash2 size={13} /> Hapus Akun
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <RightPanel />
        </div>

        <MobileNav onNewTask={() => setShowForm(true)} />
      </div>

      {showForm && (
        <TaskForm
          onSubmit={async (formData) => {
            try {
              const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
              });
              if (res.ok) {
                const newTask = await res.json();
                const { addTask } = useTaskStore.getState();
                addTask(newTask);
                setShowForm(false);
              }
            } catch (err) {
              console.error(err);
            }
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
