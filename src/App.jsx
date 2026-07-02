import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin'; 
import DashboardCustomers from './pages/DashboardCustomers'; 

//BAGIAN YANG DIPERBARUI SESUAI NAMA FILE BARU:
import ManajemenInventori from './pages/ManajemenInventori';
import PesananJasa from './pages/PesananJasa';
import LaporanAnalitik from './pages/LaporanAnalitik';
import Settings from './pages/Settings';
import RiwayatBooking from './pages/RiwayatBooking';
import PengaturanBotAi from './pages/PengaturanBotAi';

import BookingAdmin from './pages/BookingAdmin';
import BookingCustomers from './pages/BookingCustomers';

function App() {
  // KUNCI 1: Ubah role menjadi useState agar reaktif mendeteksi perubahan login
  const [role, setRole] = useState(localStorage.getItem('beb_user_role') || 'customer');

  // KUNCI 2: Gunakan useEffect untuk memantau perubahan localStorage secara berkala/realtime
  useEffect(() => {
    const handleStorageChange = () => {
      const currentRole = localStorage.getItem('beb_user_role') || 'customer';
      setRole(currentRole);
    };

    // Jalankan pengecekan setiap kali komponen dimuat
    handleStorageChange();

    // Event listener bawaan browser untuk memantau jika ada aktivitas login/logout
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          {/* KUNCI 3: Kirim fungsi setRole ke komponen Login agar ketika sukses login, role langsung berubah instan */}
          <Route path="/login" element={<Login onLoginSuccess={() => setRole(localStorage.getItem('beb_user_role'))} />} />

          <Route path="/dashboard" element={role === 'admin' ? <DashboardAdmin /> : <DashboardCustomers />} />
          
          {/* Rute Berkas Baru */}
          <Route path="/dashboard/inventory" element={<ManajemenInventori />} />
          <Route path="/dashboard/orders" element={<PesananJasa />} />
          <Route path="/dashboard/reports" element={<LaporanAnalitik />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
          <Route path="/booking" element={role === 'admin' ? <BookingAdmin /> : <BookingCustomers />} />
          
          <Route path="/my-bookings" element={<RiwayatBooking />} />
          <Route path="/ai-recommendation" element={<PengaturanBotAi />} />
          
          <Route
            path="*"
            element={
              <div className="d-flex min-vh-100 justify-content-center align-items-center flex-column text-dark bg-white">
                <h2 className="fw-bold text-danger font-monospace m-0">404</h2>
                <h5 className="fw-bold mt-2">Halaman Tidak Ditemukan!</h5>
                <a href="/login" className="btn btn-sm btn-danger rounded-3 font-monospace px-3 py-2 fw-bold">Kembali ke Login</a>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;