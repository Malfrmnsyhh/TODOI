# Panduan Rekonstruksi Project: FocusFlow Todo App 🚀

Selamat! Anda telah membangun prototype antarmuka (UI/UX) yang sangat modern, bersih, dan memikat di **FocusFlow**. Namun, saat ini aplikasi masih bersifat **statis** (data disimpan sementara di memori API / `localStorage` browser) dan belum memiliki fitur autentikasi serta basis data nyata.

Panduan ini disusun secara detail untuk memandu Anda (atau asisten AI Anda) dalam merekonstruksi sistem secara bertahap, beralih dari statis menjadi dinamis, menghubungkan database, menambahkan sistem Autentikasi (Multi-User), mengubah kalender menjadi dinamis, dan menambahkan grafik aktivitas profesional.

---

## 📅 Daftar Isi
1. [Prinsip Arsitektur Baru](#prinsip-arsitektur-baru)
2. [Menambahkan Database di Tengah Project (Apakah Aman?)](#menambahkan-database-di-tengah-project-apakah-aman)
3. [Langkah 1: Setup Database & ORM (Prisma & SQLite/PostgreSQL)](#langkah-1-setup-database--orm-prisma--sqlitepostgresql)
4. [Langkah 2: Autentikasi Sederhana & Aman (JWT + HTTP-Only Cookies)](#langkah-2-autentikasi-sederhana--aman-jwt--http-only-cookies)
5. [Langkah 3: Integrasi API & State Management (Zustand)](#langkah-3-integrasi-api--state-management-zustand)
6. [Langkah 4: Kalender Dinamis (Menampilkan Bulan Aktif & Deadline)](#langkah-4-kalender-dinamis-menampilkan-bulan-aktif--deadline)
7. [Langkah 5: Visualisasi Grafik Aktivitas Profesional (Recharts)](#langkah-5-visualisasi-grafik-aktivitas-profesional-recharts)
8. [Langkah Selanjutnya: Dashboard Admin](#langkah-selanjutnya-dashboard-admin)

---

## 🛠 Prinsip Arsitektur Baru

Sebelum kita mulai menulis kode, mari pahami visual alur kerja sistem yang baru:

```text
[ Browser / Client ] (Zustand Store)
        │
        ├── (1) Kirim Kredensial ──> [/api/auth/login] ──> Simpan JWT di HTTP-Only Cookie
        │
        ├── (2) Kirim Request ─────> [/api/tasks] ───────> Verifikasi JWT Cookie
                                                                │
                                                       [ Prisma Client ORM ]
                                                                │
                                                       [ Database (SQLite/PG) ]
```

Dengan arsitektur ini:
- **Keamanan Tinggi:** Token JWT disimpan di cookie berjenis `httpOnly`, sehingga kebal terhadap serangan XSS (pencurian token via JS script).
- **Isolasi Data User:** Setiap user hanya bisa melihat, membuat, mengedit, dan menghapus tugas milik mereka sendiri (`userId` filtering di level database).
- **Siap Produksi:** Struktur ini siap di-deploy ke Vercel dengan database Postgres cloud (seperti Supabase, Neon, atau database lokal SQLite).

---

## ❓ Menambahkan Database di Tengah Project (Apakah Aman?)

**Sangat Aman dan Lumrah.**
Dalam siklus hidup rekayasa perangkat lunak (software engineering), membuat prototype visual (statis/mock) terlebih dahulu adalah praktik terbaik (*UI-First Development*). Ini memastikan klien/user menyukai desainnya sebelum kita membuang energi merancang arsitektur database.

Karena project Next.js Anda sudah menggunakan routing API (`app/api/tasks/route.ts`), kita hanya perlu **mengganti isi fungsi penanganan** di dalam API route tersebut untuk melakukan query ke database menggunakan ORM (Prisma), tanpa perlu mengubah struktur visual komponen React Anda secara ekstrem!

---

## 🗄 Langkah 1: Setup Database & ORM (Prisma & SQLite/PostgreSQL)

Kami merekomendasikan **Prisma ORM** dengan **SQLite** untuk pengembangan lokal (karena zero-configuration, tidak perlu instal software database di PC), dan sangat mudah dimigrasikan ke **PostgreSQL** (seperti Supabase) saat naik ke produksi (Vercel).

### 1. Install Dependensi yang Dibutuhkan
Jalankan perintah berikut di terminal Anda:
```bash
npm install @prisma/client bcryptjs jsonwebtoken
npm install -D prisma @types/bcryptjs @types/jsonwebtoken
```

### 2. Inisialisasi Prisma
Jalankan perintah ini untuk membuat konfigurasi Prisma awal:
```bash
npx prisma init
```
Ini akan menghasilkan folder baru `prisma/` dengan file `schema.prisma` di dalamnya, serta file `.env` di root project Anda.

### 3. Definisikan Schema Database
Buka file `prisma/schema.prisma` dan ganti isinya dengan kode berikut:

```prisma
datasource db {
  provider = "sqlite" // Ganti dengan "postgresql" jika menggunakan Supabase/Neon di produksi
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // Akan di-hash menggunakan bcryptjs
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  category    String   @default("general")
  priority    String   @default("medium") // "high", "medium", "low"
  dueDate     String?
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 4. Konfigurasi Environment Variable (`.env`)
Buka file `.env` di root project Anda dan sesuaikan koneksi database serta JWT secret:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="ganti-dengan-string-rahasia-yang-sangat-panjang-dan-unik-12345"
NEXT_PUBLIC_API_URL="/api"
```

### 5. Jalankan Migrasi Database Pertama
Buat tabel database nyata berdasarkan schema di atas dengan menjalankan perintah berikut:
```bash
npx prisma migrate dev --name init
```
*Perintah ini otomatis membuat database lokal SQLite bernama `dev.db` di dalam folder `prisma/` dan men-generate Prisma Client.*

---

## 🔒 Langkah 2: Autentikasi Sederhana & Aman (JWT + HTTP-Only Cookies)

Kita akan membuat sistem login dan registrasi berbasis cookie HTTP-only tanpa library eksternal yang rumit, menjaganya tetap ringan dan kompatibel secara penuh dengan Next.js App Router.

### 1. Helper Prisma Client
Buat file `lib/prisma.ts` untuk memastikan kita tidak membuat koneksi database ganda saat proses hot-reload di mode development:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Endpoint Registrasi (`app/api/auth/register/route.ts`)
Buat file baru ini untuk memproses pembuatan akun user baru dengan enkripsi password:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}
```

### 3. Endpoint Login (`app/api/auth/login/route.ts`)
Buat file baru ini untuk memverifikasi kredensial dan menerbitkan JWT cookie:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-focusflow';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Kredensial salah atau tidak ditemukan' }, { status: 400 });
    }

    // Cocokkan password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Kredensial salah atau tidak ditemukan' }, { status: 400 });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Buat response dengan cookie httpOnly
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 Hari dalam detik
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Gagal melakukan login' }, { status: 500 });
  }
}
```

### 4. Endpoint Logout (`app/api/auth/logout/route.ts`)
Buat file baru ini untuk menghapus token cookie:
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil logout' });
  
  // Hapus cookie dengan mengatur maxAge ke 0
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
```

### 5. Endpoint Me / Cek Sesi (`app/api/auth/me/route.ts`)
Buat file baru ini untuk mengambil profil user yang sedang login saat aplikasi dimuat:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-focusflow';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Sesi kedaluwarsa atau tidak valid' }, { status: 401 });
  }
}
```

---

## 🔌 Langkah 3: Integrasi API & State Management (Zustand)

Sekarang kita akan menghubungkan tugas (tasks) ke user dengan membaca cookie autentikasi di dalam rute API tugas.

### 1. Update Route Get & Post Tasks (`app/api/tasks/route.ts`)
Ganti isi file `app/api/tasks/route.ts` dengan kode berikut yang menggunakan Prisma dan memverifikasi user:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-focusflow';

// Fungsi helper untuk mendapatkan userId dari cookie
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data tugas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Judul tugas wajib diisi' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        category: category || 'general',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        userId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Gagal membuat tugas baru' }, { status: 500 });
  }
}
```

### 2. Update Route Detail Tasks (`app/api/tasks/[id]/route.ts`)
Ganti isi file `app/api/tasks/[id]/route.ts` dengan kode berikut:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-focusflow';

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const taskExists = await prisma.task.findFirst({
      where: { id: resolvedParams.id, userId },
    });

    if (!taskExists) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: resolvedParams.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority,
        dueDate: body.dueDate,
        isCompleted: body.isCompleted,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui tugas' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskExists = await prisma.task.findFirst({
      where: { id: resolvedParams.id, userId },
    });

    if (!taskExists) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus tugas' }, { status: 500 });
  }
}
```

### 3. Tambahkan Autentikasi ke Zustand Store (`store/taskStore.ts`)
Buka file `store/taskStore.ts` dan integrasikan data user login agar bisa diakses global. Tambahkan variabel state `user` dan action auth:

```typescript
import { create } from 'zustand';
import { Task, FilterState } from '@/lib/types';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskStore {
  tasks: Task[];
  filters: FilterState;
  loading: boolean;
  user: User | null; // Tambahkan state user

  setUser: (user: User | null) => void; // Tambahkan action setUser
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  getFilteredTasks: () => Task[];
  getStats: () => {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

// ... kode initialFilters tetap sama ...

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: initialFilters,
  loading: false,
  user: null, // Default guest

  setUser: (user) => set({ user }),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    })),

  // ... sisanya (getFilteredTasks, getStats, filters) tetap sama ...
}));
```

### 4. Buat Halaman Registrasi & Login di Frontend
Anda dapat membuat halaman modern sederhana `/login` dan `/register` di folder `app/login/page.tsx` dan `app/register/page.tsx`. Halaman ini akan memanggil API `/api/auth/login` menggunakan `fetch`, menyimpan response user ke dalam Zustand Store `setUser(data.user)`, kemudian me-redirect ke dashboard utama (`/`).

---

## 📅 Langkah 4: Kalender Dinamis (Menampilkan Bulan Aktif & Deadline)

Di file `components/RightPanel.tsx`, kalender saat ini di-hardcode ke Oktober 2023. Mari ubah kalender tersebut agar **dinamis** menampilkan bulan saat ini, berpindah bulan secara interaktif (Next/Prev), dan **menyoroti tanggal di mana tugas Anda jatuh tempo!**

Ganti kode di `components/RightPanel.tsx` dengan implementasi dinamis berikut:

```typescript
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Search, LogOut } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import ActivityChart from './ActivityChart'; // Kita akan buat ini di Langkah 5

export default function RightPanel() {
  const { tasks, user, setUser } = useTaskStore();
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // State untuk tanggal kalender aktif
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Daftar nama bulan
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Logic generate hari kalender (termasuk abu-abu tanggal bulan sebelum/sesudah)
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const numDaysPrev = new Date(year, month, 0).getDate();

    const datesList = [];

    // Hari dari bulan sebelumnya
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      datesList.push({
        date: numDaysPrev - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, numDaysPrev - i),
      });
    }

    // Hari dari bulan aktif
    for (let i = 1; i <= numDays; i++) {
      datesList.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // Hari dari bulan berikutnya (melengkapi kotak grid 6 baris x 7 kolom = 42 elemen)
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error('Logout gagal:', err);
    }
  };

  const dates = getDaysInMonth();
  const today = new Date();

  return (
    <aside className="w-80 h-full flex flex-col p-6 bg-[#0b1326] border-l border-white/10 hidden lg:flex flex-shrink-0">
      {/* Top Icons & Profile Info */}
      <div className="flex justify-between items-center mb-8 text-gray-400">
        <div className="flex gap-2">
          {user && (
            <button 
              onClick={handleLogout} 
              title="Logout" 
              className="hover:text-red-400 transition flex items-center gap-1 text-xs"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button className="hover:text-white transition"><Search size={20} /></button>
          <button className="hover:text-white transition relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Calendar Widget */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold">{monthNames[month]} {year}</h3>
          <div className="flex gap-2 text-gray-400">
            <button onClick={handlePrevMonth} className="hover:text-white p-1 rounded hover:bg-white/5 transition">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNextMonth} className="hover:text-white p-1 rounded hover:bg-white/5 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-xs">
          {/* Days Header */}
          {days.map(day => (
            <div key={day} className="text-gray-500 font-medium">{day}</div>
          ))}

          {/* Dates */}
          {dates.map((item, i) => {
            const isToday =
              item.fullDate.getDate() === today.getDate() &&
              item.fullDate.getMonth() === today.getMonth() &&
              item.fullDate.getFullYear() === today.getFullYear();

            // Cek apakah ada tugas yang jatuh tempo di tanggal ini
            const hasTaskOnDate = tasks.some(task => {
              if (!task.dueDate || task.isCompleted) return false;
              const dDate = new Date(task.dueDate);
              return (
                dDate.getDate() === item.fullDate.getDate() &&
                dDate.getMonth() === item.fullDate.getMonth() &&
                dDate.getFullYear() === item.fullDate.getFullYear()
              );
            });

            return (
              <div key={i} className="relative py-1">
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full mx-auto text-xs transition-all
                    ${isToday ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/40' : ''}
                    ${!item.isCurrentMonth ? 'text-gray-600' : isToday ? '' : 'text-gray-300 hover:bg-white/10 cursor-pointer'}
                  `}
                >
                  {item.date}
                </div>
                {/* Indikator Titik Neon jika ada task yang pending */}
                {hasTaskOnDate && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Chart (Recharts) */}
      <div className="mt-8 flex-1 glass-panel rounded-2xl p-5 flex flex-col">
        <h3 className="text-white font-semibold mb-4">Activity History</h3>
        <div className="flex-1 min-h-[200px]">
          <ActivityChart />
        </div>
      </div>
    </aside>
  );
}
```

---

## 📊 Langkah 5: Visualisasi Grafik Aktivitas Profesional (Recharts)

Daripada menampilkan teks abu-abu "Chart Coming Soon", mari kita pasang pustaka visualisasi **Recharts** yang berbasis SVG, sangat interaktif, sepenuhnya responsif, dan terlihat profesional.

### 1. Install Recharts
Jalankan di terminal Anda:
```bash
npm install recharts
```

### 2. Buat Komponen Grafik (`components/ActivityChart.tsx`)
Buat file baru bernama `components/ActivityChart.tsx`. Grafik ini secara dinamis menghitung jumlah tugas berdasarkan kategori (atau status penyelesaian) dari Zustand Store untuk disajikan dalam bentuk grafik garis / area yang bernuansa futuristik (neon glow):

```typescript
'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useTaskStore } from '@/store/taskStore';

