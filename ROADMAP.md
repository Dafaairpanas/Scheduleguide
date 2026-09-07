# 🧭 ROADMAP IMPLEMENTASI: CIRCULAR SCHEDULE BUILDER (HOSTLESS / NO-DB)

Aplikasi pengatur jadwal 24 jam berbasis antarmuka melingkar (*radial clock face*) interaktif dengan sistem koordinat polar, *magnetic snap*, dan penyimpanan *local-first* (tanpa *database backend*), siap *deploy* instan di Vercel.

---

## 1. Arsitektur & Prinsip Utama

* **Arsitektur:** Client-Side Only / Local-First (Next.js App Router + TypeScript + Tailwind CSS).
* **Penyimpanan:** `localStorage` dengan auto-save + fitur Export/Import data (JSON) & Undo/Redo. Tidak memerlukan database backend (Supabase/PostgreSQL ditiadakan).
* **Grafis & Interaksi:** SVG Murni (*Scalable Vector Graphics*) bertenaga Pointer Events API, matematika koordinat polar, dan kalkulasi sudut trigonometri presisi.
* **Estetika:** Premium Dark Glassmorphism, warna neon pastel pada sektor waktu, tipografi modern (*Inter* / *Outfit*), serta mikro-animasi transisi (*Framer Motion*).

---

## 2. Struktur Direktori Proyek

```text
schedulebuilder/
├── ROADMAP.md                         # Dokumen blueprint & roadmap ini
├── package.json                       # Dependensi dan script proyek
├── tsconfig.json                      # Konfigurasi TypeScript
├── tailwind.config.ts                 # Konfigurasi tema gelap & palet warna neon
├── postcss.config.mjs                 # PostCSS configuration
├── next.config.ts                     # Konfigurasi Next.js (optimasi bundle statis)
│
├── public/                            # Aset statis & ikon
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout (font, metadata SEO, provider)
    │   ├── page.tsx                   # Halaman utama aplikasi (Single Page App)
    │   └── globals.css                # Style global, token neon, scrollbar custom
    │
    ├── types/
    │   ├── schedule.ts                # Tipe data ScheduleBlock, TimeInterval, SnapStep
    │   └── tag.ts                     # Tipe data Tag/Kategori (nama, warna, ikon)
    │
    ├── lib/                           # Logic & engine matematika
    │   ├── constants.ts               # Konstanta geometri (radius jam, ukuran tick, default tags)
    │   ├── polar-math.ts              # Rumus konversi X,Y <-> Radius & Sudut (θ)
    │   ├── time-utils.ts              # Konversi Sudut <-> Jam:Menit, format waktu & snapping
    │   ├── svg-arc.ts                 # Generator SVG Path string (M ... A ... L ... A ... Z)
    │   └── storage.ts                 # Wrapper LocalStorage, parser, sanitizer, & migrasi
    │
    ├── store/                         # State management aplikasi
    │   └── useScheduleStore.ts        # Zustand store (state jadwal, tags, filter, history)
    │
    └── components/
        ├── clock/                     # Komponen Kanvas Jam Melingkar
        │   ├── CircularClock.tsx      # Wrapper utama SVG, viewBox, responsive container
        │   ├── ClockDial.tsx          # Background dial jam, lingkaran luar/dalam, aksen
        │   ├── ClockTicks.tsx         # Indikator 24 jam (angka 00-23, tick 15 & 60 menit)
        │   ├── ScheduleSlices.tsx     # Potongan busur SVG jadwal dengan warna kategori
        │   ├── SliceHandle.tsx        # Titik/garis drag untuk resize awal/akhir blok waktu
        │   ├── CurrentTimeHand.tsx    # Jarum dinamis penunjuk waktu saat ini (real-time)
        │   └── InteractionOverlay.tsx # Layer transparan penangkap mouse/touch pointer events
        │
        ├── analytics/                 # Panel Visualisasi Waktu
        │   ├── TimeBreakdown.tsx      # Distribusi persentase jam per kategori (Progress bar/Donut)
        │   └── DailyStats.tsx         # Total jam produktif, tidur, istirahat, dan waktu kosong
        │
        ├── schedule/                  # Manajemen & Kontrol Jadwal
        │   ├── ScheduleList.tsx       # Tampilan list linier alternatif jadwal hari ini
        │   ├── ScheduleItem.tsx       # Kartu item jadwal (edit, hapus, quick color)
        │   ├── EditBlockModal.tsx     # Modal edit detail judul, waktu, tag, catatan
        │   └── TagManagerModal.tsx    # Modal kelola kategori & custom warna neon
        │
        └── ui/                        # Komponen UI Reusable
            ├── Header.tsx             # Navbar minimalis (Logo, tanggal, Undo/Redo, Export/Import)
            ├── Tooltip.tsx            # Tooltip penunjuk waktu saat kursor mengambang di jam
            ├── Button.tsx             # Tombol interaktif dengan efek glow neon
            └── Modal.tsx              # Base modal dengan animasi Framer Motion
```

