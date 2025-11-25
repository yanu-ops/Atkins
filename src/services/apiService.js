// src/services/apiService.js
import { supabase, handleSupabaseError } from '../lib/supabaseClient';

// ============================================
// AUTHENTICATION
// ============================================

export const authService = {
  // Login user
  login: async (username, password) => {
    try {
      const { data, error } = await supabase
        .rpc('verify_user_login', {
          p_username: username,
          p_password: password
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Invalid username or password');
      }

      const user = data[0];
      
      if (!user.is_valid) {
        throw new Error('Invalid username or password');
      }

      // Store user in localStorage
      const userData = {
        id: user.user_id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      
      localStorage.setItem('pos_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: handleSupabaseError(error) || 'Login failed' 
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('pos_user');
    return { success: true };
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('pos_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  }
};

// ============================================
// USERS MANAGEMENT
// ============================================

// src/services/apiService.js - UPDATED USERS SERVICE
// Find the usersService section and replace the create function:

export const usersService = {

    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, name, role, is_active, created_at')
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
    },
  
create: async (userData) => {
      try {
  
        if (!userData.password || userData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
  
        // Call stored procedure to create user with hashed password
        const { data, error } = await supabase
          .rpc('create_user_with_hash', {
            p_username: userData.username,
            p_password: userData.password,
            p_name: userData.name,
            p_role: userData.role || 'employee'
          });
  
        if (error) throw error;
  
        // Check result from stored procedure
        if (!data || data.length === 0) {
          throw new Error('Failed to create user');
        }
  
        const result = data[0];
        
        if (!result.success) {
          throw new Error(result.message);
        }
  
        return { 
          success: true, 
          data: { 
            id: result.user_id,
            message: result.message 
          } 
        };
      } catch (error) {
        console.error('User creation error:', error);
        return { 
          success: false, 
          error: error.message || handleSupabaseError(error) 
        };
      }
    },
  
    // Update user
    update: async (id, userData) => {
      try {
        // If password is being updated, hash it
        if (userData.password) {
          if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          // Call stored procedure to update password
          const { error } = await supabase
            .rpc('update_user_password', {
              p_user_id: id,
              p_new_password: userData.password
            });
          
          if (error) throw error;
          
          // Remove password from userData before updating other fields
          delete userData.password;
        }
  
        // Update other user fields
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', id)
          .select()
          .single();
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
    },
  
    // Deactivate user (soft delete)
    deactivate: async (id) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single();
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
    }
  };

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

export const productsService = {
  // Get all products
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get active products only
  getActive: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get single product
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Create product
  create: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Update product
  update: async (id, productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Delete product
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get low stock products
  getLowStock: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_low_stock_products');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }
};

// ============================================
// TRANSACTIONS / CHECKOUT
// ============================================

export const transactionsService = {
  // Get all transactions
  getAll: async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get single transaction with items
  getById: async (id) => {
    try {
      // Get transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (txError) throw txError;

      // Get transaction items
      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transaction_id', id);

      if (itemsError) throw itemsError;

      return { 
        success: true, 
        data: { ...transaction, items } 
      };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Process checkout
  checkout: async (checkoutData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Prepare items for stored procedure
      const items = checkoutData.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      // Call the checkout stored procedure
      const { data, error } = await supabase
        .rpc('checkout_transaction', {
          p_cashier_id: currentUser.id,
          p_cashier_name: currentUser.name,
          p_payment_type: checkoutData.paymentType,
          p_amount_paid: checkoutData.amountPaid,
          p_items: items,
          p_notes: checkoutData.notes || null
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Checkout failed - no response from server');
      }

      const result = data[0];

      if (!result.success) {
        throw new Error(result.message);
      }

      return { 
        success: true, 
        data: result 
      };
    } catch (error) {
      console.error('Checkout error:', error);
      return { 
        success: false, 
        error: handleSupabaseError(error) || 'Checkout failed' 
      };
    }
  }
};

// ============================================
// REPORTS
// ============================================

export const reportsService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_stats');

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get sales summary for date range
  getSalesSummary: async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .rpc('compute_total_sales', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get top selling products
  getTopProducts: async (limit = 10, startDate = null, endDate = null) => {
    try {
      const { data, error } = await supabase
        .rpc('get_top_selling_products', {
          limit_count: limit,
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }
};

// ============================================
// SETTINGS
// ============================================

export const settingsService = {
  // Get app settings
  get: async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Update app settings
  update: async (settings) => {
    try {
      // Get existing settings ID
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        // Create if doesn't exist
        const { data, error } = await supabase
          .from('app_settings')
          .insert([settings])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
        // Update existing
        const { data, error } = await supabase
          .from('app_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }
};

// Export all services
export default {
  auth: authService,
  users: usersService,
  products: productsService,
  transactions: transactionsService,
  reports: reportsService,
  settings: settingsService
};