export default function ActivityChart() {
  const { tasks } = useTaskStore();

  // Menghitung statistik aktivitas 7 hari terakhir secara dinamis
  const getChartData = () => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' }); // "Sen", "Sel", dst.
      
      // Hitung task yang dibuat atau selesai pada hari ini
      const completedCount = tasks.filter(task => {
        if (!task.isCompleted || !task.updatedAt) return false;
        const compDate = new Date(task.updatedAt);
        return compDate.toDateString() === d.toDateString();
      }).length;

      const createdCount = tasks.filter(task => {
        const createDate = new Date(task.createdAt);
        return createDate.toDateString() === d.toDateString();
      }).length;

      data.push({
        name: label,
        'Tugas Selesai': completedCount,
        'Tugas Baru': createdCount,
      });
    }

    return data;
  };

  const chartData = getChartData();

  // Jika tidak ada data sama sekali, tampilkan default data agar chart tetap cantik berputar
  const isNoData = tasks.length === 0;
  const displayData = isNoData 
    ? [
        { name: 'Min', 'Tugas Selesai': 2, 'Tugas Baru': 3 },
        { name: 'Sen', 'Tugas Selesai': 4, 'Tugas Baru': 5 },
        { name: 'Sel', 'Tugas Selesai': 3, 'Tugas Baru': 4 },
        { name: 'Rab', 'Tugas Selesai': 5, 'Tugas Baru': 6 },
        { name: 'Kam', 'Tugas Selesai': 4, 'Tugas Baru': 2 },
        { name: 'Jum', 'Tugas Selesai': 6, 'Tugas Baru': 5 },
        { name: 'Sab', 'Tugas Selesai': 7, 'Tugas Baru': 8 },
      ]
    : chartData;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="Tugas Selesai" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
            <Area 
              type="monotone" 
              dataKey="Tugas Baru" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCreated)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 text-xs mt-3 text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block"></span>
          <span>Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
          <span>Tugas Baru</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔑 Langkah Selanjutnya: Dashboard Admin

