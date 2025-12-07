
import { useState, useEffect } from 'react';
import api from '../services/apiService';

export function useProducts(activeOnly = false) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadProducts();
  }, [activeOnly]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    const result = activeOnly 
      ? await api.products.getActive() 
      : await api.products.getAll();
    
    if (result.success) {
      setProducts(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const createProduct = async (productData) => {
    const result = await api.products.create(productData);
    if (result.success) {

      await loadProducts();
    }
    return result;
  };

  const updateProduct = async (id, productData) => {
    const result = await api.products.update(id, productData);
    if (result.success) {
    
      await loadProducts();
    }
    return result;
  };

  const deleteProduct = async (id) => {
    const result = await api.products.delete(id);
    if (result.success) {
  
      await loadProducts();
    }
    return result;
  };

  const searchProducts = (query) => {
    if (!query) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.category?.toLowerCase().includes(lowerQuery) ||
      product.brand?.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    products,
    loading,
    error,
    reload: loadProducts, 
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct,
    search: searchProducts
  };
}