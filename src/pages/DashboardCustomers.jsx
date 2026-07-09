import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import {
  BsCameraVideo,
  BsBroadcast,
  BsPeople,
  BsLightningCharge,
  BsBullseye,
  BsCheckCircleFill,
  BsWhatsapp,
  BsInstagram,
  BsYoutube,
  BsLayers,
  BsGrid1X2,
  BsGem,
  BsChatLeftText,
  BsArrowRightShort,
  BsClock
} from 'react-icons/bs';
import bebSetup from '../assets/beb-setup.jpg';

function DashboardCustomers() {
  const [name, setName] = useState('Pelanggan');
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDashboardData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userName = user.user_metadata?.name || 'Pelanggan';
          setName(userName);

          const { count, error } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (!error) {
            setBookingCount(count || 0);
          }
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data dashboard pelanggan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number).replace(/\s/g, '');
  };

  // Gaya CSS SaaS Modern (Vercel/GitHub Style)
  const cardStyle = {
    backgroundColor: '#1f2937', 
    border: '1px solid #374151',
    borderRadius: '16px',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const cardHoverEffect = (e, isHover) => {
    e.currentTarget.style.transform = isHover ? 'translateY(-4px)' : 'translateY(0)';
    e.currentTarget.style.borderColor = isHover ? '#ef4444' : '#374151';
    e.currentTarget.style.boxShadow = isHover ? '0 10px 20px rgba(239, 68, 68, 0.1)' : 'none';
  };

  const buttonTransition = (e, isHover) => {
    e.currentTarget.style.transform = isHover ? 'scale(1.02)' : 'scale(1)';
  };

  // Hover khusus untuk tombol WhatsApp gelap agar menyala merah saat disentuh
  const whatsappButtonHover = (e, isHover) => {
    e.currentTarget.style.transform = isHover ? 'scale(1.02)' : 'scale(1)';
    e.currentTarget.style.borderColor = isHover ? '#ef4444' : '#4b5563';
    e.currentTarget.style.color = isHover ? '#ef4444' : '#ffffff';
    e.currentTarget.style.backgroundColor = isHover ? 'rgba(239, 68, 68, 0.05)' : 'transparent';
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }} translate="no">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        <div className="container-fluid p-0">

