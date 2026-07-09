import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  BsLayers,
  BsArrowRightShort,
  BsDatabaseCheck,
  BsCpu,
  BsGear
} from 'react-icons/bs';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ inventoryCount: 0, bookingCount: 0 });
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Ambil data autentikasi user aktif
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          // 2. Ambil HANYA kolom 'jumlah' dari tabel inventory untuk dihitung total unitnya
          const { data: invData, error: invError } = await supabase
            .from('inventory')
            .select('jumlah');

          // 3. Ambil hitungan baris (count) dari tabel bookings secara real-time
          const { count: bookCount, error: bookError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });

          // 4. Hitung total unit alat seperti di halaman Inventory
          let totalInventori = 0;
          if (!invError && invData) {
            totalInventori = invData.reduce((acc, item) => acc + (parseInt(item.jumlah) || 0), 0);
          } else if (invError) {
            console.error("Gagal mengambil data inventory:", invError);
          }

          if (bookError) {
            console.error("Gagal mengambil data bookings:", bookError);
          }

          // 5. Update stats secara independen (tidak saling menggagalkan)
          setStats({
            inventoryCount: totalInventori,
            bookingCount: bookCount || 0
          });
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data dashboard admin:", error);
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
        <div className="container-fluid p-0">
          
          {/* HEADER CONTROL CENTER */}
          <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <small className="text-danger fw-bold text-uppercase font-monospace" style={{ letterSpacing: '1px' }}>
                  ADMIN CONTROL CENTER
                </small>
                <h2 className="fw-bold m-0 text-white mt-1">
                  Dashboard Produksi <span style={{ color: '#ef4444' }}>BEB Cloud</span>
                </h2>
                <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  Kelola sistem inventaris komplit, otomasi n8n, monitoring bot, dan log penjadwalan terpusat.
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
            {user && (
              <div className="mt-2">
                <small style={{ color: '#94a3b8' }}>
                  Sesi Aktif: <strong className="text-light">{user.email}</strong>
                </small>
              </div>
            )}
          </div>

          {/* BARIS DATA STATISTIK KARTU */}
          <div className="row g-3 mb-4">
            {/* KARTU 1: INVENTORI */}
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #ef4444' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Total Inventori</small>
                    <h2 className="fw-bold m-0 text-white mt-1">{loading ? '...' : stats.inventoryCount}</h2>
                    <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Aset peralatan aktif</small>
                  </div>
                  <div className="p-3 rounded-3 bg-danger-subtle text-danger bg-opacity-10">
                    <BsGear size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 2: BOOKING */}
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #3b82f6' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Total Booking</small>
                    <h2 className="fw-bold m-0 text-white mt-1">{loading ? '...' : stats.bookingCount}</h2>
                    <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Antrean jadwal masuk</small>
                  </div>
                  <div className="p-3 rounded-3 bg-primary-subtle text-primary bg-opacity-10">
                    <BsLayers size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 3: AI WORKFLOW */}
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #10b981' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Status Otomasi</small>
                    <h2 className="fw-bold m-0 text-success mt-1">AKTIF</h2>
                    <small style={{ color: '#cbd5e1', fontSize: '12px' }}>n8n Engine & Telegram</small>
                  </div>
                  <div className="p-3 rounded-3 bg-success-subtle text-success bg-opacity-10">
                    <BsCpu size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 4: BACKEND CLOUD */}
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#1e293b', borderLeft: '4px solid #a855f7' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Cloud Backend</small>
                    <h2 className="fw-bold m-0 text-purple mt-1" style={{ color: '#c084fc' }}>Supabase</h2>
                    <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Database Terpusat</small>
                  </div>
                  <div className="p-3 rounded-3 bg-purple-subtle bg-opacity-10" style={{ color: '#c084fc' }}>
                    <BsDatabaseCheck size={22} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DESKRIPSI TEKNIS SISTEM */}
          <div className="card border-0 shadow-sm rounded-4 text-white" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="card-body p-4">
              <small className="text-danger fw-bold font-monospace text-uppercase" style={{ fontSize: '12px' }}>
                BEB PRODUCTION CLOUD SYSTEM
              </small>
              <h4 className="fw-bold mt-2 text-white">
                Sistem Manajemen Logistik & Inventori Terintegrasi
              </h4>
              <p className="m-0 mt-2 card-text" style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                Panel kendali terpusat ini dirancang khusus untuk memantau status ketersediaan aset multimedia di gudang produksi. 
                Sistem secara otomatis membaca ketersediaan stok fisik guna mencegah terjadinya bentrok jadwal penggunaan kamera 
                maupun modul switcher penyiaran pada tanggal pelaksanaan yang diajukan oleh pelanggan di cloud database.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;