---

## 3. Detail File dan Spesifikasi Fungsinya

Berikut adalah rincian fungsionalitas dan logika yang wajib ada di setiap file:

### A. Fondasi Tipe Data (`src/types/`)

#### 1. `src/types/schedule.ts`
* **Isi & Tujuan:** Mendefinisikan model data untuk potongan waktu.
* **Entitas:**
  * `ScheduleBlock`:
    * `id: string` (UUID unik).
    * `title: string` (nama kegiatan, misal: "Deep Work").
    * `startMinutes: number` (0 sampai 1439, menit dari tengah malam).
    * `endMinutes: number` (0 sampai 1439; mendukung lewati tengah malam/cross midnight).
    * `tagId: string` (merujuk ke tag kategori).
    * `notes?: string` (catatan opsional).
  * `DragMode`: `'CREATE' | 'MOVE' | 'RESIZE_START' | 'RESIZE_END' | null`.
  * `SnapInterval`: `5 | 10 | 15 | 30 | 60` (menit).

#### 2. `src/types/tag.ts`
* **Isi & Tujuan:** Mendefinisikan kategori jadwal dengan palet warna.
* **Entitas:**
  * `Tag`:
    * `id: string`
    * `name: string` (misal: "Kerja", "Istirahat", "Olahraga", "Tidur")
    * `color: string` (kode HEX warna neon pastel, misal `#38bdf8`, `#a855f7`)
    * `icon?: string` (nama ikon Lucide)

---

### B. Core Mesin Matematika & Geometri (`src/lib/`)

#### 1. `src/lib/constants.ts`
* **Isi & Tujuan:** Parameter statis kanvas lingkaran agar mudah diubah secara terpusat.
* **Konstanta:**
  * `CLOCK_CENTER = 300` (titik pusat X dan Y pada viewBox `0 0 600 600`).
  * `OUTER_RADIUS = 260` (radius tepi luar busur jadwal).
  * `INNER_RADIUS = 170` (radius tepi dalam busur / lubang donut).
  * `TICK_RADIUS = 280` (posisi radius angka 00-23).
  * `DEFAULT_TAGS`: Kategori bawaan awal (Kerja, Istirahat, Belajar, Olahraga, Tidur).

#### 2. `src/lib/polar-math.ts`
* **Isi & Tujuan:** Jantung kalkulasi koordinat untuk menerjemahkan posisi mouse ke sudut melingkar.
* **Fungsi Utama:**
  * `cartesianToPolar(cx, cy, x, y)`:
    * Menerima koordinat pointer `(x, y)` dan titik pusat `(cx, cy)`.
    * Menghitung `dx = x - cx`, `dy = y - cy`.
    * Menghitung sudut radian menggunakan `Math.atan2(dy, dx)`.
    * Mengonversi ke derajat `[0° - 360°]` di mana `0°` / `360°` berada tepat di atas (arah jam 12 / 00:00).
    * Menghitung jarak radius `Math.hypot(dx, dy)`.
  * `polarToCartesian(cx, cy, radius, angleInDegrees)`:
    * Mengubah sudut dan radius kembali menjadi titik koordinat `(x, y)` untuk menggambar SVG arc.

