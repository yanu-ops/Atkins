import { supabase, handleSupabaseError } from '../lib/supabaseClient';


export const authService = {
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

  logout: () => {
    localStorage.removeItem('pos_user');
    return { success: true };
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('pos_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  }
};


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
  
        const { data, error } = await supabase
          .rpc('create_user_with_hash', {
            p_username: userData.username,
            p_password: userData.password,
            p_name: userData.name,
            p_role: userData.role || 'employee'
          });
  
        if (error) throw error;
  
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
  
    update: async (id, userData) => {
      try {
        if (userData.password) {
          if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          const { error } = await supabase
            .rpc('update_user_password', {
              p_user_id: id,
              p_new_password: userData.password
            });
          
          if (error) throw error;
          delete userData.password;
        }
  
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
    },

    delete: async (id) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .delete()
          .eq('id', id)
          .select()
          .single();
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        return { 
          success: false, 
          error: handleSupabaseError(error) 
        };
      }
    }
  };


export const productsService = {
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


export const transactionsService = {
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

  getById: async (id) => {
    try {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (txError) throw txError;

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


  checkout: async (checkoutData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const items = checkoutData.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

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


export const reportsService = {
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


export const settingsService = {
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

  update: async (settings) => {
    try {
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('app_settings')
          .insert([settings])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
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

export default {
  auth: authService,
  users: usersService,
  products: productsService,
  transactions: transactionsService,
  reports: reportsService,
  settings: settingsService
};