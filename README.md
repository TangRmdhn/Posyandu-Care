# Posyandu-Care 🩺

Aplikasi web pemantauan kesehatan ibu & anak untuk Posyandu (Next.js + Supabase).

Panduan ini ditulis untuk **pemula total** — belum pernah install apa pun.
Ikuti dari atas ke bawah, satu per satu. Perkiraan waktu: **15–20 menit**.

> Contoh perintah ditujukan untuk **Windows**. Catatan untuk Mac/Linux ada di tiap langkah.

---

## 1. Apa yang akan kita lakukan?

1. Install 2 program: **Node.js** dan **Git**.
2. Ambil kode proyek ini ke komputer.
3. Isi 1 file pengaturan (`.env.local`).
4. Jalankan aplikasi di komputer sendiri (`localhost:3000`).

---

## 2. Install Node.js (wajib)

Node.js menjalankan aplikasinya.

1. Buka: **https://nodejs.org**
2. Klik tombol versi **LTS** (mis. "20.x.x LTS"). Unduh.
3. Buka file yang terunduh, klik **Next → Next → Install** (biarkan semua default).
4. Selesai.

**Cek berhasil:** buka **PowerShell** (tekan tombol Windows, ketik `powershell`, Enter), lalu ketik:

```powershell
node -v
npm -v
```

Kalau muncul angka versi (mis. `v20.11.0` dan `10.2.4`), berarti **berhasil**.

> Mac: unduh installer yang sama dari nodejs.org, atau `brew install node`.

---

## 3. Install Git (wajib)

Git dipakai untuk mengambil kode.

1. Buka: **https://git-scm.com/download/win** (otomatis mulai unduh).
2. Jalankan installer → klik **Next** terus sampai **Install** (default sudah aman).

**Cek berhasil:**

```powershell
git --version
```

Kalau muncul `git version 2.xx.x`, **berhasil**.

> Mac: `git` biasanya sudah ada. Cek dengan `git --version`.

---

## 4. Ambil kode proyek

Di PowerShell, pindah ke folder tempat menyimpan (mis. Documents), lalu unduh kode:

```powershell
cd $HOME\Documents
git clone https://github.com/TangRmdhn/Posyandu-Care.git
cd Posyandu-Care
```

> **Tanpa Git?** Buka https://github.com/TangRmdhn/Posyandu-Care → tombol hijau
> **Code → Download ZIP** → ekstrak → buka foldernya di PowerShell dengan `cd`.

---

## 5. Buat file pengaturan `.env.local`

