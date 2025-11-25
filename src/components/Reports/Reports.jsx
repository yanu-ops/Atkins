// src/components/Reports/Reports.jsx
import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Reports.css';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);

    // Load sales summary
    const statsResult = await api.reports.getSalesSummary(
      dateRange.start,
      dateRange.end
    );
    if (statsResult.success) {
      setStats(statsResult.data);
    }

    // Load top products
    const topResult = await api.reports.getTopProducts(10, dateRange.start, dateRange.end);
    if (topResult.success) {
      setTopProducts(topResult.data);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-container">
      <div className="page-header">
        <div>
          <h1>Sales Reports</h1>
          <p>Analytics and insights for Atkins Guitar Store</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="filters-card">
        <h3>Date Range</h3>
        <div className="date-inputs">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button onClick={loadReports} className="btn btn-primary">
            Apply
          </button>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="stats-grid">
        <div className="stat-card-report">
          <div className="stat-icon">💰</div>
          <div>
            <span className="stat-label">Total Sales</span>
            <h2>{formatCurrency(stats?.total_sales || 0)}</h2>
          </div>
        </div>

        <div className="stat-card-report">
          <div className="stat-icon">🛒</div>
          <div>
            <span className="stat-label">Transactions</span>
            <h2>{stats?.transaction_count || 0}</h2>
          </div>
        </div>

        <div className="stat-card-report">
          <div className="stat-icon">📊</div>
          <div>
            <span className="stat-label">Average Sale</span>
            <h2>{formatCurrency(stats?.average_sale || 0)}</h2>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="section-card">
        <h3>Payment Methods Breakdown</h3>
        <div className="payment-grid">
          <div className="payment-card">
            <span>Cash</span>
            <strong>{formatCurrency(stats?.cash_sales || 0)}</strong>
          </div>
          <div className="payment-card">
            <span>GCash</span>
            <strong>{formatCurrency(stats?.gcash_sales || 0)}</strong>
          </div>
          <div className="payment-card">
            <span>Card</span>
            <strong>{formatCurrency(stats?.card_sales || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="section-card">
        <h3>Top Selling Products</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={product.product_id}>
                <td><strong>#{index + 1}</strong></td>
                <td><strong>{product.product_name}</strong></td>
                <td>{product.category}</td>
                <td><span className="qty-badge">{product.total_quantity_sold}</span></td>
                <td><strong>{formatCurrency(product.total_revenue)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}