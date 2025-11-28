import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    store_name: 'Atkins Guitar Store',
    store_address: '',
    store_phone: '',
    store_email: '',
    default_low_stock_threshold: 5,
    receipt_footer: 'Thank you for your purchase!'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await api.settings.get();
    if (result.success) {
      setSettings(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const result = await api.settings.update(settings);
    
    setSaving(false);

    if (result.success) {
      alert('✅ Settings saved successfully!\n\nThese changes will appear on all future receipts.');
    } else {
      alert('❌ Failed to save settings:\n\n' + result.error);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure store information and receipt details</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-form-container">
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-section">
              <h3>📋 Store Information</h3>
              <p className="section-description">
                This information will appear on all printed receipts
              </p>
              
              <div className="form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => setSettings({...settings, store_name: e.target.value})}
                  required
                  placeholder="e.g., Atkins Guitar Store"
                />
                <small>Appears at the top of receipts</small>
              </div>

              <div className="form-group">
                <label>Store Address</label>
                <textarea
                  value={settings.store_address}
                  onChange={(e) => setSettings({...settings, store_address: e.target.value})}
                  rows="2"
                  placeholder="e.g., 123 Main Street, City, State, ZIP"
                />
                <small>Full address shown on receipts</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={settings.store_phone}
                    onChange={(e) => setSettings({...settings, store_phone: e.target.value})}
                    placeholder="(123) 456-7890"
                  />
                  <small>Contact number on receipts</small>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => setSettings({...settings, store_email: e.target.value})}
                    placeholder="info@store.com"
                  />
                  <small>Email shown on receipts</small>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>🧾 Receipt Settings</h3>
              <p className="section-description">
                Customize what appears on customer receipts
              </p>
              
              <div className="form-group">
                <label>Receipt Footer Message</label>
                <textarea
                  value={settings.receipt_footer}
                  onChange={(e) => setSettings({...settings, receipt_footer: e.target.value})}
                  rows="2"
                  placeholder="e.g., Thank you for your purchase!"
                />
                <small>Message at the bottom of receipts</small>
              </div>
            </div>

            <div className="settings-section">
              <h3>⚙️ System Settings</h3>
              
              <div className="form-group">
                <label>Default Low Stock Threshold</label>
                <input
                  type="number"
                  value={settings.default_low_stock_threshold}
                  onChange={(e) => setSettings({...settings, default_low_stock_threshold: parseInt(e.target.value)})}
                  min="1"
                  placeholder="5"
                />
                <small>Alert when products reach this quantity</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={loadSettings} 
                className="btn btn-secondary"
                disabled={saving}
              >
                Reset Changes
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="receipt-preview-container">
          <div className="preview-header">
            <h3>📄 Receipt Preview</h3>
            <p>Live preview of how your receipt will look</p>
          </div>
          
          <div className="receipt-preview">
            <div className="preview-receipt-paper">
              <div className="preview-receipt-header">
                <h4>{settings.store_name || 'STORE NAME'}</h4>
                {settings.store_address && (
                  <p>{settings.store_address}</p>
                )}
                {settings.store_phone && (
                  <p>Tel: {settings.store_phone}</p>
                )}
                {settings.store_email && (
                  <p>{settings.store_email}</p>
                )}
              </div>

              <div className="preview-divider"></div>

              <div className="preview-info">
                <p><strong>TXN #:</strong> TXN-20250128-0001</p>
                <p><strong>Date:</strong> Jan 28, 2025 2:30 PM</p>
                <p><strong>Cashier:</strong> Admin</p>
                <p><strong>Payment:</strong> CASH</p>
              </div>

              <div className="preview-divider"></div>

              <div className="preview-items">
                <p><strong>Sample Item 1</strong></p>
                <p className="preview-item-detail">2 × ₱500.00 = ₱1,000.00</p>
                <p><strong>Sample Item 2</strong></p>
                <p className="preview-item-detail">1 × ₱300.00 = ₱300.00</p>
              </div>

              <div className="preview-divider"></div>

              <div className="preview-totals">
                <p><strong>TOTAL: ₱1,300.00</strong></p>
                <p>Paid: ₱1,500.00</p>
                <p className="preview-change"><strong>CHANGE: ₱200.00</strong></p>
              </div>

              <div className="preview-divider"></div>

              <div className="preview-footer">
                <p className="preview-thank-you">
                  {settings.receipt_footer || 'Thank you for your purchase!'}
                </p>
                <p>Please Come Again</p>
                {settings.store_phone && (
                  <p>For inquiries: {settings.store_phone}</p>
                )}
              </div>

              <div className="preview-barcode">
                <p>* TXN-20250128-0001 *</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}