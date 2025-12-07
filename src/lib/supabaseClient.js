import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please check your .env.local file and make sure ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

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


export const setPhilippinesTimezone = async () => {
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'timezone',
      new_value: 'Asia/Manila',
      is_local: false
    });
    
    if (error) {
      console.warn('Could not set timezone:', error);
    } else {
      console.log('✅ Timezone set to Asia/Manila');
    }
  } catch (error) {
    console.warn('Timezone setting not available:', error);
  }
};
    
setPhilippinesTimezone();

export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  console.error('Supabase Error:', error);

  const errorMessages = {
    '23505': 'This record already exists.',
    '23503': 'Cannot delete this record because it is being used elsewhere.',
    '23502': 'Required field is missing.',
    '42P01': 'Database table not found. Please check your setup.',
    'PGRST116': 'Not found.',
    'PGRST204': 'No data returned.',
  };
 
  const errorCode = error.code;
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  return error.message || 'An unexpected error occurred.';
};

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

export default supabase;