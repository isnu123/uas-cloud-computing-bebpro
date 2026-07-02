import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
// 🟢 Menambahkan BsEye dan BsEyeSlash untuk fitur intip password
import { BsEnvelope, BsLock, BsLightningCharge, BsArrowRightShort, BsEye, BsEyeSlash } from 'react-icons/bs';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  // 🟢 State baru untuk memantau apakah password sedang diperlihatkan atau disembunyikan
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Proses login otentikasi menggunakan Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Menyimpan role di localStorage jika ada metadata role, default ke customer
      const userRole = data?.user?.user_metadata?.role || 'customer';
      localStorage.setItem('beb_user_role', userRole);
      
      // 🟢 PEMBARUAN UTAMA: Memicu event agar App.jsx memperbarui state role secara realtime
      window.dispatchEvent(new Event('storage')); 
      
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }

      // 🟢 Beri jeda 100ms agar sistem App.jsx selesai mengubah state role ke admin sebelum halaman berpindah
      setTimeout(() => {
        navigate('/dashboard');
        setLoading(false);
      }, 100);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-2 p-sm-3"
      style={{ backgroundColor: '#111827' }} translate="no"
    >
      {/* CSS internal tambahan untuk merapikan input-group dan ikon mata rahasia */}
      <style>{`
        .login-input {
          background-color: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
        }
        .login-input:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 0.25rem rgba(239, 68, 68, 0.25) !important;
        }
        .password-toggle-btn {
          background-color: #0f172a !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-left: none !important;
          color: #94a3b8 !important;
          transition: color 0.2s ease;
        }
        .password-toggle-btn:hover {
          color: #ef4444 !important;
        }
        /* Siasat agar border input radiusnya rapi menyatu dengan tombol mata */
        .input-group > .login-input {
          border-top-right-radius: 0px !important;
          border-bottom-right-radius: 0px !important;
        }
        .input-group > .password-toggle-btn {
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }
      `}</style>

      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden my-3"
        style={{
          width: '100%',
          maxWidth: '900px',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="row g-0 flex-column-reverse flex-lg-row">

          {/* PANEL KIRI: BRANDING HERO */}
          <div
            className="col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 text-white position-relative"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="mb-3 mb-md-4">
              <span className="badge bg-danger px-3 py-1.5 fw-bold font-monospace tracking-wider" style={{ fontSize: '11px' }}>
                BEB PRODUCTION PORTAL
              </span>
            </div>

            <h1 className="fw-bold mb-2 mb-md-3 text-white fs-3 fs-md-2">
              Selamat <br className="d-none d-lg-inline" />Datang Kembali
            </h1>

            <p
              className="mb-3 mb-md-4 small text-secondary"
              style={{ lineHeight: '1.6', color: '#cbd5e1' }}
            >
              Sistem Operasional Terintegrasi Cloud untuk Pengelolaan Inventaris, Live Streaming Multi-Kamera, dan Booking Penjadwalan Praktis.
            </p>

            <div 
              className="mt-3 mt-md-4 pt-3 border-top border-secondary font-monospace d-flex align-items-center gap-2" 
              style={{ fontSize: '11px', color: '#94a3b8' }} 
            >
              <BsLightningCharge className="text-danger" />
              <span>Powered by React • Supabase Cloud • n8n</span>
            </div>
          </div>

          {/* PANEL KANAN: FORM INPUT LOGIN */}
          <div className="col-lg-6" style={{ backgroundColor: '#1e293b' }}>
            <div className="p-4 p-md-5">

              <h3 className="fw-bold mb-1 text-white fs-4 fs-md-3">
                Login <span style={{ color: '#ef4444' }}>BEB</span> Portal
              </h3>
              <p 
                className="small mb-4" 
                style={{ color: '#cbd5e1' }}
              >
                Silakan masukkan akun Anda untuk mengakses sistem dashboard.
              </p>

              {errorMsg && (
                <div className="alert alert-danger border-0 rounded-3 small fw-bold font-monospace py-2.5">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin}>

                {/* EMAIL ADDRESS */}
                <div className="mb-3 mb-md-4">
                  <label
                    className="form-label fw-semibold d-flex align-items-center gap-2 mb-2"
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                    }}
                  >
                    <BsEnvelope className="text-danger" />
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="form-control login-input py-2"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                  <label
                    className="form-label fw-semibold d-flex align-items-center gap-2 mb-2"
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                    }}
                  >
                    <BsLock className="text-danger" />
                    Password
                  </label>

                  {/* 🟢 Dibungkus Menggunakan Input Group Bootstrap */}
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"} // Jika true bertipe text, jika false bertipe password
                      className="form-control login-input py-2"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {/* Tombol interaktif untuk mengubah status penampakan password */}
                    <button
                      type="button"
                      className="btn password-toggle-btn d-flex align-items-center justify-content-center px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="btn btn-danger w-100 fw-bold rounded-3 py-2.5 d-flex align-items-center justify-content-center gap-1 shadow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                      <span>Memvalidasi Sesi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Ke Dashboard</span>
                      <BsArrowRightShort size={20} />
                    </>
                  )}
                </button>

              </form>

              <hr className="my-4 border-secondary" />

              {/* REGISTER REDIRECT */}
              <div className="text-center small">
                <span style={{ color: '#cbd5e1' }}>
                  Belum memiliki akun resmi?
                </span>
                <a
                  href="/register"
                  className="text-danger fw-bold text-decoration-none ms-1 d-inline-flex align-items-center"
                >
                  Daftar Sekarang
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;