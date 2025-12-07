import { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabaseClient';
import './ProductForm.css';

export default function ProductForm({ product, onClose }) {
  const { create, update } = useProducts();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    min_stock_threshold: '5',
    description: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
    
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        price: product.price || '',
        stock: product.stock || '',
        min_stock_threshold: product.min_stock_threshold || '5',
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active !== undefined ? product.is_active : true
      });
      setImagePreview(product.image_url || '');
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_active_categories');
      
      if (error) throw error;
      
      const categoryNames = (data || []).map(cat => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        'Electric Guitars',
        'Acoustic Guitars',
        'Bass Guitars',
        'Amplifiers',
        'Effects',
        'Accessories',
        'Strings',
        'Parts'
      ]);
    }
    setLoadingCategories(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, image_url: value }));
    setImagePreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      min_stock_threshold: parseInt(formData.min_stock_threshold)
    };

    let result;
    if (product) {
      result = await update(product.id, submitData);
    } else {
      result = await create(submitData);
    }

    setLoading(false);

    if (result.success) {
      alert(`Product ${product ? 'updated' : 'created'} successfully!`);
      onClose();
    } else {
      alert('Operation failed: ' + result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="image-preview-section">
            <div className="image-box">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" onError={() => setImagePreview('')}/>
              ) : (
                <div className="image-placeholder">
                  <span>📷</span>
                  <p>No image</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image_url">Product Image URL</label>
            <input
              id="image_url"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleImageChange}
              placeholder="https://example.com/image.jpg"
            />
            <small>Enter a direct image URL (jpg, png, gif)</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Fender Stratocaster"
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Fender"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              {loadingCategories ? (
                <select disabled>
                  <option>Loading categories...</option>
                </select>
              ) : (
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
              <small>Manage categories from the Products page</small>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₱) *</label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="min_stock_threshold">Low Stock Alert Level *</label>
              <input
                id="min_stock_threshold"
                type="number"
                name="min_stock_threshold"
                value={formData.min_stock_threshold}
                onChange={handleChange}
                required
                min="0"
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter product description (optional)"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Product is active and visible</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}