#### 3. `src/lib/time-utils.ts`
* **Isi & Tujuan:** Konversi dua arah antara sudut derajat dan menit dalam sehari.
* **Fungsi Utama:**
  * `degreeToMinutes(degree: number): number`:
    * Formula: `minutes = (degree / 360) * 1440`.
  * `minutesToDegree(minutes: number): number`:
    * Formula: `degree = (minutes / 1440) * 360`.
  * `snapMinutes(minutes: number, step: number): number`:
    * Mengunci tarikan mouse ke kelipatan `step` (misal 15 menit): `Math.round(minutes / step) * step`.
  * `formatTime(minutes: number): string`:
    * Mengubah menit angka (misal `870`) menjadi string `"14:30"`.
  * `formatDuration(minutes: number): string`:
    * Menampilkan format durasi (misal `"2j 15m"`).

#### 4. `src/lib/svg-arc.ts`
* **Isi & Tujuan:** Membangun string SVG path `d` untuk menggambar busur donat (*donut arc slice*).
* **Fungsi Utama:**
  * `createDonutArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle)`:
    * Menghitung 4 titik krusial:
      1. Sudut luar awal `(x1, y1)`.
      2. Sudut luar akhir `(x2, y2)`.
      3. Sudut dalam akhir `(x3, y3)`.
      4. Sudut dalam awal `(x4, y4)`.
    * Memperhitungkan flag `largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0`.
    * Menghasilkan string path SVG: `M x1 y1 A r_out r_out 0 largeArc 1 x2 y2 L x3 y3 A r_in r_in 0 largeArc 0 x4 y4 Z`.
    * Menangani kasus khusus: jadwal lingkaran penuh 24 jam (360°).

#### 5. `src/lib/storage.ts`
* **Isi & Tujuan:** Manajemen persistensi data lokal tanpa database.
* **Fungsi Utama:**
  * `saveToLocalStorage(key, data)`: Menyimpan state dengan aman ke `window.localStorage`.
  * `loadFromLocalStorage(key, fallback)`: Mengambil dan memvalidasi integritas data JSON.
  * `exportScheduleBackup()`: Mengunduh jadwal sebagai file `.json`.
  * `importScheduleBackup(jsonFile)`: Membaca dan memvalidasi file JSON dari komputer pengguna.

---

### C. State Management (`src/store/`)

#### `src/store/useScheduleStore.ts` (Zustand)
* **Isi & Tujuan:** Sumber kebenaran tunggal (*Single Source of Truth*) untuk seluruh data jadwal dan interaksi pengguna.
* **State yang disimpan:**
  * `schedules: ScheduleBlock[]`: Daftar seluruh blok jadwal.
  * `tags: Tag[]`: Daftar kategori warna aktif.
  * `selectedBlockId: string | null`: Blok waktu yang sedang diklik/diedit.
  * `snapStep: SnapInterval`: Setelan magnetic snap (default 15 menit).
  * `activeDrag: DragState | null`: Status tarikan mouse saat ini (mulai dari menit berapa, sampai berapa).
  * `history: { past: ScheduleBlock[][]; future: ScheduleBlock[][] }`: State untuk fitur Undo & Redo.
* **Actions:**
  * `addSchedule(block)`
  * `updateSchedule(id, updates)`
  * `deleteSchedule(id)`
  * `addTag(tag)`, `updateTag(id, updates)`, `deleteTag(id)`
  * `setSnapStep(step)`
  * `undo()`, `redo()`
  * `importData(data)`, `resetToDefault()`

---

### D. Komponen Jam Melingkar (`src/components/clock/`)

#### 1. `src/components/clock/CircularClock.tsx`
* **Isi & Tujuan:** Kontainer utama jam yang menggabungkan seluruh layer SVG menjadi satu kesatuan interaktif.
* **Fitur:**
  * Elemen `<svg viewBox="0 0 600 600" className="w-full max-w-[550px] aspect-square select-none">`.
  * Mengintegrasikan `ClockDial`, `ClockTicks`, `ScheduleSlices`, `CurrentTimeHand`, dan `InteractionOverlay`.
  * Mengatur titik pivot dan ukuran responsif untuk layar HP maupun Desktop.

