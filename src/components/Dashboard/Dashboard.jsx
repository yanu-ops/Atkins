// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/apiService';
import { formatCurrency } from '../../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Load dashboard stats
    const statsResult = await api.reports.getDashboardStats();
    if (statsResult.success) {
      setStats(statsResult.data);
    }

    // Load low stock products
    const lowStockResult = await api.products.getLowStock();
    if (lowStockResult.success) {
      setLowStock(lowStockResult.data);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your POS system</p>
        </div>
        <button onClick={loadDashboardData} className="btn btn-light">
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">💰</div>
          <div className="stat-details">
            <p className="stat-label">Today's Sales</p>
            <h3 className="stat-value">{formatCurrency(stats?.today_sales || 0)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">🛒</div>
          <div className="stat-details">
            <p className="stat-label">Today's Transactions</p>
            <h3 className="stat-value">{stats?.today_transactions || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">📦</div>
          <div className="stat-details">
            <p className="stat-label">Total Products</p>
            <h3 className="stat-value">{stats?.total_products || 0}</h3>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-details">
            <p className="stat-label">Low Stock Items</p>
            <h3 className="stat-value">{stats?.low_stock_count || 0}</h3>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="stats-grid-secondary">
        <div className="stat-card-small">
          <p className="stat-label">This Week</p>
          <h4 className="stat-value">{formatCurrency(stats?.week_sales || 0)}</h4>
        </div>

        <div className="stat-card-small">
          <p className="stat-label">This Month</p>
          <h4 className="stat-value">{formatCurrency(stats?.month_sales || 0)}</h4>
        </div>

        <div className="stat-card-small">
          <p className="stat-label">Out of Stock</p>
          <h4 className="stat-value danger">{stats?.out_of_stock_count || 0}</h4>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>⚠️ Low Stock Alert</h2>
              <p>Products that need restocking</p>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              Manage Products
            </Link>
          </div>

          <div className="low-stock-list">
            {lowStock.slice(0, 5).map((product) => (
              <div key={product.product_id} className="low-stock-item">
                <div className="product-info">
                  <strong>{product.product_name}</strong>
                  <span className="category-badge">{product.category}</span>
                </div>
                <div className="stock-info">
                  <span className="current-stock">
                    Current: <strong>{product.current_stock}</strong>
                  </span>
                  <span className="needed">
                    Need: <strong>{product.stock_difference}</strong> more
                  </span>
                </div>
              </div>
            ))}
          </div>

          {lowStock.length > 5 && (
            <p className="section-footer">
              +{lowStock.length - 5} more items need restocking
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        
        <div className="action-grid">
          <Link to="/pos" className="action-card">
            <div className="action-icon">🛒</div>
            <h3>New Sale</h3>
            <p>Start a new transaction</p>
          </Link>

          <Link to="/products" className="action-card">
            <div className="action-icon">📦</div>
            <h3>Products</h3>
            <p>Manage inventory</p>
          </Link>

          <Link to="/transactions" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Transactions</h3>
            <p>View sales history</p>
          </Link>

          <Link to="/reports" className="action-card">
            <div className="action-icon">📈</div>
            <h3>Reports</h3>
            <p>View analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}