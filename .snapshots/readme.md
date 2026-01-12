# Admin Pembelian Toko

Aplikasi web sederhana untuk mengelola data pembelian dan stok produk toko menggunakan Node.js, Express, EJS, dan MySQL.

## Fitur

- Menampilkan daftar produk dan stok.
- Input data pembelian (menambah stok).
- Melihat riwayat pembelian.
- Cancel pembelian oleh admin (status menjadi CANCELLED dan stok dikembalikan).

## Teknologi

- Node.js
- Express.js
- EJS (server-side templating)
- MySQL (database SQL)
- CSS sederhana (tanpa framework)

## Persiapan Lingkungan

1. Pastikan sudah terpasang:
   - Node.js (LTS)
   - MySQL server (bisa via XAMPP / Laragon / Docker)
2. Clone repository:

   git clone https://github.com/jeponchan/Sistem-Admin-Pembelian.git
   cd Sistem-Admin-Pembelian

3. Install dependency:
        npm install

## Setup Database

1. Buat database dan tabel:
    - Buka MySQL (phpMyAdmin / CLI).

Import file SQL: mysql -u root -p < sql/schema.sql
File sql/schema.sql akan:

    - Membuat database toko_db.

    - Membuat tabel:

        1. products

        2. product_stock

        3. purchases

    - Mengisi 10 produk awal dan stok 100 per produk, seperti pola sistem inventory sederhana.

2. Jika perlu, sesuaikan kredensial database di config/db.js:

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'toko_db'
});

## Menjalankan Aplikasi

npm start

Lalu buka di browser:

    http://localhost:3000

## Alur Penggunaan

1. Buka halaman dashboard:

    Menampilkan daftar produk dan stok saat ini.

2. Menu Produk:

    Menampilkan data produk lengkap dengan harga dan stok.

3. Menu Pembelian:

    - Menampilkan daftar pembelian (riwayat transaksi).

    - Menampilkan status CONFIRMED atau CANCELLED.

    - Tersedia tombol Cancel untuk pembelian yang masih CONFIRMED.

4. Menu Input Pembelian:

    - Pilih produk.

    - Masukkan jumlah (qty).

    - Submit untuk menyimpan pembelian dan menambah stok produk.

5. Saat pembelian di-cancel:

    - Status pembelian berubah menjadi CANCELLED.

    - cancelled_at diisi waktu pembatalan.

    - Stok produk dikurangi kembali sebesar jumlah pembelian.