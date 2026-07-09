import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import { BsFileEarmarkPdfFill, BsBoxSeam, BsCheckCircleFill, BsExclamationTriangleFill, BsPieChartFill, BsSearch } from 'react-icons/bs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function Inventory() {
  const [items, setItems] = useState([]);
  const [namaAlat, setNamaAlat] = useState('');
  const [kategori, setKategori] = useState(''); 
  const [jumlah, setJumlah] = useState(1);
  const [status, setStatus] = useState('tersedia');
  const [loading, setLoading] = useState(false);

  // State untuk Pencarian dan Pagination Modern
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Default show 5 entries

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

  const refreshTableData = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    if (!error && data) {
      setItems(data);
    }
  };

  // 🔍 LOGIKA FILTER & PENCARIAN REAL-TIME
  const filteredItems = items.filter((item) => {
    const matchSearch = item.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.kategori?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = filterKategori === 'Semua' || item.kategori?.toLowerCase() === filterKategori.toLowerCase();
    return matchSearch && matchKategori;
  });

  // 📑 LOGIKA PAGINATION
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentEntries = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);

  // Ambil list kategori unik untuk filter dropdown
  const uniqueKategories = ['Semua', ...new Set(items.map(item => item.kategori).filter(Boolean))];

  // 📊 KALKULASI STATISTIK OTOMATIS
  const totalAlat = items.reduce((acc, item) => acc + (parseInt(item.jumlah) || 0), 0);
  const totalTersedia = items.filter(item => item.status?.toLowerCase() === 'tersedia').reduce((acc, item) => acc + (parseInt(item.jumlah) || 0), 0);
  const totalMogok = items.filter(item => item.status?.toLowerCase() === 'rusak' || item.status?.toLowerCase() === 'perbaikan').reduce((acc, item) => acc + (parseInt(item.jumlah) || 0), 0);
  const persenTersedia = totalAlat > 0 ? Math.round((totalTersedia / totalAlat) * 100) : 0;
  const persenMogok = totalAlat > 0 ? 100 - persenTersedia : 0;

  const handleExportPDF = () => {
    if (!items || items.length === 0) {
      alert("Tidak ada data inventori yang bisa dicetak saat ini!");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BEB PRODUCTION", 14, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Laporan Resmi Data Inventori Logistik & Peralatan", 14, 26);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(239, 68, 68); 
      doc.line(14, 36, 196, 36);

      const tableRows = items.map((item) => [
        item.nama_alat ? item.nama_alat : '-',
        item.kategori ? item.kategori : 'General',
        item.jumlah ? `${item.jumlah} Unit` : '0 Unit',
        item.status ? String(item.status).toUpperCase() : 'TERSEDIA'
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['Nama Peralatan', 'Kategori', 'Kuantitas', 'Status Kondisi']],
        body: tableRows,
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        styles: { font: "helvetica", fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`Laporan_Inventori_BEB_Production_${Date.now()}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

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
      setCurrentPage(1);
    }
    setLoading(false);
  };

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
    }
    setLoading(false);
  };

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
      <style>{`
        .custom-placeholder::placeholder { color: #94a3b8 !important; opacity: 1; }
        .table-hover tbody tr { transition: background-color 0.25s ease; }
        .table-hover tbody tr:hover { background-color: rgba(239, 68, 68, 0.04) !important; }
        .stat-card { transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); }
        .page-link-custom {
          background: #1e293b; color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; transition: all 0.2s;
        }
        .page-link-custom:hover:not(:disabled) { background: #ef4444; border-color: #ef4444; }
        .page-link-custom:disabled { opacity: 0.4; cursor: not-allowed; }
        .white-icons-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708 .708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
        }
      `}</style>

      <Sidebar onLogout={handleLogout} />

      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Header */}
        <div className="mb-4 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="fw-bold m-0 text-white">Manajemen <span style={{ color: '#ef4444' }}>Inventori</span> Alat</h2>
            <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>Kelola, perbarui status, dan monitor seluruh perangkat produksi sikit BEB Production.</p>
          </div>
          <div>
            <button type="button" onClick={handleExportPDF} className="btn btn-danger py-2.5 px-4 rounded-3 fw-bold d-flex align-items-center gap-2 shadow" style={{ fontSize: '14px' }}>
              <BsFileEarmarkPdfFill size={18} />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>

        {/* Card Statistik */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card stat-card h-100 border-0 rounded-4 text-white" style={{ background: '#1e293b', borderLeft: '5px solid #3b82f6' }}>
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Total Seluruh Alat</small>
                  <h2 className="fw-bold m-0 mt-1">{totalAlat} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#94a3b8' }}>Item</span></h2>
                </div>
                <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary"><BsBoxSeam size={22} /></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card stat-card h-100 border-0 rounded-4 text-white" style={{ background: '#1e293b', borderLeft: '5px solid #10b981' }}>
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Alat Siap/Tersedia</small>
                  <h2 className="fw-bold text-success m-0 mt-1">{totalTersedia} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#94a3b8' }}>Unit</span></h2>
                </div>
                <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success"><BsCheckCircleFill size={22} /></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card stat-card h-100 border-0 rounded-4 text-white" style={{ background: '#1e293b', borderLeft: '5px solid #ef4444' }}>
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Mogok / Perbaikan / Rusak</small>
                  <h2 className="fw-bold text-danger m-0 mt-1">{totalMogok} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#94a3b8' }}>Unit</span></h2>
                </div>
                <div className="p-3 rounded-3 bg-danger bg-opacity-10 text-danger"><BsExclamationTriangleFill size={22} /></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card stat-card h-100 border-0 rounded-4 text-white" style={{ background: '#1e293b' }}>
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="rounded-circle flex-shrink-0" style={{ width: '55px', height: '55px', background: totalAlat > 0 ? `conic-gradient(#10b981 0% ${persenTersedia}%, #ef4444 ${persenTersedia}% 100%)` : '#4b5563' }}></div>
                <div>
                  <h6 className="m-0 fw-bold small text-uppercase tracking-wider mb-1" style={{ color: '#ef4444', fontSize: '12px' }}><BsPieChartFill className="me-1" /> Kondisi Logistik</h6>
                  <div className="d-flex flex-column gap-0.5" style={{ fontSize: '11px', color: '#cbd5e1' }}>
                    <span><span className="badge bg-success p-1 rounded-circle me-1"></span>Tersedia: {persenTersedia}%</span>
                    <span><span className="badge bg-danger p-1 rounded-circle me-1"></span>Bermasalah: {persenMogok}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Form Tambah Alat */}
        <div className="card shadow border-0 mb-4 rounded-4 text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Tambah Peralatan Prosedur</h5>
            <form onSubmit={handleAddItem} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-light">Nama Peralatan</label>
                <input type="text" className="form-control bg-dark text-white border-secondary rounded-3 custom-placeholder" placeholder="Contoh: Sony A7 IV" value={namaAlat} onChange={(e) => setNamaAlat(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-light">Kategori Alat</label>
                <input type="text" className="form-control bg-dark text-white border-secondary rounded-3 custom-placeholder" placeholder="Contoh: Kamera, Drone, Lensa" value={kategori} onChange={(e) => setKategori(e.target.value)} required />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-bold text-light">Jumlah Unit</label>
                <input type="number" className="form-control bg-dark text-white border-secondary rounded-3" min="1" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required />
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
                <button type="submit" className="btn btn-danger w-100 fw-bold rounded-3" disabled={loading}>{loading ? '...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>

        {/* ==================== 🟢 SECTION BARU: MODEREN SEARCH & PAGINATION HEADER ==================== */}
        <div className="card shadow border-0 rounded-4 mb-4" style={{ background: '#1e293b' }}>
          <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            
            {/* Sisi Kiri: Entries Limit & Filter Kategori */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-muted font-monospace">Show</span>
              <select 
                className="form-select form-select-sm bg-dark text-white border-secondary rounded-2 white-icons-select" 
                style={{ width: '70px' }}
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span className="small text-muted font-monospace">entries</span>

              <div className="ms-md-3 d-flex align-items-center gap-2">
                <span className="small text-muted font-monospace">Kategori:</span>
                <select 
                  className="form-select form-select-sm bg-dark text-white border-secondary rounded-2 white-icons-select text-capitalize"
                  style={{ minWidth: '110px' }}
                  value={filterKategori}
                  onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}
                >
                  {uniqueKategories.map((kat, index) => (
                    <option key={index} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sisi Kanan: Input Box Search Real-time */}
            <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
              <BsSearch className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '12px' }} />
              <input 
                type="text" 
                className="form-control form-control-sm bg-dark text-white border-secondary rounded-3 custom-placeholder" 
                style={{ paddingLeft: '35px' }}
                placeholder="Cari kelengkapan alat..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* Tabel Data Minimalis */}
        <div className="card shadow border-0 rounded-4 overflow-hidden mb-3" style={{ background: '#1e293b' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
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
                  {currentEntries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-white small fw-semibold">
                        Data kelengkapan alat tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    currentEntries.map((item) => (
                      <tr key={item.id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                        <td className="px-4 fw-bold text-white py-3">{item.nama_alat}</td>
                        <td><span className="badge bg-dark border border-secondary text-capitalize text-white px-2 py-1">{item.kategori || 'General'}</span></td>
                        <td className="fw-semibold text-light">{item.jumlah} Unit</td>
                        <td>{renderStatusBadge(item.status)}</td>
                        <td className="text-center">
                          <button type="button" onClick={() => openEditModal(item)} className="btn btn-sm btn-outline-light border-0 me-2 fw-semibold px-2">Edit</button>
                          <button type="button" onClick={() => handleDeleteItem(item.id)} className="btn btn-sm btn-outline-danger border-0 fw-semibold px-2">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==================== 🟢 SECTION BARU: MODEREN PAGINATION FOOTER ==================== */}
        {filteredItems.length > 0 && (
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 p-2 font-monospace" style={{ fontSize: '13px', color: '#94a3b8' }}>
            <div>
              Showing {indexOfFirstItem + 1} to {indexOfLastItem > filteredItems.length ? filteredItems.length : indexOfLastItem} of {filteredItems.length} entries
            </div>
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="page-link-custom" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <div className="d-flex align-items-center justify-content-center px-3 rounded-3 fw-bold bg-danger text-white">
                {currentPage}
              </div>
              <button 
                type="button" 
                className="page-link-custom" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}

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
                      <input type="text" className="form-control bg-dark text-white border-secondary" value={editKategori} onChange={(e) => setEditKategori(e.target.value)} required />
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
                    <button type="submit" className="btn btn-danger fw-bold" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
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