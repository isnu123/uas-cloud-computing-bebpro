import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [omsetTerkumpul, setOmsetTerkumpul] = useState(0);
  const [totalPesanan, setTotalPesanan] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ['Total Omset', 'Target Bulanan'],
    datasets: [
      {
        label: 'Rupiah',
        data: [0, 15000000],
        backgroundColor: ['#ef4444', '#475569'],
        borderRadius: 8,
      }
    ]
  });

  useEffect(() => {
    const generateReport = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('total_bayar, status');
        
      if (!error && data) {
        // 1. Hitung total nominal rupiah dari database
        const totalOmset = data.reduce((sum, item) => sum + parseFloat(item.total_bayar || 0), 0);
        setOmsetTerkumpul(totalOmset);
        setTotalPesanan(data.length);
        
        // 2. Set struktur data grafik Chart.js dengan skema warna kontras tinggi
        setChartData({
          labels: ['Total Omset Terkumpul', 'Target Revenue Bulanan'],
          datasets: [
            {
              label: 'Capaian Finansial (IDR)',
              data: [totalOmset, 15000000], // Target konstan Rp15.000.000
              backgroundColor: ['#ef4444', '#334155'], // Merah BEB Pro & Slate Grey
              borderColor: ['#f87171', '#64748b'],
              borderWidth: 1,
              borderRadius: 8,
              barThickness: 50
            }
          ]
        });
      }
    };
    
    generateReport();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Konfigurasi opsi grafik agar warna teks labelnya putih (tidak pudar) di mode gelap
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: { weight: 'bold', family: 'sans-serif' }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#cbd5e1', font: { weight: '600' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#cbd5e1' }
      }
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#111827' }}>
      <Sidebar onLogout={handleLogout} />

      <div className="flex-grow-1 p-4 text-white overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Header Dashboard */}
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="fw-bold m-0 text-white">Laporan & <span style={{ color: '#ef4444' }}>Analitik Bisnis</span></h2>
          <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Monitor performa finansial, volume penjualan, dan kalkulasi target omset BEB Production secara real-time.
          </p>
        </div>

        {/* Ringkasan Indikator Utama (Summary Cards) */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card shadow border-0 rounded-4" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4">
                <small className="text-uppercase fw-bold tracking-wider" style={{ color: '#ef4444', fontSize: '11px' }}>Total Pendapatan Terkumpul</small>
                <h2 className="fw-black mt-2 text-white">
                  Rp{omsetTerkumpul.toLocaleString('id-ID')}
                </h2>
                <div className="progress mt-3 bg-dark" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-danger" 
                    role="progressbar" 
                    style={{ width: `${Math.min((omsetTerkumpul / 15000000) * 100, 100)}%` }}
                  ></div>
                </div>
                <small className="text-muted d-block mt-2 small" style={{ color: '#94a3b8 !important' }}>
                  Progres capaian target bulanan (Target: Rp15.000.000)
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow border-0 rounded-4" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="card-body p-4">
                <small className="text-uppercase fw-bold tracking-wider text-muted" style={{ color: '#94a3b8', fontSize: '11px' }}>Volume Aktivitas Produksi</small>
                <h2 className="fw-black mt-2 text-white">{totalPesanan} Kali Project</h2>
                <div className="mt-3 d-flex align-items-center gap-2">
                  <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">Active Metrics</span>
                  <small style={{ color: '#cbd5e1' }}>Seluruh data berasal murni dari live database Supabase</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Utama */}
        <div className="row">
          <div className="col-11 col-lg-8">
            <div className="card shadow border-0 p-4 rounded-4" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h5 className="fw-bold mb-4 small text-uppercase tracking-wider" style={{ color: '#ef4444' }}>Grafik Perbandingan Omset vs Target</h5>
              <div style={{ height: '320px', position: 'relative' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports;