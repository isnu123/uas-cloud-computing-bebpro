import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
// 🟢 Menambahkan BsEye dan BsEyeSlash untuk fitur intip password
import { BsPerson, BsEnvelope, BsLock, BsCheckCircleFill, BsExclamationTriangleFill, BsEye, BsEyeSlash } from 'react-icons/bs';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 🟢 State baru untuk kolom Konfirmasi Password
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [role] = useState('customer'); // Kunci mati nilai awal sebagai customer[cite: 5]
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 🟢 State untuk kontrol visibility masing-masing kolom password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    // 🟢 VALIDASI MUTLAK: Pastikan kedua password sama sebelum dikirim ke Supabase
    if (password !== confirmPassword) {
      setErrorMsg('Password dan Konfirmasi Password tidak cocok!');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role // Terkirim otomatis sebagai 'customer'[cite: 5]
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage(
        'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.'
      );

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // Reset kolom konfirmasi password
    }

    setLoading(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-x-hidden"
      style={{ backgroundColor: '#111827' }}
    >
      {/* SUNTIKAN CSS INTERNAL UNTUK INPUT SAAS MODERN */}
      <style>{`
        .saas-input {
          background-color: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          font-size: 14px !important;
          padding: 12px 14px !important;
          border-radius: 16px !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
        }
        .saas-input:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 0.25rem rgba(239, 68, 68, 0.25) !important;
          background-color: #0f172a !important;
        }
        .saas-input::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }
        .saas-input:-webkit-autofill {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
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
        .input-group > .saas-input {
          border-top-right-radius: 0px !important;
          border-bottom-right-radius: 0px !important;
        }
        .input-group > .password-toggle-btn {
          border-top-right-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
        }
        .saas-btn {
          transition: transform 0.1s ease, background-color 0.2s ease !important;
          border-radius: 16px !important;
        }
        .saas-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <div
        className="card border-0 shadow-lg"
        style={{
          width: '100%',
          maxWidth: '1000px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div className="row g-0">

          {/* SISI KIRI: PENJELASAN */}
          <div
            className="col-12 col-lg-5 d-flex flex-column justify-content-center p-4 p-md-5 text-white"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              borderBottomLeftRadius: window.innerWidth > 992 ? '16px' : '0px'
            }}
          >
            <small className="fw-bold mb-2 tracking-wider" style={{ color: '#ef4444' }}>
              BEB PRODUCTION
            </small>

            <h1 className="fw-bold mb-3" style={{ fontSize: '28px' }}>
              Bergabung Bersama Kami
            </h1>

            <p
              className="mb-4"
              style={{ lineHeight: '1.7', color: '#cbd5e1', fontSize: '14px' }}
            >
              Mulai perjalanan kreatif Anda bersama BEB Production. Kelola seluruh dokumentasi event Anda secara terotomatisasi.
            </p>

            <div className="font-monospace" style={{ color: '#94a3b8', fontSize: '12px' }}>
              Powered by React • Supabase • n8n
            </div>
          </div>

          {/* SISI KANAN: FORM REGISTRASI */}
          <div className="col-12 col-lg-7" style={{ backgroundColor: '#1e293b', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div className="p-4 p-md-5">

              <h2 className="fw-bold mb-4 text-white" style={{ fontSize: '24px' }}>
                Daftar <span style={{ color: '#ef4444' }}>BEB</span> Portal
              </h2>

              {/* NOTIFIKASI */}
              {message && (
                <div className="alert bg-dark text-white border border-secondary mb-4 d-flex align-items-center gap-2" style={{ borderRadius: '16px' }}>
                  <BsCheckCircleFill className="text-success" />
                  <span className="small fw-bold">{message}</span>
                </div>
              )}

              {errorMsg && (
                <div className="alert bg-dark text-white border border-danger mb-4 d-flex align-items-center gap-2" style={{ borderRadius: '16px' }}>
                  <BsExclamationTriangleFill className="text-danger" />
                  <span className="small fw-bold">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister}>

                {/* NAMA LENGKAP */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-2" style={{ color: '#e2e8f0' }}>
                    <BsPerson className="me-2 text-danger" /> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="form-control saas-input"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* EMAIL ADDRESS */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-2" style={{ color: '#e2e8f0' }}>
                    <BsEnvelope className="me-2 text-danger" /> Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control saas-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* PASSWORD UTAMA */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-2" style={{ color: '#e2e8f0' }}>
                    <BsLock className="me-2 text-danger" /> Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control saas-input"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn password-toggle-btn d-flex align-items-center justify-content-center px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 🟢 KOLOM BARU: KONFIRMASI PASSWORD */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold mb-2" style={{ color: '#e2e8f0' }}>
                    <BsLock className="me-2 text-danger" /> Konfirmasi Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control saas-input"
                      placeholder="Ulangi password Anda"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn password-toggle-btn d-flex align-items-center justify-content-center px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100 py-2.5 fw-bold saas-btn"
                  style={{ fontSize: '15px' }}
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </button>

              </form>

              <div className="my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}></div>

              <div className="text-center" style={{ fontSize: '14px' }}>
                <span style={{ color: '#cbd5e1' }}>
                  Sudah memiliki akun?
                </span>
                <Link
                  to="/login"
                  className="text-danger fw-bold text-decoration-none ms-1"
                >
                  Login Sekarang
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;