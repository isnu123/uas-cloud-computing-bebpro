import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';

function MyBookings() {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      setLoading(true);
      // 1. Ambil info customer yang sedang login
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Ambil data bookings milik user tersebut join dengan nama paketnya
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            tanggal_event,
            lokasi,
            status,
            total_bayar,
            packages ( nama_paket )
          `)
          .eq('user_id', user.id)
          .order('id', { ascending: false });

        if (!error && data) {
          setMyOrders(data);
        }
      }
      setLoading(false);
    };

    fetchMyBookings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Fungsi pengubah warna badge berdasarkan status dari admin (Kontras Tinggi Mode Gelap)
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-bold border border-warning">Menunggu Validasi</span>;
      case 'confirmed':
        return <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold border border-primary">Jadwal Disetujui</span>;
      case 'completed':
        return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold border border-success">Project Selesai</span>;
      default:
        return <span className="badge bg-secondary text-white px-3 py-2 rounded-pill fw-bold text-capitalize">{status}</span>;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }}>
      <Sidebar onLogout={handleLogout} />

      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Header Dashboard */}
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="fw-bold m-0 text-white">Riwayat <span style={{ color: '#ef4444' }}>Booking Saya</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Pantau status verifikasi jadwal, lokasi dokumentasi, dan rincian biaya pesanan Anda di BEB Production.
          </p>
        </div>

        {/* Card Kontainer Tabel Riwayat Booking */}
        <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="card-body p-4">
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
                <p className="text-muted small mt-2">Mengambil data riwayat sirkuit...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-white small fw-semibold m-0">Anda belum pernah melakukan booking layanan jasa kami.</p>
                <small style={{ color: '#94a3b8' }}>Silakan menuju halaman utama untuk membuat pesanan dokumentasi pertama Anda.</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead style={{ background: '#0f172a' }}>
                    <tr>
                      <th className="py-3 ps-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Paket Dokumentasi</th>
                      <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Tanggal Pelaksanaan</th>
                      <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Lokasi Event</th>
                      <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Total Biaya</th>
                      <th className="py-3 pe-3 text-center small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Status Alur Kerja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map((order) => (
                      <tr key={order.id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                        <td className="py-3 ps-3 fw-bold text-white">
                          {order.packages?.nama_paket || 'Paket Kustom'}
                        </td>
                        <td className="py-3 text-light fw-semibold">
                          {new Date(order.tanggal_event).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="py-3 small fw-medium" style={{ maxWidth: '250px', color: '#cbd5e1' }}>
                          {order.lokasi}
                        </td>
                        <td className="py-3 fw-bold" style={{ color: '#f87171' }}>
                          Rp{parseFloat(order.total_bayar || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 pe-3 text-center">
                          {renderStatusBadge(order.status)}
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
    </div>
  );
}

export default MyBookings;