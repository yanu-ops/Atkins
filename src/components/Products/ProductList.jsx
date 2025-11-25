// src/components/Products/ProductList.jsx - FIXED AUTO-REFRESH
import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import ProductForm from './ProductForm';
import './ProductList.css';

export default function ProductList() {
  const { products, loading, reload, update, delete: deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    const confirmDelete = confirm(
      `Delete "${product.name}"?\n\nNote: If this product has transaction history, it will be marked as inactive instead of deleted.`
    );
    
    if (!confirmDelete) return;

    const result = await deleteProduct(product.id);
    
    if (result.success) {
      // ✅ Success notification
      alert('Product deleted successfully!');
      // ✅ Auto-refresh handled by hook
    } else {
      // Check if error is about transactions
      if (result.error && result.error.includes('transaction')) {
        const markInactive = confirm(
          `Cannot delete "${product.name}" because it has transaction history.\n\nWould you like to mark it as inactive instead?\n\n(Inactive products won't show in POS but will remain in records)`
        );
        
        if (markInactive) {
          const updateResult = await update(product.id, { is_active: false });
          if (updateResult.success) {
            // ✅ Success notification
            alert('Product marked as inactive successfully!');
            // ✅ Auto-refresh handled by hook
          } else {
            alert('Failed to mark product as inactive: ' + updateResult.error);
          }
        }
      } else {
        alert('Delete failed: ' + result.error);
      }
    }
  };

  const handleToggleActive = async (product) => {
    const newStatus = !product.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${product.name}"?`)) return;

    const result = await update(product.id, { is_active: newStatus });
    
    if (result.success) {
      // ✅ Success notification
      alert(`Product ${action}d successfully!`);
      // ✅ Auto-refresh handled by hook
    } else {
      alert(`Failed to ${action} product: ` + result.error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    // ✅ Optional: Reload products when form closes
    reload();
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} total products ({products.filter(p => p.is_active).length} active)</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-header"
          />
          <button onClick={handleAdd} className="btn btn-primary">
            + Add Product
          </button>
        </div>
      </div>

      <div className="products-grid-view">
        {filteredProducts.map(product => (
          <div key={product.id} className={`product-card-view ${!product.is_active ? 'inactive' : ''}`}>
            {!product.is_active && (
              <div className="inactive-badge">Inactive</div>
            )}
            
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="product-image-placeholder">
                  🎸
                </div>
              )}
            </div>
            
            <div className="product-info-card">
              <h3>{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <span className="category-badge">{product.category}</span>
              
              <div className="product-details">
                <div className="price-info">
                  <span className="label">Price</span>
                  <strong>{formatCurrency(product.price)}</strong>
                </div>
                <div className="stock-info-card">
                  <span className="label">Stock</span>
                  <span className={`stock-value ${
                    product.stock === 0 ? 'out' : 
                    product.stock <= product.min_stock_threshold ? 'low' : 
                    'good'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  onClick={() => handleEdit(product)}
                  className="btn btn-secondary btn-sm"
                  title="Edit Product"
                >
                  ✏️ Edit
                </button>
                
                {product.is_active ? (
                  <button
                    onClick={() => handleDelete(product)}
                    className="btn btn-danger btn-sm"
                    title="Delete Product"
                  >
                    🗑️ Delete
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="btn btn-success btn-sm"
                    title="Activate Product"
                  >
                    ✓ Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>No products found</p>
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
              Clear Search
            </button>
          ) : (
            <button onClick={handleAdd} className="btn btn-primary">
              + Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}