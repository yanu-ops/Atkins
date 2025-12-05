import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import './ProductList.css';

export default function ProductList() {
  const { products, loading, reload, update, delete: deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const categorySet = new Set(
      products
        .filter(p => p.category)
        .map(p => p.category)
    );
    return ['all', ...Array.from(categorySet).sort()];
  }, [products]);

  const statusFilteredProducts = products.filter(product => 
    activeTab === 'active' ? product.is_active : !product.is_active
  );

  const categoryFilteredProducts = selectedCategory === 'all' 
    ? statusFilteredProducts
    : statusFilteredProducts.filter(product => product.category === selectedCategory);

  const filteredProducts = categoryFilteredProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.filter(p => !p.is_active).length;

  const getCategoryCount = (category) => {
    const tabProducts = products.filter(p => 
      activeTab === 'active' ? p.is_active : !p.is_active
    );
    if (category === 'all') return tabProducts.length;
    return tabProducts.filter(p => p.category === category).length;
  };

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
      alert('Product deleted successfully!');
    } else {
      if (result.error && result.error.includes('transaction')) {
        const markInactive = confirm(
          `Cannot delete "${product.name}" because it has transaction history.\n\nWould you like to mark it as inactive instead?\n\n(Inactive products won't show in POS but will remain in records)`
        );
        
        if (markInactive) {
          const updateResult = await update(product.id, { is_active: false });
          if (updateResult.success) {
            alert('Product marked as inactive successfully!');
            setActiveTab('inactive');
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
      alert(`Product ${action}d successfully!`);
      if (newStatus) {
        setActiveTab('active');
      } else {
        setActiveTab('inactive');
      }
    } else {
      alert(`Failed to ${action} product: ` + result.error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    reload();
  };

  const handleCloseCategoryManager = () => {
    setShowCategoryManager(false);
    reload();
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="products-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Products</h1>
          <p>{products.length} total products</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-header"
          />
          <button onClick={() => setShowCategoryManager(true)} className="btn btn-secondary">
            🏷️ Categories
          </button>
          <button onClick={handleAdd} className="btn btn-primary">
            + Add Product
          </button>
        </div>
      </div>

      <div className="product-tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          ✅ Active Products
          <span className="tab-count">{activeCount}</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          ⛔ Inactive Products
          <span className="tab-count">{inactiveCount}</span>
        </button>
      </div>

      <div className="category-filter">
        <label className="filter-label">
          <span className="filter-icon">🏷️</span>
          Filter by Category:
        </label>
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '📦 All Products' : category}
              <span className="category-count">{getCategoryCount(category)}</span>
            </button>
          ))}
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
                <div className="product-image-placeholder">🎸</div>
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
                  <>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="btn btn-warning btn-sm"
                      title="Deactivate Product"
                    >
                      ⛔ Deactivate
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="btn btn-danger btn-sm"
                      title="Delete Product"
                    >
                      🗑️ Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="btn btn-success btn-sm btn-block"
                    title="Activate Product"
                  >
                    ✅ Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>
            {searchQuery 
              ? `🔍 No products found matching "${searchQuery}"` 
              : selectedCategory !== 'all'
              ? `📦 No ${selectedCategory} products in ${activeTab} list`
              : activeTab === 'active' 
              ? '📦 No active products found' 
              : '⛔ No inactive products found'}
          </p>
          {searchQuery || selectedCategory !== 'all' ? (
            <div className="no-results-actions">
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                  Clear Search
                </button>
              )}
              {selectedCategory !== 'all' && (
                <button onClick={() => setSelectedCategory('all')} className="btn btn-secondary">
                  Show All Categories
                </button>
              )}
            </div>
          ) : activeTab === 'active' ? (
            <button onClick={handleAdd} className="btn btn-primary">
              + Add Your First Product
            </button>
          ) : (
            <p className="hint-text">Deactivated products will appear here</p>
          )}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}

      {showCategoryManager && (
        <CategoryManager onClose={handleCloseCategoryManager} />
      )}
    </div>
  );
}