#### 2. `src/components/clock/ClockDial.tsx`
* **Isi & Tujuan:** Latar belakang visual dial jam 24-jam.
* **Fitur:**
  * Lingkaran latar belakang gelap mewah dengan gradien radial halus.
  * Garis pembatas donut luar (*outer ring*) dan donut dalam (*inner ring*).
  * Lingkaran tengah berongga (*donut hole*) yang memuat jam digital real-time atau ringkasan status blok aktif.

#### 3. `src/components/clock/ClockTicks.tsx`
* **Isi & Tujuan:** Label angka dan penanda waktu di sekeliling lingkaran.
* **Fitur:**
  * Menghasilkan 24 angka `(00, 01, 02, ... 23)` secara melingkar di sekeliling dial.
  * Garis penanda (*ticks*) tebal di setiap jam genap / setiap 3 jam.
  * Titik penanda kecil (*sub-ticks*) setiap interval 15 atau 30 menit.
  * Visual pembeda antara waktu Siang (06:00 - 18:00) dan Malam (18:00 - 06:00).

#### 4. `src/components/clock/ScheduleSlices.tsx`
* **Isi & Tujuan:** Merender potongan-potongan jadwal yang sudah dibuat pengguna.
* **Fitur:**
  * Loop melalui `schedules`.
  * Memanggil `createDonutArcPath` untuk menghasilkan bentuk busur setiap jadwal.
  * Menerapkan warna tag dengan efek *neon glow* (filter SVG gaussian blur halus saat hover).
  * Efek klik untuk memilih blok waktu, memicu animasi fokus/pop-out.

#### 5. `src/components/clock/SliceHandle.tsx`
* **Isi & Tujuan:** Titik pegangan tarikan (*drag handle*) untuk mengubah durasi waktu.
* **Fitur:**
  * Muncul di ujung awal (*start*) dan akhir (*end*) dari blok jadwal yang aktif atau saat di-hover.
  * Mengubah kursor menjadi kursor rotasi/tarik (`cursor-grab` / `cursor-ew-resize`).
  * Memberi feedback visual *glow* saat sedang ditekan/ditarik.

#### 6. `src/components/clock/CurrentTimeHand.tsx`
* **Isi & Tujuan:** Jarum penunjuk waktu aktual (saat ini) yang bergerak otomatis.
* **Fitur:**
  * Menghitung menit saat ini dari jam komputer pengguna (`new Date().getHours() * 60 + getMinutes()`).
  * Menggambar garis jarum penunjuk tipis berwarna merah neon atau cyan dari pusat lingkaran menembus cincin jadwal.
  * Dilengkapi titik pulsing penanda waktu sekarang.

#### 7. `src/components/clock/InteractionOverlay.tsx`
* **Isi & Tujuan:** Layer penangkap interaksi pointer mouse/touch yang presisi.
* **Fitur:**
  * Memasang listener `onPointerDown`, `onPointerMove`, `onPointerUp`.
  * Mencegah perilaku default (*touch-action: none* agar tidak scroll di layar sentuh).
  * Mengkalkulasi perubahan sudut secara real-time saat pengguna melakukan *click & drag* untuk membuat potongan jadwal baru atau menggeser blok yang sudah ada.
  * Memicu *magnetic snapping* setiap kelipatan menit yang dipilih.

---

### E. Komponen Analisis & Pendukung (`src/components/analytics/ & schedule/`)

#### 1. `src/components/analytics/TimeBreakdown.tsx`
* **Isi & Tujuan:** Panel visualizer statistik pembagian waktu dalam sehari (24 jam = 100%).
* **Fitur:**
  * Menghitung total menit untuk masing-masing tag.
  * Menampilkan bar persentase multi-warna horizontal atau ring donut mini.
  * Menghitung sisa waktu kosong (*Unallocated Time*) yang belum dijadwalkan.

