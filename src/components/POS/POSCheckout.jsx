import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import api from '../../services/apiService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Receipt from './Receipt';
import './POSCheckout.css';

export default function POSCheckout() {
  const { products, reload: reloadProducts } = useProducts(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentType, setPaymentType] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);


  const categories = useMemo(() => {
    const categorySet = new Set(
      products
        .filter(p => p.category)
        .map(p => p.category)
    );
    return ['all', ...Array.from(categorySet).sort()];
  }, [products]);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    const result = await api.transactions.getAll(5);
    if (result.success) {
      setRecentTransactions(result.data);
    }
  };


  const categoryFiltered = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);


  const filtered = categoryFiltered.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );


  const getCategoryCount = (category) => {
    if (category === 'all') return products.length;
    return products.filter(p => p.category === category).length;
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Only ${product.stock} items available!`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock < 1) {
        alert('Product is out of stock!');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    const product = products.find(p => p.id === id);
    if (qty < 1) {
      setCart(cart.filter(item => item.id !== id));
    } else if (qty > product.stock) {
      alert(`Only ${product.stock} items available!`);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = parseFloat(amountPaid) - total;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) < total) {
      alert('Please enter valid payment amount!');
      return;
    }

    setProcessing(true);
    const result = await api.transactions.checkout({
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      paymentType,
      amountPaid: parseFloat(amountPaid)
    });

    setProcessing(false);

    if (result.success) {
      const transactionDetails = await api.transactions.getById(result.data.transaction_id);
      
      if (transactionDetails.success) {
        const receipt = {
          transaction_number: transactionDetails.data.transaction_number,
          date: transactionDetails.data.created_at,
          cashier: transactionDetails.data.cashier_name,
          items: transactionDetails.data.items.map(item => ({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price_each,
            subtotal: item.subtotal
          })),
          total_amount: transactionDetails.data.total_amount,
          payment_type: transactionDetails.data.payment_type,
          amount_paid: transactionDetails.data.amount_paid,
          change: transactionDetails.data.change_amount,
          notes: transactionDetails.data.notes
        };

        setReceiptData(receipt);
        setShowReceipt(true);
      }

      setCart([]);
      setAmountPaid('');
      await reloadProducts();
      loadRecentTransactions();
    } else {
      alert('Checkout failed: ' + result.error);
    }
  };

  const handleNewTransaction = async () => {
    setShowReceipt(false);
    setReceiptData(null);
    await reloadProducts();
  };

  const handleReprintReceipt = async (transactionId) => {
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
    } else {
      alert('Failed to load receipt: ' + result.error);
    }
  };

  if (showReceipt && receiptData) {
    return <Receipt receipt={receiptData} onNewTransaction={handleNewTransaction} />;
  }

  return (
    <div className="pos-container">
      <div className="pos-products">
        <div className="pos-header">
          <h2>Products ({filtered.length})</h2>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="pos-category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`pos-category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '📦 All' : category}
              <span className="pos-category-count">{getCategoryCount(category)}</span>
            </button>
          ))}
        </div>
        
        <div className="products-grid">
          {filtered.length === 0 ? (
            <div className="no-products-found">
              <p>🔍 No products found</p>
              {(search || selectedCategory !== 'all') && (
                <div className="clear-filters">
                  {search && (
                    <button onClick={() => setSearch('')} className="btn btn-sm btn-secondary">
                      Clear Search
                    </button>
                  )}
                  {selectedCategory !== 'all' && (
                    <button onClick={() => setSelectedCategory('all')} className="btn btn-sm btn-secondary">
                      Show All Categories
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                className="product-card-pos"
                onClick={() => addToCart(product)}
              >
                <div className="product-image-pos">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-placeholder">🎸</div>
                  )}
                </div>
                <div className="product-info-pos">
                  <strong>{product.name}</strong>
                  <span className="product-brand-pos">{product.brand}</span>
                  <div className="product-footer-pos">
                    <span className="price-pos">{formatCurrency(product.price)}</span>
                    <span className={`stock-badge-pos ${product.stock < 5 ? 'low' : ''}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pos-cart">
        <h2>Cart ({cart.length})</h2>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>🛒</p>
              <p>Cart is empty</p>
              <small>Click on products to add</small>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="cart-placeholder">🎸</div>
                  )}
                </div>
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>{formatCurrency(item.price)}</span>
                </div>
                <div className="cart-controls">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn">✕</button>
                </div>
                <div className="cart-item-total">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-bottom-section">
          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="total-row">
                <span>Subtotal:</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="total-row main">
                <span>TOTAL:</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
          )}

          <div className="payment-section">
            <label>Payment Method</label>
            <select
              value={paymentType}
              onChange={e => setPaymentType(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
            </select>

            <label>Amount Paid</label>
            <input
              type="number"
              placeholder="0.00"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              step="0.01"
            />

            {amountPaid && (
              <div className={`change-display ${change < 0 ? 'insufficient' : ''}`}>
                <span>Change:</span>
                <strong>{formatCurrency(Math.max(0, change))}</strong>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing || change < 0 || !amountPaid}
            className="btn btn-primary btn-block checkout-btn"
          >
            {processing ? 'Processing...' : '✓ Complete Sale'}
          </button>

          <div className="recent-transactions">
            <div className="section-header-small" onClick={() => setShowHistory(!showHistory)}>
              <h3>Recent Transactions</h3>
              <button className="toggle-history">{showHistory ? '▼' : '▶'}</button>
            </div>
            
            {showHistory && (
              <div className="transactions-list">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="transaction-item-small">
                    <div>
                      <strong>{tx.transaction_number}</strong>
                      <small>{formatDateTime(tx.created_at)}</small>
                    </div>
                    <div className="transaction-actions">
                      <div className="transaction-amount">
                        {formatCurrency(tx.total_amount)}
                      </div>
                      <button
                        onClick={() => handleReprintReceipt(tx.id)}
                        className="reprint-btn"
                        title="Reprint Receipt"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}