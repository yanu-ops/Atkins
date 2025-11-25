// src/components/Settings/Settings.jsx
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
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + result.error);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure store settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3>Store Information</h3>
          
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({...settings, store_name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Store Address</label>
            <textarea
              value={settings.store_address}
              onChange={(e) => setSettings({...settings, store_address: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={settings.store_phone}
                onChange={(e) => setSettings({...settings, store_phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={settings.store_email}
                onChange={(e) => setSettings({...settings, store_email: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Settings</h3>
          
          <div className="form-group">
            <label>Default Low Stock Threshold</label>
            <input
              type="number"
              value={settings.default_low_stock_threshold}
              onChange={(e) => setSettings({...settings, default_low_stock_threshold: parseInt(e.target.value)})}
              min="1"
            />
            <small>Alert when products reach this quantity</small>
          </div>

          <div className="form-group">
            <label>Receipt Footer Text</label>
            <textarea
              value={settings.receipt_footer}
              onChange={(e) => setSettings({...settings, receipt_footer: e.target.value})}
              rows="2"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}