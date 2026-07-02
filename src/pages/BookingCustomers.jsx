import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import { BsCalendarEvent, BsGeoAlt, BsCreditCard, BsCloudUpload, BsInfoCircle } from 'react-icons/bs';

function BookingCustomers() {
  const location = useLocation();
  
  // State Utama Form Customer
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [tanggalEvent, setTanggalEvent] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [bankTujuan, setBankTujuan] = useState('seabank'); // Default SeaBank (Mitra Ardcell)
  const [buktiBayarFile, setBuktiBayarFile] = useState(null);
  const [totalBayar, setTotalBayar] = useState(0);
  
  // State Operasional UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Sinkronisasi katalog paket dan kalkulasi harga secara presisi saat halaman dimuat
  useEffect(() => {
    const loadKatalogDanAi = async () => {
      const { data, error } = await supabase.from('packages').select('*');
      if (!error && data && data.length > 0) {
        setPackages(data);

        // Deteksi apakah ada lemparan parameter state dari halaman AiRecommendation
        const paketDariAi = location.state?.paketDariAi;
        if (paketDariAi) {
          const matchedPkg = data.find(p => p.nama_paket.toLowerCase().includes(paketDariAi.toLowerCase()));
          if (matchedPkg) {
            setSelectedPackage(matchedPkg.id);
            setTotalBayar(matchedPkg.harga);
            return;
          }
        }

        // Jika refresh biasa, pasang paket pertama SEKALIGUS harganya (tidak boleh 0 lagi)
        setSelectedPackage(data[0].id);
        setTotalBayar(data[0].harga);
      }
    };

    loadKatalogDanAi();
  }, [location.state]);

  const handlePackageChange = (packageId) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id.toString() === packageId.toString());
    if (pkg) {
      setTotalBayar(pkg.harga);
    }
  };

  // 2. Handler submit data & upload gambar ke Supabase Storage Bucket
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!buktiBayarFile) {
      setErrorMsg('Wajib melampirkan berkas foto bukti transfer untuk melakukan pemesanan jadwal!');
      return;
    }

    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Sesi login Anda berakhir. Silakan login ulang.');

      const fileExt = buktiBayarFile.name.split('.').pop();
      const fileName = `bukti-${user.id}-${Date.now()}.` + fileExt;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, buktiBayarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw new Error('Gagal menyimpan file bukti pembayaran ke cloud storage: ' + uploadError.message);

      const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
      const buktiBayarUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          package_id: selectedPackage,
          tanggal_event: tanggalEvent,
          lokasi: lokasi,
          total_bayar: totalBayar,
          status: 'pending',
          payment_bank: bankTujuan,
          payment_receipt_url: buktiBayarUrl
        }
      ]);

      if (insertError) throw insertError;

      setMessage('🎉 Booking Berhasil! Antrean jadwal Anda dikunci dan n8n otomatis meneruskan notifikasi ke Telegram kru.');
      setTanggalEvent('');
      setLokasi('');
      setBuktiBayarFile(null);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi gangguan interaksi dengan server database Cloud.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }} translate="no">
      {/* SUNTIKAN CSS INTERNAL UNTUK MENGUBAH ICON BAWAAN BROWSER MENJADI PUTIH */}
      <style>{`
        /* Mengubah icon panah bawah select menjadi putih */
        .white-icons-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708 .708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
        }
        /* Mengubah icon kalender datepicker menjadi putih */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>

      <Sidebar onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="fw-bold m-0 text-white">Portal <span style={{ color: '#ef4444' }}>Booking Pelanggan</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Kunci tanggal produksi dokumentasi acara Anda dan unggah konfirmasi administrasi keuangan.
          </p>
        </div>

        {message && <div className="alert bg-success-subtle text-success border border-success mb-4 rounded-3 small fw-bold">{message}</div>}
        {errorMsg && <div className="alert bg-danger-subtle text-danger border border-danger mb-4 rounded-3 small fw-bold">⚠️ {errorMsg}</div>}

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow border-0 rounded-4 text-white h-100" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4">
                <form onSubmit={handleBookingSubmit}>
                  
                  {/* Select Paket Layanan */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">
                      <BsCalendarEvent className="me-2 text-danger" /> Pilih Paket Dokumentasi
                    </label>
                    <select
                      className="form-select bg-dark text-white border-secondary rounded-3 white-icons-select"
                      value={selectedPackage}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      required
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.nama_paket} — (Rp{parseFloat(pkg.harga).toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                    {location.state?.paketDariAi && (
                      <div className="form-text text-danger small mt-1 fw-bold">
                        Terpilih otomatis berdasarkan analisis rekomendasi kecerdasan buatan Gemini.
                      </div>
                    )}
                  </div>

                  {/* Input Tanggal Event */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Tanggal Pelaksanaan Acara</label>
                    <input
                      type="date"
                      className="form-control bg-dark text-white border-secondary rounded-3"
                      value={tanggalEvent}
                      onChange={(e) => setTanggalEvent(e.target.value)}
                      required
                    />
                  </div>

                  {/* Textarea Lokasi */}
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-light">
                      <BsGeoAlt className="me-2 text-danger" /> Lokasi Lengkap Acara / Gedung
                    </label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary rounded-3"
                      rows="3"
                      style={{ resize: 'none' }}
                      placeholder="Contoh: Dusun Karanganyar, Karangtengah, Wonogiri"
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-danger w-100 py-2.5 rounded-3 fw-bold" disabled={loading || packages.length === 0}>
                    {loading ? 'Mengunci Jadwal & Mengunggah Berkas...' : 'Kunci & Kirim Jadwal Booking'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow border-0 rounded-4 text-white h-100" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>
                    <BsCreditCard className="me-2" /> Invoice Transfer Bank
                  </h5>
                  
                  <div className="bg-dark p-3 rounded-3 border border-secondary mb-4 text-center">
                    {/* Perbaikan Teks Tagihan Terang Kontras */}
                    <small className="d-block text-uppercase tracking-wider font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>Total Tagihan Administrasi</small>
                    <h3 className="fw-bold m-0 text-danger mt-1">Rp{parseFloat(totalBayar).toLocaleString('id-ID')}</h3>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-light">Rekening Tujuan Mitra BEB Production</label>
                    <select className="form-select bg-dark text-white border-secondary rounded-3 mb-3 white-icons-select" value={bankTujuan} onChange={(e) => setBankTujuan(e.target.value)}>
                      <option value="seabank">SeaBank (Digital Retail Merchant)</option>
                      <option value="dana">DANA Instant E-Wallet</option>
                    </select>

                    <div className="p-3 bg-dark rounded-3 border border-dashed border-secondary">
                      {bankTujuan === 'seabank' ? (
                        <>
                          <small className="d-block font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>NOMOR REKENING SEABANK (ARDCELL RETAIL):</small>
                          <span className="fw-bold text-white fs-5 font-monospace">9012-3456-7890</span>
                          <small className="d-block text-light mt-1">a.n. Isnu Ardianto</small>
                        </>
                      ) : (
                        <>
                          <small className="d-block font-monospace" style={{ color: '#94a3b8', fontSize: '11px' }}>NOMOR AKUN DANA BUSINESS:</small>
                          <span className="fw-bold text-white fs-5 font-monospace">0821-3456-7890</span>
                          <small className="d-block text-light mt-1">a.n. BEB Production Billing</small>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light"><BsCloudUpload className="me-2 text-danger" /> Unggah Foto Bukti Transfer (Wajib)</label>
                    <input type="file" accept="image/*" className="form-control bg-dark text-white border-secondary rounded-3" onChange={(e) => setBuktiBayarFile(e.target.files[0])} required />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top border-secondary d-flex gap-2 align-items-start text-muted" style={{ fontSize: '12px' }}>
                  <BsInfoCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                  <p className="m-0" style={{ color: '#94a3b8', lineHeight: '1.5' }}>
                    Sistem otomasi n8n terintegrasi akan mendeteksi invoice masuk ini dan menembakkan pesan log ringkasan langsung ke grup internal Telegram kru BEB Production secara real-time.
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

export default BookingCustomers;