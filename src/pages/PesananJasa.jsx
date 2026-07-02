import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. READ: Ambil data pemesanan secara aman di dalam useEffect saat halaman dimuat
  useEffect(() => {
    const fetchOrdersOnLoad = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          tanggal_event,
          lokasi,
          status,
          total_bayar,
          profiles ( name, email ),
          packages ( nama_paket )
        `)
        .order('id', { ascending: false });

      if (!error) {
        setOrders(data);
      }
    };

    fetchOrdersOnLoad();
  }, []);

  // Fungsi pembantu khusus aksi tombol (di luar useEffect) untuk reload data setelah update status
  const reloadOrdersAfterAction = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_event,
        lokasi,
        status,
        total_bayar,
        profiles ( name, email ),
        packages ( nama_paket )
      `)
      .order('id', { ascending: false });

    if (!error) {
      setOrders(data);
    }
  };

  // 2. UPDATE: Mengubah alur status pemesanan (Pending -> Confirmed -> Completed)
  const handleUpdateStatus = async (id, currentStatus) => {
    setLoading(true);
    let nextStatus = 'confirmed';
    if (currentStatus === 'confirmed') {
      nextStatus = 'completed';
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', id);

    if (!error) {
      await reloadOrdersAfterAction();
    } else {
      alert("Gagal memperbarui status: " + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Fungsi pembantu untuk merender badge status dengan warna kontras tinggi di mode gelap
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-bold border border-warning">Pending</span>;
      case 'confirmed':
        return <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold border border-primary">Confirmed</span>;
      case 'completed':
        return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold border border-success">Selesai</span>;
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
          <h2 className="fw-bold m-0 text-white">Daftar Antrean <span style={{ color: '#ef4444' }}>Pesanan Jasa</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Validasi, konfirmasi jadwal, dan pantau status pemesanan paket dokumentasi video & event BEB Production.
          </p>
        </div>

        {/* Tabel Data Pemesanan Jasa */}
        <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead style={{ background: '#0f172a' }}>
                  <tr>
                    <th className="px-4 py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Nama Pelanggan</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Paket Jasa</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Tanggal Event</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Total Bayar</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Status Proyek</th>
                    <th className="text-center py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Tindakan Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-white small fw-semibold">
                        Belum ada pesanan jasa masuk di database Supabase.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                        <td className="px-4 py-3">
                          <div className="fw-bold text-white">{order.profiles?.name || 'Pelanggan'}</div>
                          <small style={{ color: '#94a3b8', fontSize: '12px' }}>{order.profiles?.email}</small>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-white text-capitalize px-2 py-1">
                            {order.packages?.nama_paket || 'Custom Event'}
                          </span>
                        </td>
                        <td className="text-light fw-medium">{order.tanggal_event}</td>
                        <td className="fw-bold" style={{ color: '#f87171' }}>
                          Rp{parseFloat(order.total_bayar || 0).toLocaleString('id-ID')}
                        </td>
                        <td>{renderStatusBadge(order.status)}</td>
                        <td className="text-center">
                          {order.status !== 'completed' ? (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, order.status)}
                              className="btn btn-sm btn-danger fw-bold rounded-3 px-3 shadow-sm"
                              style={{ fontSize: '13px' }}
                              disabled={loading}
                            >
                              {order.status === 'pending' ? 'Konfirmasi' : 'Selesaikan'}
                            </button>
                          ) : (
                            <span className="text-success small fw-bold">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Orders;