Aplikasi butuh kunci koneksi ke database (Supabase). Buat file bernama
**`.env.local`** di dalam folder proyek, isinya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://leemynhujnwjugsivtyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tempel_anon_key_di_sini
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=tempel_service_role_key_di_sini
```

**Cara dapat nilainya** (butuh akses ke project Supabase):

1. Buka **https://supabase.com/dashboard/project/leemynhujnwjugsivtyb/settings/api**
2. Salin **Project URL** → ke `NEXT_PUBLIC_SUPABASE_URL`.
3. Salin **anon public** key → ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Salin **service_role secret** key → ke `SUPABASE_SERVICE_ROLE_KEY`.

Cara cepat membuat file lewat PowerShell (lalu edit nilainya pakai Notepad):

```powershell
notepad .env.local
```

> ⚠️ **Jangan pernah** membagikan `service_role` key ke publik / commit ke GitHub.
> File `.env.local` sudah otomatis diabaikan Git.

---

## 6. Install kebutuhan aplikasi

Sekali saja. Di folder proyek:

```powershell
npm install
```

Tunggu sampai selesai (beberapa menit, butuh internet).

---

## 7. Jalankan aplikasinya 🎉

```powershell
npm run dev
```

Tunggu sampai muncul tulisan **`Ready`**, lalu buka browser ke:

**http://localhost:3000**

Untuk **berhenti**: kembali ke PowerShell, tekan **Ctrl + C**.

---

## 8. Masuk ke aplikasi

- **Orang tua:** daftar akun baru lewat tombol **Registrasi** di halaman depan.
- **Admin:** akun `admin@admin.com` (minta password ke pemilik project).
  Dari `/admin` bisa membuat akun **bidan/kader/admin** baru
  (butuh `SUPABASE_SERVICE_ROLE_KEY` terisi di langkah 5).

---

## 9. Perintah lain (opsional)

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan mode pengembangan (localhost) |
| `npm run build` | Build versi produksi |
| `npm start` | Jalankan hasil build |
| `npm test` | Jalankan uji otomatis |
| `npm run lint` | Cek gaya kode |
| `npm run typecheck` | Cek tipe TypeScript |

---

## 10. Kalau ada masalah (Troubleshooting)

- **`npm: command not found` / `node: not recognized`** → Node.js belum terpasang
  atau PowerShell belum di-restart. Tutup PowerShell, buka lagi, ulangi langkah 2.
- **Halaman error / tidak bisa login** → cek `.env.local` sudah benar (langkah 5)
  dan jalankan ulang `npm run dev`.
- **"service role key tidak ada"** saat admin membuat akun → `SUPABASE_SERVICE_ROLE_KEY`
  belum diisi di `.env.local` (atau belum di-set di Vercel saat online).
- **Port 3000 dipakai** → tutup aplikasi lain di port itu, atau jalankan
  `npm run dev -- -p 3001` lalu buka http://localhost:3001.
- **`npm install` gagal** → pastikan internet aktif, lalu ulangi.

---

## 11. Online / Deploy (opsional, lanjutan)

Aplikasi ini bisa di-online-kan gratis via **Vercel**:
hubungkan repo GitHub ini ke Vercel, masukkan 4 variabel dari langkah 5 di
**Settings → Environment Variables**, lalu Deploy. Detail di `RUNBOOK.md`.

---

## 11b. Pakai database Supabase sendiri (opsional, lanjutan)

Langkah 5–8 di atas memakai database milik pemilik project. Kalau kamu mau
pakai **project Supabase sendiri** (database kosong), ikuti ini:

1. Buat project baru di **https://supabase.com/dashboard**, catat **Project Ref**
   (mis. `abcdefghijklmnop`).
2. Isi `.env.local` (langkah 5) dengan URL + key dari **project barumu**, bukan
   ref bawaan.
3. Pasang Supabase CLI lalu terapkan seluruh skema database:

   ```powershell
   npm install -g supabase
   supabase login
   supabase link --project-ref REF_PROJECT_KAMU
   supabase db push
   ```

   `db push` menjalankan semua file di `supabase/migrations/` secara urut —
   tabel, RLS, trigger, bucket `child-photos`, sampai notifikasi. Database kosong
   langsung jadi siap pakai.

4. **Buat admin pertama** (database baru belum punya akun staff). Daftar satu
   akun lewat tombol **Registrasi** di aplikasi (jadi role `ortu`), lalu naikkan
   ke `admin` via **Dashboard → SQL Editor**:

   ```sql
   update public.profiles set role = 'admin' where email = 'email_kamu@contoh.com';
   ```

   Setelah itu login, buka `/admin`, dan buat akun **bidan/kader/admin** lain
   dari sana.

> Catatan: `next.config.mjs` membaca `NEXT_PUBLIC_SUPABASE_URL` dari env, jadi
> host project barumu otomatis terpakai (ref bawaan hanya cadangan).

---

## 12. Mau tahu lebih dalam?

- `PRESENTASI_IMPLEMENTASI.md` — ringkasan fitur & checklist (Bahasa Indonesia).
- `bigplan/` — rencana lengkap menuju produksi.
- `RUNBOOK.md` — panduan operasional.
- `CLAUDE.md` — catatan teknis untuk developer.

Selamat mencoba! 🚀
