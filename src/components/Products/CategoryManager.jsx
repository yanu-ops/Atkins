import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './CategoryManager.css';

export default function CategoryManager({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const commonIcons = ['🎸', '🎵', '🎹', '🎤', '🥁', '🎺', '🎻', '📻', '🔊', '🎧', '💿', '📀', '🎼', '🎶', '⚙️', '🔧', '📦', '✨'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_active_categories');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Failed to load categories');
    }
    setLoading(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }

    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .rpc('add_product_category', {
          p_name: newCategory.trim(),
          p_description: newDescription.trim() || null,
          p_icon: newIcon
        });

      if (error) throw error;

      if (data && data[0] && data[0].success) {
        alert('✅ Category added successfully!');
        setNewCategory('');
        setNewDescription('');
        setNewIcon('📦');
        await loadCategories();
      } else {
        alert(data?.[0]?.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category: ' + error.message);
    }
    
    setSaving(false);
  };

  const handleDeleteCategory = async (categoryId, categoryName, productCount) => {
    if (productCount > 0) {
      const confirm1 = window.confirm(
        `"${categoryName}" has ${productCount} product(s).\n\n` +
        `This category will be DEACTIVATED (not deleted) to preserve product data.\n\n` +
        `Products in this category will still work, but the category won't appear in new product forms.\n\n` +
        `Continue?`
      );
      if (!confirm1) return;
    } else {
      const confirm2 = window.confirm(
        `Delete "${categoryName}" category?\n\n` +
        `This category has no products and will be permanently deleted.\n\n` +
        `This action cannot be undone!`
      );
      if (!confirm2) return;
    }

    try {
      const { data, error } = await supabase
        .rpc('delete_product_category', {
          p_category_id: categoryId
        });

      if (error) throw error;

      if (data && data[0] && data[0].success) {
        alert('✅ ' + data[0].message);
        await loadCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏷️ Manage Categories</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="category-manager-content">
          <div className="add-category-form">
            <h3>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-row">
                <div className="form-group" style={{flex: '0 0 80px'}}>
                  <label>Icon</label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="icon-select"
                  >
                    {commonIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{flex: 1}}>
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Ukuleles"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of this category"
                  disabled={saving}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                {saving ? 'Adding...' : '+ Add Category'}
              </button>
            </form>
          </div>

          <div className="categories-list-section">
            <h3>Existing Categories ({categories.length})</h3>
            
            {categories.length === 0 ? (
              <div className="no-categories">
                <p>📦 No categories yet</p>
                <small>Add your first category above</small>
              </div>
            ) : (
              <div className="categories-list">
                {categories.map(category => (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      <span className="category-icon">{category.icon}</span>
                      <div className="category-details">
                        <strong>{category.name}</strong>
                        {category.description && (
                          <small>{category.description}</small>
                        )}
                      </div>
                      <span className="category-product-count">
                        {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name, category.product_count)}
                      className="btn btn-danger btn-sm"
                      title={category.product_count > 0 ? 'Deactivate Category' : 'Delete Category'}
                    >
                      {category.product_count > 0 ? '⛔' : '🗑️'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-block">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}