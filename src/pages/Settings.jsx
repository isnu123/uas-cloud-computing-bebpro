import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../config/supabaseClient';

function Settings() {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('beb_webhook_url') || 'http://localhost:5678/webhook-test/booking-notif';
  });

  // Default prompt baru yang bisa diedit oleh admin jika ada penambahan paket
  const [aiGuardrail, setAiGuardrail] = useState(() => {
    return localStorage.getItem('beb_ai_guardrail') || 
`1. "Wedding Silver" (Untuk pernikahan, engagement, lamaran, outdoor wedding)
2. "Graduation" (Untuk wisuda, kelulusan kuliah/sekolah, foto studio portable)
3. "Event coverage" (Untuk konser, live streaming, rapat, seminar, event kustom lainnya)`;
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('beb_webhook_url', webhookUrl);
    localStorage.setItem('beb_ai_guardrail', aiGuardrail); // Simpan perubahan paket AI
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
          <h2 className="fw-bold m-0 text-white">Pengaturan <span style={{ color: '#ef4444' }}>Bot & AI</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Konfigurasi gerbang otomatisasi webhook dan parameter kecerdasan sistem BEB Production.
          </p>
        </div>

        <form onSubmit={handleSaveSettings}>
          <div className="row g-4">
            <div className="col-lg-7">
              {/* Card Webhook */}
              <div className="card shadow border-0 rounded-4 text-white mb-4" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Endpoint Webhook Integrasi</h5>
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-light">n8n Production / Test URL Webhook</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary rounded-3"
                      style={{ fontSize: '14px', fontFamily: 'monospace' }}
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="Masukkan URL webhook dari n8n"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CARD DINAMIS: PARAMETER AI */}
              <div className="card shadow border-0 rounded-4 text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Parameter Prompt Engineering & Guardrail AI</h5>
                  <p className="small text-light mb-2">
                    Sesuaikan atau tambah daftar katalog paket di bawah ini agar Groq AI langsung membaca perubahan bisnis BEB Production secara dinamis:
                  </p>
                  <div className="mb-2">
                    <textarea
                      className="form-control bg-dark text-white border-secondary rounded-3 p-3"
                      style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.6', resize: 'vertical' }}
                      rows="6"
                      value={aiGuardrail}
                      onChange={(e) => setAiGuardrail(e.target.value)}
                      required
                    />
                  </div>
                  {/* 🛠️ WARNA DI SINI SUDAH DIPERBAIKI MENJADI #94a3b8 AGAR TERLIHAT JELAS */}
                  <small className="d-block mt-2" style={{ color: '#94a3b8' }}>
                    Jika menambahkan paket baru, pastikan format penulisan nama paket di dalam tanda petik dua tetap konsisten.
                  </small>
                </div>
              </div>

              {/* Notifikasi & Tombol Aksi */}
              <div className="mt-4">
                {isSaved && (
                  <div className="alert bg-success-subtle text-success border border-success small py-2 rounded-3 mb-3 fw-bold">
                    ✅ Semua konfigurasi Webhook & Parameter AI berhasil diperbarui!
                  </div>
                )}
                <button type="submit" className="btn btn-danger fw-bold px-4 rounded-3 py-2">
                  Simpan Semua Perubahan
                </button>
              </div>
            </div>

            {/* Kolom Kanan: Status Monitoring */}
            <div className="col-lg-5">
              <div className="card shadow border-0 rounded-4 text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Status Arsitektur Jaringan</h5>
                  <ul className="list-group list-group-flush bg-transparent">
                    <li className="list-group-item bg-transparent text-white border-secondary px-0 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold small">n8n Automation Engine</div>
                        <small style={{ color: '#94a3b8', fontSize: '11px' }}>Mendengarkan data formulir via Webhook</small>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill fw-bold">🟢 Connected</span>
                    </li>
                    <li className="list-group-item bg-transparent text-white border-secondary px-0 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold small">Groq</div>
                        <small style={{ color: '#94a3b8', fontSize: '11px' }}>Model: Api Groq Cloud </small>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill fw-bold">🟢 Active & Guarded</span>
                    </li>
                    <li className="list-group-item bg-transparent text-white border-secondary px-0 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold small">Telegram Bot API</div>
                        <small style={{ color: '#94a3b8', fontSize: '11px' }}>Kru Internal Notifier System</small>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill fw-bold">🟢 Bot Active</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Settings;