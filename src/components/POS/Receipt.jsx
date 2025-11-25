// src/components/POS/Receipt.jsx - Enhanced for Printing
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './Receipt.css';

export default function Receipt({ receipt, onNewTransaction }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container">
      <div className="receipt-paper" id="receipt">
        {/* Store Header */}
        <div className="receipt-header">
          <h1>🎸 Atkins Guitar Store</h1>
          <p>123 Main Street, City</p>
          <p>Contact: (123) 456-7890</p>
          <p>Email: info@atkinsguitar.com</p>
        </div>

        <div className="receipt-divider"></div>

        {/* Transaction Info */}
        <div className="receipt-info">
          <div className="info-row">
            <span>Transaction #:</span>
            <strong>{receipt.transaction_number}</strong>
          </div>
          <div className="info-row">
            <span>Date & Time:</span>
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

        {/* Items Table */}
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

        {/* Totals */}
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
            <span>Amount Paid:</span>
            <strong>{formatCurrency(receipt.amount_paid)}</strong>
          </div>
          <div className="total-row change">
            <span>CHANGE:</span>
            <strong>{formatCurrency(receipt.change)}</strong>
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* Footer */}
        <div className="receipt-footer">
          <p className="thank-you">Thank you for your purchase!</p>
          <p>Please come again</p>
          <p>---</p>
          <p>For inquiries and support:</p>
          <p>Visit us or call (123) 456-7890</p>
          
          {receipt.notes && (
            <p className="receipt-notes">Note: {receipt.notes}</p>
          )}
        </div>

        {/* Barcode/Transaction Number */}
        <div className="receipt-barcode">
          <p>* {receipt.transaction_number} *</p>
        </div>
      </div>

      {/* Action Buttons - Hidden when printing */}
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