#### 2. `src/components/schedule/ScheduleList.tsx`
* **Isi & Tujuan:** Daftar jadwal berurutan secara kronologis (dari 00:00 hingga 23:59).
* **Fitur:**
  * Sangat berguna bagi pengguna yang ingin melihat jadwal dalam bentuk daftar linear selain bentuk jam melingkar.
  * Aksi cepat: Hapus, edit judul, ubah kategori warna.

#### 3. `src/components/schedule/EditBlockModal.tsx`
* **Isi & Tujuan:** Modal pop-up untuk menyunting rincian jadwal.
* **Fitur:**
  * Input judul kegiatan, dropdown pilihan kategori/tag, input waktu mulai & selesai secara manual (apabila tidak ingin menggeser jarum jam).
  * Tombol hapus jadwal.

#### 4. `src/components/ui/Header.tsx`
* **Isi & Tujuan:** Bagian atas aplikasi.
* **Fitur:**
  * Judul aplikasi & tanggal hari ini.
  * Tombol Undo & Redo (riwayat perubahan).
  * Pilihan Magnetic Snap (5m, 10m, 15m, 30m).
  * Tombol Backup/Export JSON & Restore/Import JSON.

---

## 4. Alur Algoritma & Logika Kunci

### 1. Transformasi Pointer Mouse ke Waktu (Polar Coordinates)
```text
Mouse Event (clientX, clientY)
       ↓
BoundingClientRect SVG (hitung offset x, y relatif terhadap pusat jam)
       ↓
dx = x - centerX, dy = y - centerY
       ↓
Sudut Radian = Math.atan2(dy, dx)
       ↓
Sudut Derajat (Normalisasi jam 12 di atas): (angleDeg + 90) % 360
       ↓
Menit Dasar = (Sudut / 360) * 1440
       ↓
Magnetic Snap: Math.round(Menit Dasar / snapStep) * snapStep
       ↓
Start/End Time Jadwal Terbentuk!
```

### 2. Generator Busur SVG Donut (*Donut Arc Geometry*)
Busur jadwal membutuhkan kurva luar (*outer radius*) dan kurva dalam (*inner radius*) yang terhubung rapi membentuk sektor potongan donat tanpa overlap. Perhitungan ini diisolasi di `svg-arc.ts` sehingga dapat diuji secara mandiri (*unit-testable*).

---

## 5. Roadmap Tahapan Eksekusi

| Fase | Fokus Pekerjaan | Output / Deliverable |
| :--- | :--- | :--- |
| **Fase 1** | Inisialisasi Proyek & Setup Styling | Proyek Next.js + Tailwind + TypeScript bersih, font modern, palet warna neon di `globals.css` |
| **Fase 2** | Pembuatan Tipe & Mesin Matematika | `polar-math.ts`, `time-utils.ts`, `svg-arc.ts`, `storage.ts` terverifikasi kalkulasinya |
| **Fase 3** | Kanvas Jam SVG Statis | `ClockDial.tsx`, `ClockTicks.tsx` tampil rapi dengan angka 00-23 dan pembagian jam |
| **Fase 4** | Interaksi Drag & Magnetic Snap | `InteractionOverlay.tsx`, `ScheduleSlices.tsx`, `SliceHandle.tsx` dapat diklik-tarik untuk buat/ubah jadwal |
| **Fase 5** | State Management & Local Storage | `useScheduleStore.ts` aktif, auto-save ke `localStorage`, fitur Undo/Redo |
| **Fase 6** | Panel Analitik & Daftar Jadwal | `TimeBreakdown.tsx`, `ScheduleList.tsx`, `EditBlockModal.tsx` terintegrasi |
| **Fase 7** | Fitur Backup & Restore | Export JSON dan Import file jadwal agar data pengguna aman |
| **Fase 8** | Poles Estetika & Build Test | Animasi transisi, responsive test di mobile/desktop, siap rilis di Vercel |

---

*Dokumen ini adalah acuan resmi arsitektur dan urutan pembangunan proyek ScheduleBuilder tanpa ketergantungan database eksternal.*