Fokus saat ini adalah mematangkan fungsionalitas **User Dashboard** agar tuntas 100% dan sepenuhnya terikat pada database personal masing-masing user. 

Setelah user dashboard ini siap dan berjalan stabil di SQLite/PostgreSQL, Anda dapat menambahkan **Dashboard Admin** di rute terpisah seperti `/admin` pada tahap akhir. Di dashboard admin tersebut, Anda dapat menarik agregasi statistik global menggunakan query Prisma sederhana:
```typescript
// Contoh query admin global
const totalUsers = await prisma.user.count();
const totalTasksCreated = await prisma.task.count();
const totalTasksCompleted = await prisma.task.count({ where: { isCompleted: true } });
```

---

## 🎯 Kesimpulan & Rekomendasi
1. **Siklus Implementasi Aman:** Anda dapat mulai memasang Prisma & Recharts secara bertahap tanpa takut merusak CSS/desain retro neon fantastis yang sudah ada.
2. **Kemandirian Data:** Integrasi JWT Http-Only memastikan data bersifat aman, ter-enkripsi, dan user-specific.
3. **Estetika Lebih Hidup:** Fitur titik merah neon pada kalender dinamis (untuk deadline tugas) dan grafik aktivitas dari `Recharts` akan melipatgandakan kualitas profesionalitas visual aplikasi Anda.

Mari kita wujudkan rekonstruksi sistem ini untuk mengubah **FocusFlow** menjadi platform SaaS Todo yang tangguh dan siap pakai! 🚀
