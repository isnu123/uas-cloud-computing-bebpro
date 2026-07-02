import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';

function Inventory() {
  const [items, setItems] = useState([]);
  const [namaAlat, setNamaAlat] = useState('');
  const [kategori, setKategori] = useState(''); 
  const [jumlah, setJumlah] = useState(1);
  const [status, setStatus] = useState('tersedia');
  const [loading, setLoading] = useState(false);

  // State untuk Edit Modal Popup
  const [editingItem, setEditingItem] = useState(null);
  const [editNamaAlat, setEditNamaAlat] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editJumlah, setEditJumlah] = useState(1);
  const [editStatus, setEditStatus] = useState('tersedia');

  // 1. READ: Memuat data dari Supabase secara aman
  useEffect(() => {
    const fetchInventoryData = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: false });
        
      if (!error && data) {
        setItems(data);
      }
    };

    fetchInventoryData();
  }, []);

  // Fungsi pembantu untuk memuat ulang data tabel setelah aksi
  const refreshTableData = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    if (!error && data) {
      setItems(data);
    }
  };

  // 2. CREATE: Fungsi Tambah Alat Baru
  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('inventory').insert([
      {
        nama_alat: namaAlat,
        kategori: kategori || 'General', 
        jumlah: parseInt(jumlah),
        kondisi: 'bagus', 
        status: status 
      }
    ]);

    if (!error) {
      setNamaAlat('');
      setKategori('');
      setJumlah(1);
      setStatus('tersedia');
      await refreshTableData();
    } else {
      console.error("Detail Error Supabase:", error.message);
      alert("Gagal menyimpan data: " + error.message);
    }
    setLoading(false);
  };

  // 3. UPDATE: Membuka Modal Edit & Mengisi Data Lama
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditNamaAlat(item.nama_alat);
    setEditKategori(item.kategori || '');
    setEditJumlah(item.jumlah);
    setEditStatus(item.status || 'tersedia');
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('inventory')
      .update({
        nama_alat: editNamaAlat,
        kategori: editKategori || 'General',
        jumlah: parseInt(editJumlah),
        kondisi: 'bagus',
        status: editStatus 
      })
      .eq('id', editingItem.id);

    if (!error) {
      setEditingItem(null);
      await refreshTableData();
    } else {
      console.error("Detail Error Update:", error.message);
      alert("Gagal memperbarui data: " + error.message);
    }
    setLoading(false);
  };

  // 4. DELETE: Fungsi Hapus Alat
  const handleDeleteItem = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus alat ini?')) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (!error) await refreshTableData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const renderStatusBadge = (statusTxt) => {
    switch (statusTxt?.toLowerCase()) {
      case 'tersedia':
        return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold border border-success">Tersedia</span>;
      case 'rusak':
        return <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold border border-danger">Rusak</span>;
      case 'perbaikan':
        return <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-bold border border-warning">Perbaikan</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2 rounded-pill fw-bold text-white text-capitalize">{statusTxt || 'Tersedia'}</span>;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }}>
      {/* CSS Injection khusus untuk menangani warna Placeholder input dan text pudar */}
      <style>{`
        .custom-placeholder::placeholder {
          color: #94a3b8 !important;
          opacity: 1;
        }
      `}</style>

      <Sidebar onLogout={handleLogout} />

      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Header Dashboard */}
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="fw-bold m-0 text-white">Manajemen <span style={{ color: '#ef4444' }}>Inventori</span> Alat</h2>
          {/* Perbaikan: Mengubah text-muted menjadi warna abu-abu terang agar terbaca */}
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>Kelola, perbarui status, dan monitor seluruh perangkat produksi sirkuit BEB Production.</p>
        </div>

        {/* Card Form Tambah Alat */}
        <div className="card shadow border-0 mb-4 rounded-4 text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Tambah Peralatan Produksi</h5>
            <form onSubmit={handleAddItem} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-light">Nama Peralatan</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary rounded-3 custom-placeholder"
                  placeholder="Contoh: Sony A7 IV"
                  value={namaAlat}
                  onChange={(e) => setNamaAlat(e.target.value)}
                  required
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-bold text-light">Kategori Alat</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary rounded-3 custom-placeholder"
                  placeholder="Contoh: Kamera, Drone, Lensa"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-light">Jumlah Unit</label>
                <input
                  type="number"
                  className="form-control bg-dark text-white border-secondary rounded-3"
                  min="1"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-bold text-light">Status Kondisi</label>
                <select className="form-select bg-dark text-white border-secondary rounded-3" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="tersedia">Tersedia</option>
                  <option value="rusak">Rusak</option>
                  <option value="perbaikan">Perbaikan</option>
                </select>
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn btn-danger w-100 fw-bold rounded-3" disabled={loading}>
                  {loading ? '...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Data Minimalis & Profesional */}
        <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                {/* Cari bagian ini di dalam file Inventory.jsx Anda dan ganti menjadi: */}
                <thead style={{ background: '#0f172a' }}>
                  <tr>
                    <th className="px-4 py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Nama Alat Kelengkapan</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Kategori</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Kuantitas</th>
                    <th className="py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Status Kondisi</th>
                    <th className="text-center py-3 small fw-bold text-uppercase text-danger" style={{ letterSpacing: '0.5px' }}>Manajemen Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-white small fw-semibold">
                        Belum ada item inventori terdata di Supabase. Silakan input alat baru melalui form di atas.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                        <td className="px-4 fw-bold text-white py-3">{item.nama_alat}</td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-capitalize text-white px-2 py-1">
                            {item.kategori || 'General'}
                          </span>
                        </td>
                        <td className="fw-semibold text-light">{item.jumlah} Unit</td>
                        <td>{renderStatusBadge(item.status)}</td>
                        <td className="text-center">
                          <button onClick={() => openEditModal(item)} className="btn btn-sm btn-outline-light border-0 me-2 fw-semibold px-2">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem(item.id)} className="btn btn-sm btn-outline-danger border-0 fw-semibold px-2">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL WINDOW POPUP UNTUK EDIT DATA */}
        {editingItem && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-white" style={{ background: '#1e293b', border: '1px solid #ef4444' }}>
                <div className="modal-header border-secondary">
                  <h5 className="modal-title fw-bold">Perbarui Data Alat</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditingItem(null)}></button>
                </div>
                <form onSubmit={handleUpdateItem}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Nama Peralatan</label>
                      <input type="text" className="form-control bg-dark text-white border-secondary" value={editNamaAlat} onChange={(e) => setEditNamaAlat(e.target.value)} required />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Kategori</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        value={editKategori} 
                        onChange={(e) => setEditKategori(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Jumlah Unit</label>
                      <input type="number" className="form-control bg-dark text-white border-secondary" min="1" value={editJumlah} onChange={(e) => setEditJumlah(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Status Logistik</label>
                      <select className="form-select bg-dark text-white border-secondary" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option value="tersedia">Tersedia</option>
                        <option value="rusak">Rusak</option>
                        <option value="perbaikan">Perbaikan</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-outline-light" onClick={() => setEditingItem(null)}>Batal</button>
                    <button type="submit" className="btn btn-danger fw-bold" disabled={loading}>
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Inventory;