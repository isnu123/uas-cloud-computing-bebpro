import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import logoBeb from '../assets/logo-beb.png';

import {
  BsGrid1X2Fill,
  BsBoxes,
  BsClipboardData,
  BsBarChartFill,
  BsRobot,
  BsCalendarCheck,
  BsBoxArrowRight,
  BsPersonCircle,
} from 'react-icons/bs';

function Sidebar({ onLogout }) {
  const location = useLocation();

  // State untuk deteksi ukuran layar HP secara dinamis
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 992 : false);

  const [role, setRole] = useState(
    () => localStorage.getItem('beb_user_role') || 'customer'
  );

  const [name, setName] = useState(
    () => localStorage.getItem('beb_user_name') || 'User'
  );

  useEffect(() => {
    // Handler untuk memantau perubahan ukuran layar
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userRole = user.user_metadata?.role || 'customer';
        const userName = user.user_metadata?.name || 'Pelanggan';

        setRole(userRole);
        setName(userName);

        localStorage.setItem('beb_user_role', userRole);
        localStorage.setItem('beb_user_name', userName);
      }
    };

    checkUserRole();

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleInternalLogout = async () => {
    localStorage.removeItem('beb_user_role');
    localStorage.removeItem('beb_user_name');
    if (onLogout) onLogout();
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard', // Diperpendek sedikit untuk teks mobile agar rapi
      icon: <BsGrid1X2Fill size={18} />,
      roles: ['admin', 'customer'],
    },
    {
      path: '/dashboard/inventory',
      name: 'Inventori',
      icon: <BsBoxes size={18} />,
      roles: ['admin'],
    },
    {
      path: '/dashboard/orders',
      name: 'Pesanan',
      icon: <BsClipboardData size={18} />,
      roles: ['admin'],
    },
    {
      path: '/dashboard/reports',
      name: 'Laporan',
      icon: <BsBarChartFill size={18} />,
      roles: ['admin'],
    },
    {
      path: '/dashboard/settings',
      name: 'Bot AI',
      icon: <BsRobot size={18} />,
      roles: ['admin'],
    },
    {
      path: '/ai-recommendation',
      name: 'Rekomendasi Ai',
      icon: <BsRobot size={18} />,
      roles: ['customer'],
    },
    {
      path: '/booking',
      name: 'Booking',
      icon: <BsCalendarCheck size={18} />,
      roles: ['admin', 'customer'],
    },
    {
      path: '/my-bookings',
      name: 'Riwayat',
      icon: <BsClipboardData size={18} />,
      roles: ['customer'], // ---> PERUBAHAN: 'admin' sudah dihapus dari array ini
    },
  ];

  const allowedMenus = menuItems.filter((item) => item.roles.includes(role));

  // --- RENDERING TAMPILAN HP (MOBILE BOTTOM & TOP NAVIGATION) ---
  if (isMobile) {
    return (
      <>
        {/* Top Mini Header di HP */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1030,
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoBeb} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontWeight: '800', fontSize: '13px', color: '#ffffff', letterSpacing: '0.5px' }}>
              <span style={{ color: '#ef4444' }}>BEB</span> PORTAL
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Hi, {name.split(' ')[0]}</span>
            <button
              onClick={handleInternalLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Keluar"
            >
              <BsBoxArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Menu Navigation di HP */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: '#0f172a',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            zIndex: 1030,
            borderTop: '1px solid #1e293b',
            padding: '0 4px',
          }}
        >
          {allowedMenus.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  minWidth: 0,
                  gap: '4px',
                  textDecoration: 'none',
                  color: active ? '#ef4444' : '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '600',
                  transition: 'color 0.2s ease',
                }}
              >
                <div style={{ transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>
                  {item.icon}
                </div>
                <span style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  maxWidth: '70px'
                }}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Spacer CSS tambahan untuk mencegah layout content utama tertabrak top/bottom bar */}
        <style>{`
          body { 
            padding-top: 56px !important; 
            padding-bottom: 64px !important; 
          }
        `}</style>
      </>
    );
  }

  // --- RENDERING TAMPILAN DESKTOP ASLI (TIDAK BERUBAH) ---
  return (
    <div
      style={{
        width: '260px',
        background: '#0f172a',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxShadow: '4px 0 25px rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid #1e293b',
          gap: '10px',
        }}
      >
        <img
          src={logoBeb}
          alt="Logo BEB Production"
          style={{ width: '38px', height: '38px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
          <h4
            style={{
              fontWeight: '800',
              fontSize: '15px',
              letterSpacing: '0.5px',
              color: '#ffffff',
              margin: 0,
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#ef4444' }}>BEB</span> PRODUCTION
          </h4>
          <small
            style={{
              color: '#64748b',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginTop: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            Portal {role === 'admin' ? 'Admin' : 'Pelanggan'}
          </small>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexGrow: 1,
        }}
      >
        {allowedMenus.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                background: active ? '#ef4444' : 'transparent',
                color: active ? '#ffffff' : '#94a3b8',
                boxShadow: active ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BsPersonCircle size={22} color="white" />
          </div>

          <div style={{ marginLeft: '12px', overflow: 'hidden', textAlign: 'left' }}>
            <div
              style={{
                fontWeight: '600',
                fontSize: '13px',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
            <small
              style={{
                color: '#64748b',
                fontSize: '11px',
                textTransform: 'capitalize',
                display: 'block',
              }}
            >
              {role}
            </small>
          </div>
        </div>

        <button
          onClick={handleInternalLogout}
          className="btn w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
          style={{
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '10px',
            fontWeight: '600',
            padding: '10px',
            fontSize: '13px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <BsBoxArrowRight size={16} />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;