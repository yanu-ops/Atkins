// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please check your .env.local file and make sure ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'pos-system'
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  console.error('Supabase Error:', error);
  
  // Common error messages
  const errorMessages = {
    '23505': 'This record already exists.',
    '23503': 'Cannot delete this record because it is being used elsewhere.',
    '23502': 'Required field is missing.',
    '42P01': 'Database table not found. Please check your setup.',
    'PGRST116': 'Not found.',
    'PGRST204': 'No data returned.',
  };
  
  // Check for specific error codes
  const errorCode = error.code;
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }
  
  // Return the error message
  return error.message || 'An unexpected error occurred.';
};

// Helper to check connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('store_name')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Export configured client
export default supabase;