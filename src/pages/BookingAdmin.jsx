import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../config/supabaseClient';
import { 
  BsCalendarCheck, 
  BsHourglassSplit, 
  BsCheckCircleFill, 
  BsArrowRightShort, 
  BsInfoCircle, 
  BsLayers,
  BsExclamationCircle
} from 'react-icons/bs';

function BookingAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil ringkasan statistik data dan antrean terbaru langsung dari database Supabase
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status, tanggal_event, lokasi, total_bayar');

        if (!error && data) {
          const total = data.length;
          const pending = data.filter(b => b.status === 'pending').length;
          const approved = data.filter(b => b.status === 'approved' || b.status === 'success').length;
          
          setStats({ total, pending, approved });
          
          // Urutkan 5 data antrean terbaru untuk ditampilkan di tabel dashboard admin
          const sorted = [...data].sort((a, b) => new Date(b.tanggal_event) - new Date(a.tanggal_event));
          setRecentBookings(sorted.slice(0, 5));
        }
      } catch (err) {
        console.error("Gagal memuat log data admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }} translate="no">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Header Seksi Admin */}
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold m-0 text-white">
                Dashboard <span style={{ color: '#ef4444' }}>Booking Admin</span>
              </h2>
              <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Sistem monitoring pusat untuk peninjauan berkas invoice, validasi pembayaran, dan manajemen antrean kru.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/orders')} 
              className="btn btn-danger d-flex align-items-center gap-1 px-3 py-2 rounded-3 fw-bold shadow-sm font-monospace"
              style={{ fontSize: '14px' }}
            >
              Kelola Semua Pesanan <BsArrowRightShort size={20} />
            </button>
          </div>
        </div>

        {/* Baris Kartu Statistik Informasi Singkat */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-3 shadow-sm h-100" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #3b82f6' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Total Mengajukan</small>
                  <h2 className="fw-bold m-0 text-white mt-1">{loading ? '...' : stats.total}</h2>
                </div>
                <div className="p-3 rounded-3 bg-primary-subtle text-primary bg-opacity-10">
                  <BsLayers size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-3 shadow-sm h-100" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #f59e0b' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Menunggu Konfirmasi</small>
                  <h2 className="fw-bold m-0 text-warning mt-1">{loading ? '...' : stats.pending}</h2>
                </div>
                <div className="p-3 rounded-3 bg-warning-subtle text-warning bg-opacity-10">
                  <BsHourglassSplit size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-3 shadow-sm h-100" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #10b981' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Jadwal Terkunci</small>
                  <h2 className="fw-bold m-0 text-success mt-1">{loading ? '...' : stats.approved}</h2>
                </div>
                <div className="p-3 rounded-3 bg-success-subtle text-success bg-opacity-10">
                  <BsCalendarCheck size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Konten Utama Terbagi Menjadi Tabel & Edukasi Alur */}
        <div className="row g-4">
          
          {/* Sisi Kiri: Tabel 5 Antrean Booking Terbaru */}
          <div className="col-lg-8">
            <div className="card shadow border-0 rounded-4 text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2" style={{ fontSize: '16px' }}>
                  <BsLayers className="text-danger" /> Antrean Masuk Terbaru
                </h5>
                
                {loading ? (
                  <div className="text-center py-4 text-muted small">Memuat log database cloud...</div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-5 text-muted small rounded-3 bg-dark border border-secondary border-dashed">
                    <BsExclamationCircle size={28} className="text-secondary d-block mx-auto mb-2" />
                    Belum ada antrean transaksi booking dari pelanggan saat ini.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle m-0" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr className="border-secondary text-muted text-uppercase tracking-wider" style={{ fontSize: '11px' }}>
                          <th className="bg-transparent border-secondary ps-0">Lokasi Acara</th>
                          <th className="bg-transparent border-secondary text-center">Tanggal Pelaksanaan</th>
                          <th className="bg-transparent border-secondary text-end">Nilai Kontrak</th>
                          <th className="bg-transparent border-secondary text-end pe-0">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b.id} className="border-secondary">
                            <td className="bg-transparent border-secondary ps-0 text-light fw-medium max-w-xs text-truncate" style={{ maxWidth: '200px' }}>
                              {b.lokasi}
                            </td>
                            <td className="bg-transparent border-secondary text-center text-white font-monospace">
                              {new Date(b.tanggal_event).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            {/* PERBAIKAN: Spasi terpisah untuk text-white dan fw-bold */}
                            <td className="bg-transparent border-secondary text-end font-monospace text-white fw-bold">
                              Rp{parseFloat(b.total_bayar).toLocaleString('id-ID')}
                            </td>
                            <td className="bg-transparent border-secondary text-end pe-0">
                              <span className={`badge px-2.5 py-1.5 rounded-pill font-monospace fw-bold ${
                                b.status === 'pending' 
                                  ? 'bg-warning-subtle text-warning border border-warning' 
                                  : 'bg-success-subtle text-success border border-success'
                              }`} style={{ fontSize: '10px' }}>
                                {b.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Panduan Alur Kerja Otomasi Kerja Admin */}
          <div className="col-lg-4">
            <div className="card shadow border-0 rounded-4 text-white h-100" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold mb-3 small text-uppercase tracking-wider text-white d-flex align-items-center gap-2">
                    <BsInfoCircle className="text-danger" /> Alur Kerja Administrasi
                  </h5>
                  
                  <div className="vstack gap-3 mt-3">
                    <div className="d-flex gap-3 align-items-start">
                      <div className="badge rounded-circle bg-danger p-2 font-monospace mt-0.5" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                      <div>
                        <h6 className="fw-bold m-0 text-light" style={{ fontSize: '14px' }}>Pelanggan Booking</h6>
                        <small style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.4' }}>Pelanggan mengunci tanggal di portal mereka dan melampirkan foto resi transfer.</small>
                      </div>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                      <div className="badge rounded-circle bg-danger p-2 font-monospace mt-0.5" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                      <div>
                        <h6 className="fw-bold m-0 text-light" style={{ fontSize: '14px' }}>Notifikasi n8n & Telegram</h6>
                        <small style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.4' }}>Sistem otomasi mendeteksi transaksi baru dan menembakkan rincian ringkasan ke grup Telegram kru.</small>
                      </div>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                      <div className="badge rounded-circle bg-success p-2 font-monospace mt-0.5" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BsCheckCircleFill size={12} /></div>
                      <div>
                        <h6 className="fw-bold m-0 text-success" style={{ fontSize: '14px' }}>Validasi di Menu Orders</h6>
                        <small style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.4' }}>Admin memeriksa kecocokan mutasi uang di rekening SeaBank/DANA, lalu mengubah status menjadi approved.</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top border-secondary text-muted" style={{ fontSize: '11px' }}>
                  <p className="m-0 text-center" style={{ color: '#64748b' }}>
                    Sistem Terintegrasi BEB Production • Version 1.2.0
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default BookingAdmin;