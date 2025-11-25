// src/components/Transactions/TransactionList.jsx - With Reprint
import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Receipt from '../POS/Receipt';
import './TransactionList.css';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const result = await api.transactions.getAll();
    if (result.success) {
      setTransactions(result.data);
    }
    setLoading(false);
  };

  const viewDetails = async (transactionId) => {
    const result = await api.transactions.getById(transactionId);
    if (result.success) {
      setSelectedTransaction(result.data);
      setShowDetails(true);
    }
  };

  const handlePrintReceipt = async (transactionId) => {
    const result = await api.transactions.getById(transactionId);
    
    if (result.success) {
      const receipt = {
        transaction_number: result.data.transaction_number,
        date: result.data.created_at,
        cashier: result.data.cashier_name,
        items: result.data.items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price_each,
          subtotal: item.subtotal
        })),
        total_amount: result.data.total_amount,
        payment_type: result.data.payment_type,
        amount_paid: result.data.amount_paid,
        change: result.data.change_amount,
        notes: result.data.notes
      };

      setReceiptData(receipt);
      setShowReceipt(true);
      setShowDetails(false);
    } else {
      alert('Failed to load receipt: ' + result.error);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Show receipt if requested
  if (showReceipt && receiptData) {
    return <Receipt receipt={receiptData} onNewTransaction={handleCloseReceipt} />;
  }

  return (
    <div className="transactions-container">
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p>{transactions.length} total transactions</p>
        </div>
        <button onClick={loadTransactions} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      <div className="transactions-table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Transaction #</th>
              <th>Date & Time</th>
              <th>Cashier</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td><strong>{tx.transaction_number}</strong></td>
                <td>{formatDateTime(tx.created_at)}</td>
                <td>{tx.cashier_name}</td>
                <td>
                  <span className={`badge badge-${tx.payment_type}`}>
                    {tx.payment_type.toUpperCase()}
                  </span>
                </td>
                <td><strong>{formatCurrency(tx.total_amount)}</strong></td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => viewDetails(tx.id)}
                      className="btn btn-sm btn-secondary"
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handlePrintReceipt(tx.id)}
                      className="btn btn-sm btn-primary"
                      title="Print Receipt"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button onClick={() => setShowDetails(false)} className="close-btn">✕</button>
            </div>

            <div className="transaction-details">
              <div className="detail-section">
                <h3>Transaction Information</h3>
                <div className="detail-grid">
                  <div>
                    <span className="label">Transaction #</span>
                    <strong>{selectedTransaction.transaction_number}</strong>
                  </div>
                  <div>
                    <span className="label">Date & Time</span>
                    <span>{formatDateTime(selectedTransaction.created_at)}</span>
                  </div>
                  <div>
                    <span className="label">Cashier</span>
                    <span>{selectedTransaction.cashier_name}</span>
                  </div>
                  <div>
                    <span className="label">Payment Method</span>
                    <span className={`badge badge-${selectedTransaction.payment_type}`}>
                      {selectedTransaction.payment_type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Items Purchased</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.items?.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.product_name}</strong></td>
                        <td>{formatCurrency(item.price_each)}</td>
                        <td><span className="qty-badge">{item.quantity}</span></td>
                        <td><strong>{formatCurrency(item.subtotal)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-section totals-section">
                <div className="total-row">
                  <span>Total Amount:</span>
                  <strong>{formatCurrency(selectedTransaction.total_amount)}</strong>
                </div>
                <div className="total-row">
                  <span>Amount Paid:</span>
                  <strong>{formatCurrency(selectedTransaction.amount_paid)}</strong>
                </div>
                <div className="total-row change-row">
                  <span>Change:</span>
                  <strong>{formatCurrency(selectedTransaction.change_amount)}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => handlePrintReceipt(selectedTransaction.id)}
                  className="btn btn-primary"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}