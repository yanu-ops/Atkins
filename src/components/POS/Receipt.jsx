import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './Receipt.css';

export default function Receipt({ receipt, onNewTransaction }) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [printSize, setPrintSize] = useState('80mm'); 

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await api.settings.get();
    if (result.success) {
      setSettings(result.data);
    } else {
      setSettings({
        store_name: 'Atkins Guitar Store',
        store_address: '123 Main Street, City',
        store_phone: '(123) 456-7890',
        store_email: 'info@atkinsguitar.com',
        receipt_footer: 'Thank you for your purchase!'
      });
    }
    setLoadingSettings(false);
  };

  const handlePrint = () => {
    document.body.setAttribute('data-print-size', printSize);
    
    window.focus();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  if (loadingSettings) {
    return (
      <div className="receipt-container">
        <div className="loading">Loading receipt...</div>
      </div>
    );
  }

  return (
    <div className="receipt-container">
      <div className="print-options no-print">
        <div className="print-size-selector">
          <label>Print Size:</label>
          <div className="size-buttons">
            <button
              className={`size-btn ${printSize === '80mm' ? 'active' : ''}`}
              onClick={() => setPrintSize('80mm')}
            >
              <span className="size-icon">📄</span>
              <div className="size-info">
                <strong>80mm Thermal</strong>
                <small>Receipt Printer</small>
              </div>
            </button>
            <button
              className={`size-btn ${printSize === 'A4' ? 'active' : ''}`}
              onClick={() => setPrintSize('A4')}
            >
              <span className="size-icon">📋</span>
              <div className="size-info">
                <strong>A4 Paper</strong>
                <small>Standard Printer</small>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className={`receipt-paper ${printSize === 'A4' ? 'receipt-a4' : ''}`} id="receipt">
        <div className="receipt-header">
          <h1>{settings?.store_name?.toUpperCase() || 'ATKINS GUITAR STORE'}</h1>
          {settings?.store_address && (
            <p>{settings.store_address}</p>
          )}
          {settings?.store_phone && (
            <p>Tel: {settings.store_phone}</p>
          )}
          {settings?.store_email && (
            <p>{settings.store_email}</p>
          )}
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-info">
          <div className="info-row">
            <span>TXN #:</span>
            <strong>{receipt.transaction_number}</strong>
          </div>
          <div className="info-row">
            <span>Date:</span>
            <span>{formatDateTime(receipt.date)}</span>
          </div>
          <div className="info-row">
            <span>Cashier:</span>
            <span>{receipt.cashier}</span>
          </div>
          <div className="info-row">
            <span>Payment:</span>
            <strong>{receipt.payment_type.toUpperCase()}</strong>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-items">
          <table>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="right">Qty</th>
                <th align="right">Price</th>
                <th align="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td align="right">{item.quantity}</td>
                  <td align="right">{formatCurrency(item.price)}</td>
                  <td align="right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <strong>{formatCurrency(receipt.total_amount)}</strong>
          </div>
          <div className="total-row total-main">
            <span>TOTAL:</span>
            <strong>{formatCurrency(receipt.total_amount)}</strong>
          </div>
          <div className="total-row">
            <span>Paid ({receipt.payment_type}):</span>
            <strong>{formatCurrency(receipt.amount_paid)}</strong>
          </div>
          <div className="total-row change">
            <span>CHANGE:</span>
            <strong>{formatCurrency(receipt.change)}</strong>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-footer">
          <p className="thank-you">
            {settings?.receipt_footer || 'Thank You!'}
          </p>
          <p>Please Come Again</p>
          <p>---</p>
          {settings?.store_phone && (
            <p>For inquiries: {settings.store_phone}</p>
          )}
          
          {receipt.notes && (
            <p className="receipt-notes">Note: {receipt.notes}</p>
          )}
        </div>

        <div className="receipt-barcode">
          <p>* {receipt.transaction_number} *</p>
        </div>
      </div>

      <div className="receipt-actions no-print">
        <button onClick={handlePrint} className="btn btn-print">
          🖨️ Print Receipt
        </button>
        <button onClick={onNewTransaction} className="btn btn-new-transaction">
          ✓ New Transaction
        </button>
      </div>
    </div>
  );
}