{/* HERO BANNER UTAMA */}
          <div
            className="card border-0 overflow-hidden mb-4 shadow-sm"
            style={{ 
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 
              border: '1px solid #374151',
              borderRadius: '16px'
            }}
          >
            {/* 1. MENGGANTI ALIGNMENT AGAR DI HP TINGGINYA MENYESUAIKAN SEJAJAR */}
            <div className="row g-0 align-items-stretch">
              
              {/* KONTEN KIRI */}
              {/* 2. MENAMBAHKAN col-12 SUPAYA DI HP KONTEN TEKS MENJADI SELEBAR LAYAR */}
              <div className="col-12 col-lg-6 p-4 p-md-5 text-white d-flex flex-column justify-content-center">
                <div>
                  <span className="badge bg-danger px-3 py-1.5 mb-3 fw-bold font-monospace tracking-wider" style={{ fontSize: '11px', borderRadius: '4px' }}>
                    BEB PRODUCTION PORTAL
                  </span>

                  <h1 className="fw-bold display-6 mb-2 text-white">
                    Selamat Datang,<br />
                    <span style={{ color: '#ef4444' }}>{name}</span>
                  </h1>

                  <h4 className="fw-semibold mb-4" style={{ color: '#f3f4f6' }}>Solusi Visual Terdepan</h4>

                  <p className="small mb-4" style={{ color: '#cbd5e1', lineHeight: '1.7' }}>
                    Beb Production bukan sekadar penyedia jasa shooting biasa. Kami adalah mitra sukses perjalanan kreatif Anda yang berbasis di Wonogiri dan berfokus pada pemanfaatan teknologi cloud live streaming serta produksi video sinematik profesional.
                  </p>

                  <Link 
                    to="/booking" 
                    className="btn btn-danger px-4 py-2.5 fw-bold shadow-sm"
                    style={{ borderRadius: '8px', transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => buttonTransition(e, true)}
                    onMouseLeave={(e) => buttonTransition(e, false)}
                  >
                    Booking Sekarang
                  </Link>
                </div>
              </div>

              {/* FOTO KANAN / BAWAH */}
              {/* 3. MENGHAPUS d-none d-lg-block, DAN MENGGUNAKAN col-12 col-lg-6 */}
              <div className="col-12 col-lg-6 position-relative" style={{ minHeight: '280px' }}>
                <img
                  src={bebSetup}
                  alt="BEB Production Setup"
                  className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                  style={{ opacity: 0.6 }}
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* KATALOG 4 PILIHAN PAKET RESMI & PAKET REQUEST */}
          {/* ========================================================= */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <BsLayers style={{ color: '#ef4444' }} size={20} />
              <h4 className="fw-bold m-0 text-white">Katalog Paket Unggulan Resmi</h4>
            </div>
            <p className="small mb-3" style={{ color: '#cbd5e1' }}>Pilih paket dokumentasi multimedia premium yang sesuai dengan kebutuhan konsep acara Anda.</p>
            
            <div className="row g-3">
              {/* PAKET 1: WEDDING 1 */}
              <div className="col-md-6 col-xl-3">
                <div 
                  className="card p-3 h-100 d-flex flex-column justify-content-between text-start" 
                  style={{ ...cardStyle, borderTop: '4px solid #ef4444' }}
                  onMouseEnter={(e) => cardHoverEffect(e, true)}
                  onMouseLeave={(e) => cardHoverEffect(e, false)}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-danger bg-opacity-10 text-danger fw-bold font-monospace" style={{ fontSize: '11px', borderRadius: '4px' }}>WEDDING ACCORD</span>
                      <BsGem style={{ color: '#ef4444' }} size={16} />
                    </div>
                    <h5 className="fw-bold text-white m-0">Wedding 1</h5>
                    <h4 className="fw-bold font-monospace mt-2" style={{ fontSize: '20px', color: '#ef4444' }}>{formatRupiah(2500000)}</h4>
                    <hr style={{ borderColor: '#374151', margin: '12px 0' }} />
                    <ul className="list-unstyled small p-0 m-0 vstack gap-2" style={{ color: '#f3f4f6', fontSize: '12.5px' }}>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> 2 Kamera Full HD & 3 Kru</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> 2 TV Monitoring System</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> Dokumentasi Foto & Video</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> Editing Highlight Video</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="font-monospace m-0 mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '11px', color: '#cbd5e1' }}><BsClock size={12} /> Durasi Kerja: 8 Jam</p>
                    <Link 
                      to="/booking" 
                      className="btn btn-sm btn-danger w-100 fw-bold" 
                      style={{ borderRadius: '8px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={(e) => buttonTransition(e, true)}
                      onMouseLeave={(e) => buttonTransition(e, false)}
                    >
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>

              {/* PAKET 2: WEDDING 2 */}
              <div className="col-md-6 col-xl-3">
                <div 
                  className="card p-3 h-100 d-flex flex-column justify-content-between text-start" 
                  style={{ ...cardStyle, borderTop: '4px solid #ef4444' }}
                  onMouseEnter={(e) => cardHoverEffect(e, true)}
                  onMouseLeave={(e) => cardHoverEffect(e, false)}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-danger bg-opacity-10 text-danger fw-bold font-monospace" style={{ fontSize: '11px', borderRadius: '4px' }}>WEDDING PREMIUM</span>
                      <BsCameraVideo style={{ color: '#ef4444' }} size={16} />
                    </div>
                    <h5 className="fw-bold text-white m-0">Wedding 2</h5>
                    <h4 className="fw-bold font-monospace mt-2" style={{ fontSize: '20px', color: '#ef4444' }}>{formatRupiah(3500000)}</h4>
                    <hr style={{ borderColor: '#374151', margin: '12px 0' }} />
                    <ul className="list-unstyled small p-0 m-0 vstack gap-2" style={{ color: '#f3f4f6', fontSize: '12.5px' }}>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> 3 Kamera Full HD & 4 Kru</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> Video Cinematic Premium</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> Drone Aerial Capture</li>
                      <li><BsCheckCircleFill style={{ color: '#ef4444' }} className="me-1.5 small" /> 3 TV Monitoring System</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="font-monospace m-0 mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '11px', color: '#cbd5e1' }}><BsClock size={12} /> Durasi Kerja: Full 1 Hari</p>
                    <Link 
                      to="/booking" 
                      className="btn btn-sm btn-danger w-100 fw-bold" 
                      style={{ borderRadius: '8px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={(e) => buttonTransition(e, true)}
                      onMouseLeave={(e) => buttonTransition(e, false)}
                    >
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>

              {/* PAKET 3: LAPANGAN 1 */}
              <div className="col-md-6 col-xl-3">
                <div 
                  className="card p-3 h-100 d-flex flex-column justify-content-between text-start" 
                  style={{ ...cardStyle, borderTop: '4px solid #ffffff' }}
                  onMouseEnter={(e) => cardHoverEffect(e, true)}
                  onMouseLeave={(e) => cardHoverEffect(e, false)}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light bg-opacity-10 text-white fw-bold font-monospace" style={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #4b5563' }}>EVENT FIELD</span>
                      <BsGrid1X2 style={{ color: '#ffffff' }} size={16} />
                    </div>
                    <h5 className="fw-bold text-white m-0">Lapangan 1</h5>
                    <h4 className="fw-bold font-monospace mt-2 text-white" style={{ fontSize: '20px' }}>{formatRupiah(2500000)}</h4>
                    <hr style={{ borderColor: '#374151', margin: '12px 0' }} />
                    <ul className="list-unstyled small p-0 m-0 vstack gap-2" style={{ color: '#f3f4f6', fontSize: '12.5px' }}>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> 3 Kamera Full HD & 4 Kru</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Live Switching System</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Dokumentasi Full Event</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Direct Audio Recording</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="font-monospace m-0 mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '11px', color: '#cbd5e1' }}><BsClock size={12} /> Durasi Kerja: 8 Jam</p>
                    <Link 
                      to="/booking" 
                      className="btn btn-sm btn-light w-100 fw-bold text-dark" 
                      style={{ borderRadius: '8px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={(e) => buttonTransition(e, true)}
                      onMouseLeave={(e) => buttonTransition(e, false)}
                    >
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>

              {/* PAKET 4: LAPANGAN 2 */}
              <div className="col-md-6 col-xl-3">
                <div 
                  className="card p-3 h-100 d-flex flex-column justify-content-between text-start" 
                  style={{ ...cardStyle, borderTop: '4px solid #ffffff' }}
                  onMouseEnter={(e) => cardHoverEffect(e, true)}
                  onMouseLeave={(e) => cardHoverEffect(e, false)}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light bg-opacity-10 text-white fw-bold font-monospace" style={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #4b5563' }}>LIVE SPECIALIST</span>
                      <BsBroadcast style={{ color: '#ffffff' }} size={16} />
                    </div>
                    <h5 className="fw-bold text-white m-0">Lapangan 2</h5>
                    <h4 className="fw-bold font-monospace mt-2 text-white" style={{ fontSize: '20px' }}>{formatRupiah(3500000)}</h4>
                    <hr style={{ borderColor: '#374151', margin: '12px 0' }} />
                    <ul className="list-unstyled small p-0 m-0 vstack gap-2" style={{ color: '#f3f4f6', fontSize: '12.5px' }}>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> 4 Kamera Full HD & 5 Kru</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Live Streaming (YT/FB)</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Instant Replay System</li>
                      <li><BsCheckCircleFill style={{ color: '#ffffff' }} className="me-1.5 small" /> Drone Aerial Production</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="font-monospace m-0 mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '11px', color: '#cbd5e1' }}><BsClock size={12} /> Durasi Kerja: Full Event</p>
                    <Link 
                      to="/booking" 
                      className="btn btn-sm btn-light w-100 fw-bold text-dark" 
                      style={{ borderRadius: '8px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={(e) => buttonTransition(e, true)}
                      onMouseLeave={(e) => buttonTransition(e, false)}
                    >
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU CUSTOM REKUES VIA WHATSAPP (FIXED SINFARMA/VERCEL LOOK) */}
            <div 
              className="card p-4 mt-3 text-start shadow-sm" 
              style={cardStyle}
              onMouseEnter={(e) => cardHoverEffect(e, true)}
              onMouseLeave={(e) => cardHoverEffect(e, false)}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  {/* Perbaikan: Menghilangkan background kotak putih transparan */}
                  <div className="text-white d-none d-sm-block">
                    <BsChatLeftText size={22} style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <h5 className="fw-bold m-0 text-white">Punya Rencana Konsep Acara Sendiri? (Paket Request Kustom)</h5>
                    <p className="m-0 mt-1 small" style={{ color: '#cbd5e1' }}>
                      Jika jumlah kamera, kru, hardware vMix, running text OBS Studio, atau budget Anda ingin disesuaikan secara kustom, silakan konsultasikan langsung via WhatsApp.
                    </p>
                  </div>
                </div>
                {/* Perbaikan: Mengubah tombol putih mencolok menjadi tombol dark minimalis */}
                <a 
                  href="https://wa.me/6282225214426?text=Halo%20Admin%20BEB%20Production%2C%20saya%20ingin%20mengajukan%20kustomisasi%20request%20paket%20jasa%20dokumentasi%20sesuai%20kebutuhan%20acara%20saya..." 
                  className="btn fw-bold px-3 py-2 d-flex align-items-center gap-2"
                  style={{ 
                    borderRadius: '8px', 
                    border: '1px solid #4b5563', 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    transition: 'all 0.2s ease' 
                  }}
                  target="_blank" 
                  rel="noreferrer"
                  onMouseEnter={(e) => whatsappButtonHover(e, true)}
                  onMouseLeave={(e) => whatsappButtonHover(e, false)}
                >
                  <BsWhatsapp size={16} /> Hubungi via WhatsApp <BsArrowRightShort size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* NILAI UTAMA LAYANAN */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card p-3 h-100 text-center shadow-sm" style={cardStyle}>
                <BsCameraVideo size={32} style={{ color: '#ef4444' }} className="mx-auto mb-2" />
                <h6 className="fw-bold text-white mb-1">Visual Premium</h6>
                <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Perangkat profesional untuk hasil sinematik berkualitas tinggi.</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 h-100 text-center shadow-sm" style={cardStyle}>
                <BsBroadcast size={32} style={{ color: '#ef4444' }} className="mx-auto mb-2" />
                <h6 className="fw-bold text-white mb-1">Streaming Stabil</h6>
                <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Sistem siaran langsung terintegrasi cloud yang aman dan lancar.</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 h-100 text-center shadow-sm" style={cardStyle}>
                <BsPeople size={32} style={{ color: '#ef4444' }} className="mx-auto mb-2" />
                <h6 className="fw-bold text-white mb-1">Tim Ahli</h6>
                <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Didukung kru berpengalaman di bidang seni pertunjukan lapangan.</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 h-100 text-center shadow-sm" style={cardStyle}>
                <BsLightningCharge size={32} style={{ color: '#ef4444' }} className="mx-auto mb-2" />
                <h6 className="fw-bold text-white mb-1">Efisien & Cepat</h6>
                <small style={{ color: '#cbd5e1', fontSize: '12px' }}>Teknologi modern menjamin alur distribusi berkas data yang andal.</small>
              </div>
            </div>
          </div>

          {/* DATA MONITORING JADWAL & PROFIL */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="card p-4 text-white shadow-sm h-100" style={cardStyle}>
                <h6 className="text-uppercase tracking-wider font-monospace mb-2" style={{ color: '#94a3b8', fontSize: '11px' }}>Jadwal Antrean Anda</h6>
                <h1 className="fw-bold my-2" style={{ color: '#ef4444' }}>{loading ? '...' : bookingCount}</h1>
                <p className="small mb-4" style={{ color: '#cbd5e1' }}>Total pengajuan jadwal dokumentasi aktif yang telah Anda kirimkan.</p>
                <Link 
                  to="/booking" 
                  className="btn btn-outline-danger w-100 fw-bold"
                  style={{ borderRadius: '8px', transition: 'transform 0.2s ease' }}
                  onMouseEnter={(e) => buttonTransition(e, true)}
                  onMouseLeave={(e) => buttonTransition(e, false)}
                >
                  Buat Pengajuan Baru
                </Link>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card p-4 text-white shadow-sm h-100" style={cardStyle}>
                <small className="fw-bold font-monospace text-uppercase" style={{ fontSize: '11px', color: '#ef4444' }}>WHO WE ARE</small>
                <h3 className="fw-bold text-white mt-1 mb-3">Our Creative Story</h3>
                <p className="small mb-2" style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                  Beb Production adalah entitas industri kreatif yang berfokus penuh pada penyediaan layanan live streaming multi-kamera, videografi panggung, serta dokumentasi korporasi eksklusif.
                </p>
                <p className="small m-0" style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                  Berdiri kokoh sejak 2024 di Wonogiri, kami terus berinovasi mengawinkan seni visual tradisional dengan infrastruktur cloud komputasi moderen demi kepuasan klien tertinggi.
                </p>
              </div>
            </div>
          </div>

          {/* VISI & MISI */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card p-4 text-white shadow-sm" style={cardStyle}>
                <BsBullseye size={28} style={{ color: '#ef4444' }} className="mb-2" />
                <h5 className="fw-bold text-white">Visi Perusahaan</h5>
                <p className="small m-0" style={{ color: '#cbd5e1' }}>Menjadi mitra industri kreatif terdepan yang mendobrak batas visual estetis serta memperluas jangkauan teknologi penyiaran digital streaming.</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-4 text-white shadow-sm" style={cardStyle}>
                <BsCheckCircleFill size={28} style={{ color: '#ef4444' }} className="mb-2" />
                <h5 className="fw-bold text-white">Misi Perusahaan</h5>
                <p className="small m-0" style={{ color: '#cbd5e1' }}>Memberikan solusi penataan multi-kamera yang inovatif dan memastikan setiap memori berharga tersampaikan seutuhnya secara real-time.</p>
              </div>
            </div>
          </div>

          {/* HUBUNGI MEDIA SOSIAL */}
          <div className="card p-4 text-center shadow mb-4" style={cardStyle}>
            <small className="fw-bold font-monospace text-uppercase" style={{ fontSize: '11px', color: '#ef4444' }}>GET IN TOUCH</small>
            <h4 className="fw-bold text-white mt-1 mb-2">Hubungi Kanal Komunikasi Resmi Kami</h4>
            <p className="small mb-4" style={{ color: '#cbd5e1' }}>Mari transformasikan konsep acara luar biasa Anda menjadi mahakarya visual digital yang abadi.</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a 
                href="https://wa.me/6282225214426" 
                className="btn btn-outline-light px-3 py-2 fw-bold d-flex align-items-center gap-2" 
                style={{ borderRadius: '8px', transition: 'transform 0.2s ease' }}
                target="_blank" 
                rel="noreferrer"
                onMouseEnter={(e) => buttonTransition(e, true)}
                onMouseLeave={(e) => buttonTransition(e, false)}
              >
                <BsWhatsapp /> WhatsApp
              </a>
              <a 
                href="https://instagram.com/bebproduction" 
                className="btn btn-outline-light px-3 py-2 fw-bold d-flex align-items-center gap-2" 
                style={{ borderRadius: '8px', transition: 'transform 0.2s ease' }}
                target="_blank" 
                rel="noreferrer"
                onMouseEnter={(e) => buttonTransition(e, true)}
                onMouseLeave={(e) => buttonTransition(e, false)}
              >
                <BsInstagram /> Instagram
              </a>
              <a 
                href="https://www.youtube.com/@bebproduction" 
                className="btn btn-outline-light px-3 py-2 fw-bold d-flex align-items-center gap-2" 
                style={{ borderRadius: '8px', transition: 'transform 0.2s ease' }}
                target="_blank" 
                rel="noreferrer"
                onMouseEnter={(e) => buttonTransition(e, true)}
                onMouseLeave={(e) => buttonTransition(e, false)}
              >
                <BsYoutube /> YouTube
              </a>
            </div>
          </div>

          {/* HELPDESK FOOTER */}
          <div className="card p-3" style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px' }}>
            <div className="d-flex align-items-start gap-3">
              <BsChatLeftText size={20} style={{ color: '#ef4444', marginTop: '3px' }} />
              <div>
                <h6 className="fw-bold text-white mb-1" style={{ fontSize: '14px' }}>Butuh Bantuan atau Kustomisasi Paket Jasa Khusus?</h6>
                <p className="m-0 small" style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                  Apabila Anda memerlukan kustomisasi di luar paket standardisasi (seperti penambahan durasi tayang penyiaran, running text kustom OBS Studio, atau sewa peralatan hardware vMix), silakan hubungi admin helpdesk BEB Production melalui nomor tautan resmi di atas.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardCustomers;