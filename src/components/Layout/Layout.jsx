import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      
      // On mobile, start with sidebar closed
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="mobile-overlay active" 
          onClick={closeSidebarOnMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <img 
                src="/atkins.jpg" 
                alt="POS Logo" 
                style={{ width: '300%', height: '110%', objectFit: 'cover', borderRadius: '12px' }}
              />
            </div>
            {sidebarOpen && (
              <h2 style={{ marginLeft: '30px', whiteSpace: 'nowrap' }}>ATKINS POS</h2>
            )}
          </div>
          {/* Desktop Toggle Button - Inside Sidebar Header */}
          {!isMobile && (
            <button onClick={toggleSidebar} className="toggle-btn">
              {sidebarOpen ? '◀' : '▶'}
            </button>
          )}
        </div>

        <div className="user-info">
          <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
          {sidebarOpen && (
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard')}`} 
            title="Dashboard"
            onClick={closeSidebarOnMobile}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>

          <Link 
            to="/pos" 
            className={`nav-item ${isActive('/pos')}`} 
            title="POS"
            onClick={closeSidebarOnMobile}
          >
            <span className="nav-icon">🛒</span>
            {sidebarOpen && <span className="nav-text">Point of Sale</span>}
          </Link>

          <Link 
            to="/products" 
            className={`nav-item ${isActive('/products')}`} 
            title="Products"
            onClick={closeSidebarOnMobile}
          >
            <span className="nav-icon">📦</span>
            {sidebarOpen && <span className="nav-text">Products</span>}
          </Link>

          <Link 
            to="/transactions" 
            className={`nav-item ${isActive('/transactions')}`} 
            title="Transactions"
            onClick={closeSidebarOnMobile}
          >
            <span className="nav-icon">📄</span>
            {sidebarOpen && <span className="nav-text">Transactions</span>}
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="nav-divider"></div>
              
              <Link 
                to="/reports" 
                className={`nav-item ${isActive('/reports')}`} 
                title="Reports"
                onClick={closeSidebarOnMobile}
              >
                <span className="nav-icon">📈</span>
                {sidebarOpen && <span className="nav-text">Reports</span>}
              </Link>

              <Link 
                to="/users" 
                className={`nav-item ${isActive('/users')}`} 
                title="Users"
                onClick={closeSidebarOnMobile}
              >
                <span className="nav-icon">👥</span>
                {sidebarOpen && <span className="nav-text">Users</span>}
              </Link>

              <Link 
                to="/settings" 
                className={`nav-item ${isActive('/settings')}`} 
                title="Settings"
                onClick={closeSidebarOnMobile}
              >
                <span className="nav-icon">⚙️</span>
                {sidebarOpen && <span className="nav-text">Settings</span>}
              </Link>

              <Link 
                to="/backup" 
                className={`nav-item ${isActive('/backup')}`} 
                title="Backup & Restore"
                onClick={closeSidebarOnMobile}
            >
                <span className="nav-icon">💾</span>
                {sidebarOpen && <span className="nav-text">Backup & Restore</span>}
            </Link>

            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button - Outside Sidebar */}
      {isMobile && (
        <button 
          onClick={toggleSidebar} 
          className="toggle-btn"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
}