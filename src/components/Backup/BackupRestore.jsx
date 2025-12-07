import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import { formatDateTime } from '../../utils/formatters';
import './BackupRestore.css';

export default function BackupRestore() {
  const [backupStats, setBackupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);

  useEffect(() => {
    loadBackupStats();
    loadBackupHistory();
  }, []);

  const loadBackupStats = async () => {
    const result = await api.backup.getBackupStats();
    if (result.success) {
      setBackupStats(result.data);
    }
    setLoading(false);
  };

  const loadBackupHistory = () => {
    const history = JSON.parse(localStorage.getItem('backup_history') || '[]');
    setBackupHistory(history);
  };

  const saveBackupToHistory = (filename, stats) => {
    const newBackup = {
      id: Date.now(),
      filename,
      date: new Date().toISOString(),
      stats: stats
    };

    const history = JSON.parse(localStorage.getItem('backup_history') || '[]');
    history.unshift(newBackup);
    
    const trimmedHistory = history.slice(0, 10);
    localStorage.setItem('backup_history', JSON.stringify(trimmedHistory));
    setBackupHistory(trimmedHistory);
  };

  const handleExportBackup = async () => {
    if (!confirm('Export complete database backup?\n\nThis will download all your data as a JSON file.')) {
      return;
    }

    setExporting(true);

    try {
      const result = await api.backup.exportBackup();
      
      if (result.success) {
        alert(`✅ Backup exported successfully!\n\nFile: ${result.filename}\n\nSave this file in a secure location.`);
        saveBackupToHistory(result.filename, backupStats);
        loadBackupHistory();
      } else {
        alert('❌ Failed to export backup:\n\n' + result.error);
      }
    } catch (error) {
      alert('❌ Export failed:\n\n' + error.message);
    }

    setExporting(false);
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('❌ Invalid file type!\n\nPlease select a JSON backup file.');
      return;
    }

    const confirmRestore = confirm(
      '⚠️ RESTORE DATABASE FROM BACKUP?\n\n' +
      `File: ${file.name}\n\n` +
      'This will:\n' +
      '• Replace ALL current data\n' +
      '• Cannot be undone\n' +
      '• Create automatic backup of current data first\n\n' +
      'Are you ABSOLUTELY sure?'
    );

    if (!confirmRestore) {
      event.target.value = '';
      return;
    }

    const doubleConfirm = confirm(
      '⚠️ FINAL CONFIRMATION\n\n' +
      'This is your last chance to cancel.\n\n' +
      'Click OK to proceed with restore.'
    );

    if (!doubleConfirm) {
      event.target.value = '';
      return;
    }

    setRestoring(true);

    try {
      await api.backup.exportBackup();

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          if (!backupData.version || !backupData.backup_date) {
            throw new Error('Invalid backup file format');
          }

          const result = await api.backup.restoreBackup(backupData);
          
          if (result.success) {
            alert(
              '✅ BACKUP RESTORED SUCCESSFULLY!\n\n' +
              `Restored from: ${file.name}\n` +
              `Original backup date: ${formatDateTime(backupData.backup_date)}\n\n` +
              'The page will reload now.'
            );
            
            window.location.reload();
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          alert('❌ Restore failed:\n\n' + error.message);
        } finally {
          setRestoring(false);
          event.target.value = '';
        }
      };

      reader.onerror = () => {
        alert('❌ Failed to read backup file');
        setRestoring(false);
        event.target.value = '';
      };

      reader.readAsText(file);
    } catch (error) {
      alert('❌ Restore failed:\n\n' + error.message);
      setRestoring(false);
      event.target.value = '';
    }
  };

  const handleAutoBackup = async () => {
    const result = await api.backup.exportBackup();
    if (result.success) {
      saveBackupToHistory(result.filename, backupStats);
      return true;
    }
    return false;
  };

  const handleExportCSV = async (type) => {
    setExporting(true);
    
    try {
      let result;
      switch (type) {
        case 'sales':
          result = await api.export.exportSalesReport();
          break;
        case 'products':
          result = await api.export.exportProducts();
          break;
        case 'inventory':
          result = await api.export.exportInventory();
          break;
        default:
          return;
      }

      if (result.success) {
        alert(`✅ Exported successfully!\n\nFile: ${result.filename}\nRecords: ${result.recordCount}`);
      } else {
        alert('❌ Export failed:\n\n' + result.error);
      }
    } catch (error) {
      alert('❌ Export failed:\n\n' + error.message);
    }

    setExporting(false);
  };

  if (loading) {
    return <div className="loading">Loading backup information...</div>;
  }

  return (
    <div className="backup-container">
      <div className="page-header">
        <div>
          <h1>💾 Backup & Restore</h1>
          <p>Protect your data with regular backups</p>
        </div>
      </div>

      <div className="backup-stats-grid">
        <div className="stat-card-backup">
          <div className="stat-icon-backup">📦</div>
          <div className="stat-details-backup">
            <span className="stat-label-backup">Total Products</span>
            <strong className="stat-value-backup">{backupStats?.total_products || 0}</strong>
          </div>
        </div>

        <div className="stat-card-backup">
          <div className="stat-icon-backup">📄</div>
          <div className="stat-details-backup">
            <span className="stat-label-backup">Transactions</span>
            <strong className="stat-value-backup">{backupStats?.total_transactions || 0}</strong>
          </div>
        </div>

        <div className="stat-card-backup">
          <div className="stat-icon-backup">👥</div>
          <div className="stat-details-backup">
            <span className="stat-label-backup">Users</span>
            <strong className="stat-value-backup">{backupStats?.total_users || 0}</strong>
          </div>
        </div>

        <div className="stat-card-backup">
          <div className="stat-icon-backup">💰</div>
          <div className="stat-details-backup">
            <span className="stat-label-backup">Total Revenue</span>
            <strong className="stat-value-backup">₱{backupStats?.total_revenue?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header-backup">
          <div>
            <h2>🗄️ Full Database Backup</h2>
            <p>Export or restore complete database</p>
          </div>
        </div>

        <div className="backup-actions-grid">
          <div className="backup-action-card">
            <div className="action-icon">📤</div>
            <h3>Export Backup</h3>
            <p>Download complete database as JSON file. Includes all products, transactions, users, and settings.</p>
            <button 
              onClick={handleExportBackup} 
              className="btn btn-primary btn-block"
              disabled={exporting || restoring}
            >
              {exporting ? 'Exporting...' : '📥 Export Database'}
            </button>
          </div>

          <div className="backup-action-card">
            <div className="action-icon">📥</div>
            <h3>Import Backup</h3>
            <p>Restore database from a backup file. Current data will be backed up first automatically.</p>
            <label className="btn btn-secondary btn-block file-input-label">
              {restoring ? 'Restoring...' : '📤 Import Backup'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={exporting || restoring}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="backup-warning">
          <strong>⚠️ Important:</strong> Store backup files in a secure location. Keep multiple backups in different locations (cloud storage, external drive, etc.).
        </div>
      </div>

      <div className="section-card">
        <div className="section-header-backup">
          <div>
            <h2>📊 Export Reports (CSV)</h2>
            <p>Export specific data for Excel or Google Sheets</p>
          </div>
        </div>

        <div className="export-grid">
          <div className="export-card">
            <div className="export-icon">📈</div>
            <h3>Sales Report</h3>
            <p>All transactions with details</p>
            <button 
              onClick={() => handleExportCSV('sales')} 
              className="btn btn-secondary btn-sm"
              disabled={exporting}
            >
              Export CSV
            </button>
          </div>

          <div className="export-card">
            <div className="export-icon">📦</div>
            <h3>Products List</h3>
            <p>Complete product catalog</p>
            <button 
              onClick={() => handleExportCSV('products')} 
              className="btn btn-secondary btn-sm"
              disabled={exporting}
            >
              Export CSV
            </button>
          </div>

          <div className="export-card">
            <div className="export-icon">📋</div>
            <h3>Inventory Report</h3>
            <p>Stock levels and values</p>
            <button 
              onClick={() => handleExportCSV('inventory')} 
              className="btn btn-secondary btn-sm"
              disabled={exporting}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header-backup">
          <div>
            <h2>📜 Recent Backups</h2>
            <p>Last 10 backup operations</p>
          </div>
        </div>

        {backupHistory.length === 0 ? (
          <div className="no-backups">
            <p>📂 No backups yet</p>
            <small>Create your first backup using the export button above</small>
          </div>
        ) : (
          <div className="backup-history-list">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="backup-history-item">
                <div className="backup-info">
                  <div className="backup-icon">💾</div>
                  <div className="backup-details">
                    <strong>{backup.filename}</strong>
                    <small>{formatDateTime(backup.date)}</small>
                  </div>
                </div>
                <div className="backup-stats-small">
                  <span>{backup.stats?.total_products || 0} products</span>
                  <span>•</span>
                  <span>{backup.stats?.total_transactions || 0} transactions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-card backup-tips">
        <h3>💡 Backup Best Practices</h3>
        <ul>
          <li><strong>Daily Backups:</strong> Export database at end of each business day</li>
          <li><strong>Multiple Locations:</strong> Store backups in different places (cloud, USB, email)</li>
          <li><strong>Test Restores:</strong> Periodically test backup files to ensure they work</li>
          <li><strong>Before Updates:</strong> Always backup before making major changes</li>
          <li><strong>Keep 3 Copies:</strong> Original data + 2 backups in different locations</li>
          <li><strong>Secure Storage:</strong> Protect backup files with passwords or encryption</li>
        </ul>
      </div>
    </div>
  );
}