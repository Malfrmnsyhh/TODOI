# TODOI - Modern Task Management App 🚀

TODOI adalah aplikasi manajemen tugas (To-Do List) modern yang dirancang dengan antarmuka premium, dinamis, dan responsif. Dibangun menggunakan teknologi web terbaru untuk memberikan pengalaman pengguna yang mulus dalam mengatur produktivitas sehari-hari.

## ✨ Fitur Utama

- **🔐 Autentikasi Aman**: Login dan registrasi yang aman menggunakan Supabase Auth.
- **📱 Desain Responsif & Premium**: Antarmuka *dark mode* dengan efek *glassmorphism* modern yang terlihat sempurna di Desktop maupun Mobile.
- **✅ Manajemen Tugas Lengkap**: Tambah, edit, hapus, dan tandai tugas selesai dengan mudah.
- **🏷️ Kategorisasi & Prioritas**: Kelompokkan tugas berdasarkan kategori dan tingkat prioritas (Tinggi, Sedang, Rendah).
- **📅 Tenggat Waktu (Due Date)**: Atur tenggat waktu dan dapatkan peringatan otomatis untuk tugas yang *Overdue* (terlambat).
- **📊 Dashboard & Analitik**: Pantau produktivitas Anda melalui grafik (Recharts) dan statistik penyelesaian tugas secara *real-time*.
- **👤 Manajemen Profil**: Kustomisasi profil Anda, termasuk nama panggilan, bio, dan unggah foto profil (Avatar) langsung ke penyimpanan cloud.
- **⚙️ Pengaturan Komprehensif**: Sesuaikan preferensi notifikasi, ubah kata sandi, hingga fitur **Ekspor Data** untuk mengunduh semua tugas Anda dalam format JSON sebagai *backup*.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Grafik**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🚀 Cara Menjalankan Secara Lokal (Local Development)

Ikuti langkah-langkah berikut untuk menjalankan TODOI di komputer Anda:

### 1. Clone Repository
```bash
git clone https://github.com/Malfrmnsyhh/TODOI.git
cd TODOI/todo-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat dua file environment di root folder `todo-app`:
1. Buat file `.env` dan masukkan konfigurasi database URL dari Supabase.
2. Buat file `.env.local` dan masukkan kunci API Supabase (URL & Anon Key).

### 4. Setup Database (Prisma)
Generate Prisma client dan jalankan migrasi database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya!

## 🌐 Deployment
Aplikasi ini dioptimalkan untuk di-*deploy* menggunakan **[Vercel](https://vercel.com/)**. Pastikan untuk menambahkan semua *Environment Variables* di pengaturan proyek Vercel Anda sebelum melakukan *deployment*.

---
*Dibuat dengan ❤️ untuk produktivitas yang lebih baik.*
