# Rancang Bangun Sistem Informasi Manajemen Transaksi Jasa dan Inventaris pada BEB Production Berbasis Web

Sistem Informasi Manajemen operasional yang dirancang khusus untuk **BEB Production** guna menangani pengelolaan transaksi pemesanan (*booking*) jasa digital media serta manajemen aset logistik/inventaris secara terintegrasi dan *real-time*.

---

## 🏗️ Arsitektur & Teknologi Sistem (Tech Stack)

Aplikasi ini dibangun menggunakan arsitektur modern berbasis *Serverless Cloud Automation* untuk menjamin skalabilitas, kecepatan akses, serta stabilitas sistem 24/7 tanpa ketergantungan pada server lokal.

*   **Frontend**: React.js (Vite) – Menyediakan antarmuka dashboard admin dan formulir pelanggan yang responsif, cepat, dan interaktif.
*   **Deployment**: Vercel – Infrastruktur *cloud hosting* global untuk memastikan aplikasi frontend dapat diakses dengan performa tinggi.
*   **Database**: Supabase (PostgreSQL) – Media penyimpanan basis data relasional yang andal dengan dukungan fitur *stored procedures* dan *database triggers*.
*   **Automation Engine**: n8n Cloud – Platform integrasi workflow di awan yang bertindak sebagai *webhook handler* otomatis untuk meneruskan data ke ekosistem eksternal.
*   **Notification Gateway**: Telegram Bot API – Media penyampaian notifikasi instan secara *real-time* kepada pihak manajemen BEB Production.

---

## 🔄 Alur Kerja Otomasi Sistem (System Workflow)

Sistem ini menerapkan mekanisme penanganan data asinkron langsung dari lapisan database (*database layer*) untuk memotong jalur birokrasi kodingan di sisi frontend.

```mermaid
graph TD
    A[Pelanggan / Admin] -->|1. Input Form/Pesan| B(Frontend: React + Vite)
    B -->|2. Insert Data| C[(Database: Supabase)]
    C -->|3. Trigger Aktif| D[SQL Function: http_request]
    D -->|4. Kirim Payload JSON| E[n8n Cloud Webhook Node]
    E -->|5. Minta Analisis & Rekomendasi| F[Groq AI API Node]
    F -->|6. Kirim Teks Hasil AI| G[n8n Telegram Node]
    G -->|7. Notifikasi & Jawaban Cerdas| H[Bot Telegram Admin/Pelanggan]