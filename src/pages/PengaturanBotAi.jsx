import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../config/supabaseClient';
import { BsRobot, BsLightningChargeFill, BsArrowRightShort } from 'react-icons/bs';
// Mengimpor SDK Resmi Groq
import { Groq } from 'groq-sdk';

function AiRecommendation() {
  const navigate = useNavigate();
  const [kebutuhan, setKebutuhan] = useState('');
  const [loading, setLoading] = useState(false);
  const [rekomendasi, setRekomendasi] = useState(null);
  const [paketSaran, setPaketSaran] = useState('');

  // Mengambil API Key Groq secara aman dari file .env
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const handleConsultation = async (e) => {
    e.preventDefault();
    if (!kebutuhan.trim()) return;

    setLoading(true);
    setRekomendasi(null);

    // Guardrail Prompt Khusus Penataan Agen CS
    const systemPrompt = `
Anda adalah AI Customer Service resmi dari BEB Production, sebuah vendor penyedia jasa dokumentasi, video shooting, fotografi, dan live streaming.
Tugas utama Anda adalah menganalisis kebutuhan pelanggan secara logis dan merekomendasikan SATU paket terbaik yang paling sesuai, atau menanyakan kelengkapan informasi terlebih dahulu.

=========================================
KATALOG PAKET RESMI & INDIKATOR KELAYAKAN
=========================================

1. Nama Paket: Wedding 1
   Harga: Rp2.500.000
   Fasilitas: 2 Kamera Full HD, 3 Kru Profesional, 2 TV Monitoring, Dokumentasi Foto & Video, Editing Highlight Video, File via Google Drive.
   Indikator Kelayakan (Sangat Cocok Jika):
   - Jenis Acara: Akad nikah, lamaran, engagement, atau resepsi skala kecil.
   - Jumlah Tamu: Kurang dari 300 orang (< 500 tamu).
   - Anggaran/Budget: Sekitar Rp2.500.000.
   - Kebutuhan Teknis: Cukup 2 kamera, tidak memerlukan drone, tidak memerlukan video cinematic mewah.
   - Lokasi: Indoor kecil atau rumah pribadi.

2. Nama Paket: Wedding 2
   Harga: Rp3.500.000
   Fasilitas: 3 Kamera Full HD, 4 Kru Profesional, 3 TV Monitoring, Dokumentasi Foto & Video Cinematic, Drone (jika lokasi memungkinkan), Editing Highlight Premium, File Full HD via Google Drive.
   Indikator Kelayakan (Sangat Cocok Jika):
   - Jenis Acara: Pernikahan besar, outdoor wedding, resepsi mewah, atau acara pernikahan adat berskala luas.
   - Jumlah Tamu: Lebih dari 300 orang (> 500 tamu).
   - Anggaran/Budget: Sekitar Rp3.500.000 atau lebih.
   - Kebutuhan Teknis: Membutuhkan 3 kamera, membutuhkan drone, atau membutuhkan hasil video bergaya cinematic premium.
   - Lokasi: Gedung besar, hotel, atau outdoor area terbuka.

3. Nama Paket: Lapangan 1
   Harga: Rp2.500.000
   Fasilitas: 3 Kamera Full HD, 4 Kru Profesional, Live Switching, Dokumentasi Full Event, Audio Recording, Editing Highlight, File Full HD.
   Indikator Kelayakan (Sangat Cocok Jika):
   - Jenis Acara: Turnamen olahraga (sepak bola/voli/futsal), kegiatan sekolah, pensi, seminar, wisuda, pengajian, rapat, atau acara komunitas berskala sedang.
   - Jumlah Tamu/Peserta: Kurang dari 700 orang.
   - Anggaran/Budget: Sekitar Rp2.500.000.
   - Kebutuhan Teknis: Membutuhkan 3 kamera, live switching standar, perekaman audio langsung dari mixer, tidak membutuhkan instant replay atau live streaming ke media sosial.
   - Lokasi: Lapangan olahraga lokal, aula sekolah, atau indoor hall sedang.

4. Nama Paket: Lapangan 2
   Harga: Rp3.500.000
   Fasilitas: 4 Kamera Full HD, 5 Kru Profesional, Live Switching Profesional, Instant Replay, TV Monitoring, Drone (opsional), Dokumentasi Foto & Video, Editing Highlight Premium, File Full HD.
   Indikator Kelayakan (Sokan Cocok Jika):
   - Jenis Acara: Turnamen besar, event pemerintah, festival musik, konser outdoor, live streaming profesional (YouTube/Facebook), atau kegiatan lapangan berskala besar.
   - Jumlah Tamu/Peserta: Lebih dari 700 orang (> 700 orang).
   - Anggaran/Budget: Sekitar Rp3.500.000 atau lebih.
   - Kebutuhan Teknis: Membutuhkan minimal 4 kamera atau lebih, membutuhkan fitur instant replay (putaran ulang lambat), live streaming langsung di lokasi, atau pemantauan udara via drone.
   - Lokasi: Stadion, alun-alun, area outdoor luas, atau gedung konvensi besar.

=========================================
HIERARKI PRIORITAS & ATURAN LOGIKA AI
=========================================
Gunakan urutan langkah analisis berikut secara berurutan saat membaca input pelanggan:

Langkah 1: Cek Batasan Ruang Lingkup (Scope Guardrail)
Jika pelanggan bertanya atau menulis hal di luar layanan BEB Production (seperti matematika, coding, politik, kesehatan, agama, atau pengetahuan umum), Anda WAJIB menolak dan menjawab persis seperti ini:
"Maaf, saya adalah AI Assistant BEB Production yang hanya dapat memberikan konsultasi mengenai paket dokumentasi, fotografi, videografi, live streaming, dan layanan BEB Production."

Langkah 2: Cek Kelengkapan Informasi
Jika input pelanggan terlalu pendek atau ambigu (contoh: "Saya mau dokumentasi", "Berapa harganya?", "Bikin video dong"), JANGAN LANGSUNG MEMILIH PAKET. 
Balas dengan ramah dan tanyakan maksimal 2 pertanyaan singkat untuk melengkapi data mereka. Contoh pertanyaan: "Acaranya berkonsep apa (pernikahan/event lapangan)? Berapa perkiraan jumlah tamu atau budget yang dipersiapkan?"

Langkah 3: Klasifikasi Jenis Acara
- Jika ada kata kunci: nikah, wedding, akad, lamaran, engagement, resepsi, besan -> Batasi pilihan HANYA pada [Wedding 1] atau [Wedding 2].
- Jika ada kata kunci: sepak bola, voli, futsal, konser, seminar, wisuda, pengajian, live streaming, festival, rapat, dinas, pemerintah, turnamen, kompetisi -> Batasi pilihan HANYA pada [Lapangan 1] atau [Lapangan 2].

Langkah 4: Kompromi Konflik Ketentuan (Budget vs Kebutuhan Teknis)
- Jika ada konflik antara Budget vs Kebutuhan Kamera/Tamu (Misal: User minta 4 kamera atau untuk 1000 tamu, tapi budget hanya Rp2.000.000):
  Prioritaskan untuk memilih paket yang sesuai dengan budgetnya terlebih dahulu (Paket Rp2.500.000), lalu jelaskan secara logis di dalam kalimat alasan mengapa kapasitasnya dikurangi atau tawarkan upgrade budget demi pemenuhan teknis.
- Jika budget secara eksplisit di bawah Rp2.500.000 (Misal: "Budget saya 1,5 juta"): Informasikan dengan santun bahwa paket resmi dimulai dari Rp2.500.000, lalu rekomendasikan paket termurah yang paling mendekati (Wedding 1 atau Lapangan 1) sebagai pertimbangan alternatif.

Langkah 5: Batasan Output & Format Penulisan
- Jawaban Anda harus ramah, profesional, menggunakan bahasa Indonesia yang baik, dan MAKSIMAL 5 KALIMAT.
- DILARANG membuat nama paket baru atau mengubah rincian harga/fasilitas yang ada.
- JANGAN menyebutkan atau membandingkan paket lain selain dari paket tunggal yang Anda rekomendasikan kepada pelanggan (kecuali dalam kondisi interogasi informasi di Langkah 2).
- Jika Anda sudah berhasil merekomendasikan satu paket utama, di bagian AKHIR jawaban Anda, Anda WAJIB menyertakan kode tag persis seperti format di bawah ini (pilih salah satu sesuai hasil rekomendasi):
  [PAKET: Wedding 1] atau [PAKET: Wedding 2] atau [PAKET: Lapangan 1] atau [PAKET: Lapangan 2]
  *Catatan: Jika Anda masih dalam tahap bertanya balik (Langkah 2) atau menolak di luar scope (Langkah 1), JANGAN sertakan kode tag [PAKET: ...] tersebut.*

=========================================
PERTANYAAN PELANGGAN SEKARANG:
"${kebutuhan}"
================
`;

    try {
      if (!GROQ_API_KEY) {
        throw new Error("API Key Groq belum dikonfigurasi di file .env");
      }

      // INISIALISASI SDK GROQ CLOUD
      const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Anda adalah AI CS BEB Production yang berpatokan ketat pada instruksi system prompt.' },
          { role: 'user', content: systemPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 300
      });

      const textBalasan = chatCompletion.choices[0]?.message?.content;

      if (textBalasan) {
        let paketTerdeteksi = "";

        if (textBalasan.includes("[PAKET: Wedding 1]")) {
          paketTerdeteksi = "Wedding 1";
        } else if (textBalasan.includes("[PAKET: Wedding 2]")) {
          paketTerdeteksi = "Wedding 2";
        } else if (textBalasan.includes("[PAKET: Lapangan 1]")) {
          paketTerdeteksi = "Lapangan 1";
        } else if (textBalasan.includes("[PAKET: Lapangan 2]")) {
          paketTerdeteksi = "Lapangan 2";
        }

        const cleanedText = textBalasan.replace(/\[PAKET:.*\]/g, "").trim();

        setRekomendasi(cleanedText);
        setPaketSaran(paketTerdeteksi);
      } else {
        throw new Error("Format respons Groq kosong");
      }
    } catch (err) {
      console.error("Groq API Error, mengaktifkan alur fallback lokal:", err);
      
      const inputLower = kebutuhan.toLowerCase();
      const angkaSaja = inputLower.replace(/[^0-9]/g, '');
      const perkiraanBudget = angkaSaja ? parseInt(angkaSaja, 10) : null;

      if (inputLower.includes('nikah') || inputLower.includes('wedding') || inputLower.includes('akad') || inputLower.includes('resepsi') || inputLower.includes('lamaran') || inputLower.includes('engagement')) {
        if (perkiraanBudget && perkiraanBudget < 3500000) {
          setRekomendasi('Kami merekomendasikan Paket Wedding 1 karena sangat sesuai dengan anggaran Rp2.500.000 yang Anda miliki. Paket ini menyediakan 2 kamera Full HD, 3 kru profesional, 2 TV monitor serta dokumentasi lengkap foto & video untuk acara pernikahan skala kecil hingga menengah.');
          setPaketSaran('Wedding 1');
        } else if (inputLower.includes('lamaran') || inputLower.includes('engagement')) {
          setRekomendasi('Kami merekomendasikan Paket Wedding 1 yang sudah mencakup 2 kamera Full HD, 3 kru profesional, 2 TV monitor dan dokumentasi lengkap untuk acara lamaran maupun akad sederhana.');
          setPaketSaran('Wedding 1');
        } else {
          setRekomendasi('Kami merekomendasikan Paket Wedding 2 karena menyediakan 3 kamera Full HD, 4 kru profesional, 3 TV monitor serta dokumentasi cinematic yang sangat cocok untuk acara pernikahan berskala menengah hingga besar.');
          setPaketSaran('Wedding 2');
        }
      } else if (inputLower.includes('seminar') || inputLower.includes('wisuda') || inputLower.includes('pengajian') || inputLower.includes('turnamen') || inputLower.includes('rapat') || inputLower.includes('bola') || inputLower.includes('voli')) {
        if (perkiraanBudget && perkiraanBudget < 3500000) {
          setRekomendasi('Kami merekomendasikan Paket Lapangan 1 karena sesuai dengan anggaran Anda dan telah dilengkapi 3 kamera Full HD, 4 kru profesional, live switching, audio recording dan editing highlight sehingga cocok untuk berbagai kegiatan formal.');
          setPaketSaran('Lapangan 1');
        } else {
          setRekomendasi('Kami merekomendasikan Paket Lapangan 2 karena menyediakan 4 kamera Full HD, 5 kru profesional, live streaming YouTube/Facebook, live switching serta dokumentasi penuh untuk event berskala besar.');
          setPaketSaran('Lapangan 2');
        }
      } else if (perkiraanBudget && perkiraanBudget < 3500000) {
        setRekomendasi('Berdasarkan budget Rp2.500.000 yang Anda masukkan, kami merekomendasikan Paket Wedding 1 atau Paket Lapangan 1. Paket ini sudah dilengkapi fasilitas multi-camera standar dan kru profesional yang sangat pas untuk anggaran Anda. Silakan tentukan jenis acara Anda saat melakukan booking!');
        setPaketSaran('Wedding 1');
      } else {
        setRekomendasi('Mohon maaf, silakan berikan rincian tipe acara dan perkiraan budget Anda dengan lebih jelas agar kami dapat memberikan saran paket dokumentasi terbaik.');
        setPaketSaran('');
      }
    }
    setLoading(false);
  };

  const handleLanjutBooking = () => {
    navigate('/booking', { state: { paketDariAi: paketSaran } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }}>
      <Sidebar onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="fw-bold m-0 text-white">BEB <span style={{ color: '#ef4444' }}>AI Recommendation</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Konsultasikan konsep dokumentasi, anggaran, dan tipe acara Anda untuk mendapatkan rekomendasi paket terbaik dari kecerdasan buatan Groq Cloud Cloud.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card shadow border-0 rounded-4 h-100" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <BsRobot size={22} style={{ color: '#ef4444' }} />
                  <h5 className="fw-bold m-0 small text-uppercase tracking-wider text-white">Mulai Konsultasi (Live Groq Cloud)</h5>
                </div>
                <form onSubmit={handleConsultation} className="d-flex flex-column flex-grow-1">
                  <div className="mb-4 flex-grow-1">
                    <label className="form-label small fw-bold text-light">Ceritakan Detail Rencana Acara Anda</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary rounded-3"
                      rows="8"
                      style={{ 
                        resize: 'none', 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        // Perbaikan utama: Mengubah warna teks input & placeholder secara eksplisit
                        color: '#ffffff',
                        backgroundColor: '#1f2937', // Menggunakan abu-abu gelap khas dashboard kamu agar lebih kontras dari background utama
                        '--bs-primary-rgb': '239, 68, 64' // Menjaga warna outline fokus jika diklik
                      }}
                      placeholder="Contoh: Saya rencana mau bikin live streaming wisuda sekolah massal di gedung olahraga, butuh alat multi-camera switcher..."
                      value={kebutuhan}
                      onChange={(e) => setKebutuhan(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-danger fw-bold w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        <span>Groq sedang menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <BsLightningChargeFill />
                        <span>Analisis via Live API Groq Cloud</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow border-0 rounded-4 h-100" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold mb-4 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Hasil Analisis & Saran Sistem</h5>
                  {!rekomendasi && !loading && (
                    <div className="text-center py-5 my-4">
                      <div className="fs-1 opacity-20 mb-2">🤖</div>
                      <p className="small px-4" style={{ color: '#94a3b8' }}>
                        Belum ada data konsultasi. Silakan isi form di sebelah kiri untuk menembak API Groq Cloud secara real-time.
                      </p>
                    </div>
                  )}
                  {loading && (
                    <div className="text-center py-5 my-4">
                      <div className="spinner-grow text-danger mb-3" role="status"></div>
                      <p className="small fw-semibold text-light">Memproses token penalaran LLM...</p>
                    </div>
                  )}
                  {rekomendasi && !loading && (
                    <div className="p-3 rounded-3 bg-dark border border-secondary" style={{ fontSize: '14px', lineHeight: '1.7', color: '#e2e8f0' }}>
                      <p className="m-0" style={{ whiteSpace: 'pre-line' }}>{rekomendasi}</p>
                    </div>
                  )}
                </div>

                {/* Tombol booking hanya muncul jika tag [PAKET: ...] terdeteksi */}
                {rekomendasi && paketSaran && !loading && (
                  <div className="mt-4 pt-3 border-top border-secondary">
                    <div className="alert bg-danger-subtle text-danger border-0 small mb-3 py-2 fw-medium">
                      Paket Terpilih Otomatis: <strong>{paketSaran}</strong>
                    </div>
                    <button onClick={handleLanjutBooking} className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-1 rounded-3 py-2">
                      <span>Gunakan Rekomendasi & Lanjutkan Booking</span>
                      <BsArrowRightShort size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default AiRecommendation;