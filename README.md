# PanzzStore — Bot Auto Order Akun TikTok

Bot Telegram untuk jualan akun TikTok otomatis. Fitur admin 100% terintegrasi di **Telegram Mini App** untuk pengelolaan stok, order, dan harga yang aman dan super cepat.

## 🚀 Fitur Unggulan

- **Telegram Bot** — Pembeli bisa order, top up saldo, dan pantau riwayat langsung dari Telegram.
- **Telegram Mini App Admin** — Gak butuh web dashboard luar, kelola stok & harga langsung dari *webview* khusus Admin di dalam Telegram.
- **Auto Kirim ZIP** — Akun terkirim otomatis detik itu juga setelah pembayaran berhasil.
- **Dynamic ZIP Splitter** — Otomatis memecah file order berukuran besar untuk menghindari limit 50MB Telegram Bot API.
- **Smart Master ZIP Upload** — Admin cukup mengupload 1 file "Master ZIP" yang berisi ratusan folder akun, dan sistem akan otomatis memecah dan memprosesnya menjadi ratusan stok akun!
- **Payment Gateway Pakasir** — Pembayaran QRIS / e-Wallet otomatis dengan Webhook.
- **Firebase Database** — Database, riwayat order, dan pengaturan sinkronisasi real-time.

## 📦 Setup & Instalasi

### 1. Clone & Install Dependensi

```bash
cd "SC AUTOORDER TIKTOK"
npm install
```

### 2. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com).
2. Buat project baru dan aktifkan **Firestore Database** (mode production) & **Firebase Storage**.
3. Buka **Project Settings → Service Accounts**.
4. Klik **Generate new private key** → File JSON akan terdownload.
5. Ganti nama file tersebut menjadi `serviceAccountKey.json` dan letakkan di **folder utama** project ini.

### 3. Konfigurasi `.env`

Copy template `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit file `.env` dan isi dengan data kamu:

| Variable | Keterangan |
|---|---|
| `STORE_NAME` | Nama toko kamu (akan mengubah semua teks PanzzStore secara dinamis). |
| `ADMIN_USERNAME` | Username Telegram admin untuk tombol *Pusat Bantuan* (tanpa @). |
| `BOT_TOKEN` | Token bot dari [@BotFather](https://t.me/BotFather). |
| `ADMIN_TELEGRAM_ID` | Telegram ID admin kamu (cek via [@userinfobot](https://t.me/userinfobot)). |
| `PAKASIR_API_KEY` | API Key dari akun Pakasir (Payment Gateway). |
| `PAKASIR_SLUG` | Slug/Username akun Pakasir. |
| `BASE_URL` | URL server ngrok / VPS kamu (Wajib HTTPS). |
| `FIREBASE_STORAGE_BUCKET` | Alamat bucket Firebase Storage (cek di menu Storage Firebase). |
| `ADMIN_SECRET_KEY` | Kunci rahasia untuk otentikasi Admin Mini App (bebas diisi password apa saja). |

### 4. Setup Domain & Pakasir Webhook

Agar bot bisa menerima konfirmasi pembayaran dari Pakasir dan fitur Mini App berjalan dengan lancar, **kamu Wajib menggunakan HTTPS (Domain)**.

**Jika pakai VPS (Ubuntu/Linux):**
1. Pointing domain / subdomain kamu (misal: `toko.domainkamu.com`) ke IP VPS.
2. Setup **Nginx Reverse Proxy** untuk mengarahkan port `80/443` ke port `3000` (port Node.js).
3. Install SSL menggunakan **Certbot / Let's Encrypt**.

**Jika pakai cPanel (Shared Hosting):**
1. Gunakan menu **Setup Node.js App** di cPanel.
2. Arahkan *Application URL* ke domain / subdomain kamu (cPanel otomatis menangani HTTPS).
3. Pastikan port di `.env` menyesuaikan dengan port bawaan cPanel (atau abaikan saja karena cPanel akan melakukan *auto-routing*).

**Langkah Terakhir di Pakasir:**
1. Daftar & Login di [Pakasir](https://pakasir.com).
2. Dapatkan API Key dari menu Integrasi.
3. Edit file `.env`, ubah `BASE_URL` menjadi domain kamu (contoh: `BASE_URL=https://toko.domainkamu.com`).
4. Set Webhook URL di dashboard Pakasir ke: `https://toko.domainkamu.com/webhook/pakasir`.

### 5. Menjalankan Bot & Server

Ada beberapa cara untuk menjalankan bot ini, tergantung apakah kamu menjalankannya di komputer pribadi (Windows/Mac) atau di Server/VPS (Linux).

#### Opsi A: Jalankan di Komputer Lokal (Windows / Testing)
Gunakan opsi ini jika kamu hanya ingin mengetes bot atau menjalankannya sesekali di PC.
```bash
npm start
```
Bot sudah siap digunakan! Biarkan terminal tetap terbuka. Untuk mematikan, tekan `Ctrl + C`.

#### Opsi B: Jalankan Permanen di VPS (Linux / Ubuntu) - *Sangat Disarankan!*
Jika bot sudah siap rilis dan dihosting di VPS 24/7, gunakan **PM2** agar bot tidak mati meskipun kamu menutup terminal (SSH) atau server me-restart.

1. **Install PM2 secara global:**
   ```bash
   npm install -g pm2
   ```
2. **Jalankan aplikasi dengan PM2:**
   ```bash
   pm2 start server/index.js --name "panzzstore-bot"
   ```
3. **Agar bot otomatis menyala saat VPS direstart:**
   ```bash
   pm2 startup
   pm2 save
   ```
4. **Perintah PM2 yang sering digunakan:**
   - Melihat status bot: `pm2 status`
   - Melihat log/error bot: `pm2 logs panzzstore-bot`
   - Mematikan bot: `pm2 stop panzzstore-bot`
   - Merestart bot: `pm2 restart panzzstore-bot`

---

Untuk Admin, kamu akan melihat tombol khusus **"👨‍💻 Panel Admin"** di menu utama Telegram untuk membuka Mini App.

## 📁 Panduan Upload Akun (Mini App)

Saat menambahkan stok di Panel Admin Mini App, kamu punya dua opsi upload yang sangat canggih:

1. **Upload File `.zip` Satuan**: 1 file ZIP berisi 1 akun.
2. **Upload Master ZIP (Sangat Disarankan)**: Kumpulkan semua folder akunmu (misal 100 folder akun), blok semuanya, lalu "Compress to ZIP". Upload 1 file Master ZIP tersebut, dan sistem akan otomatis membongkar serta memecahnya menjadi 100 stok akun tersendiri di dalam database secara *real-time*!

## 📞 Support & Bantuan

Untuk bantuan dan perbaikan *source code*, silakan hubungi pengembang sistem.
