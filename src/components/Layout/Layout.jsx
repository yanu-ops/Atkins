// src/components/Layout/Layout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">📊</div>
            {sidebarOpen && <h2>POS System</h2>}
          </div>
          <button onClick={toggleSidebar} className="toggle-btn">
            {sidebarOpen ? '◀' : '▶'}
          </button>
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
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`} title="Dashboard">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>

          <Link to="/pos" className={`nav-item ${isActive('/pos')}`} title="POS">
            <span className="nav-icon">🛒</span>
            {sidebarOpen && <span className="nav-text">Point of Sale</span>}
          </Link>

          <Link to="/products" className={`nav-item ${isActive('/products')}`} title="Products">
            <span className="nav-icon">📦</span>
            {sidebarOpen && <span className="nav-text">Products</span>}
          </Link>

          <Link to="/transactions" className={`nav-item ${isActive('/transactions')}`} title="Transactions">
            <span className="nav-icon">📝</span>
            {sidebarOpen && <span className="nav-text">Transactions</span>}
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="nav-divider"></div>
              
              <Link to="/reports" className={`nav-item ${isActive('/reports')}`} title="Reports">
                <span className="nav-icon">📈</span>
                {sidebarOpen && <span className="nav-text">Reports</span>}
              </Link>

              <Link to="/users" className={`nav-item ${isActive('/users')}`} title="Users">
                <span className="nav-icon">👥</span>
                {sidebarOpen && <span className="nav-text">Users</span>}
              </Link>

              <Link to="/settings" className={`nav-item ${isActive('/settings')}`} title="Settings">
                <span className="nav-icon">⚙️</span>
                {sidebarOpen && <span className="nav-text">Settings</span>}
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

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
}