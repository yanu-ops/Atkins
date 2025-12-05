// src/services/sqliteService.js - LOCAL SQLITE DATABASE
import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

// Initialize SQLite database
export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing SQLite...');
    
    // Initialize SQL.js
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Load existing database from localStorage or create new
    const savedDb = localStorage.getItem('pos_local_database');
    
    if (savedDb) {
      // Load existing database
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        db = new SQL.Database(uint8Array);
        console.log('✅ Loaded existing SQLite database');
      } catch (error) {
        console.log('⚠️ Corrupted database, creating new one');
        db = new SQL.Database();
        createTables();
      }
    } else {
      // Create new database
      db = new SQL.Database();
      createTables();
      console.log('✅ Created new SQLite database');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to initialize SQLite:', error);
    return { success: false, error: error.message };
  }
};

// Create database tables
const createTables = () => {
  console.log('📊 Creating tables...');
  
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      min_stock_threshold INTEGER NOT NULL DEFAULT 5,
      image_url TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      transaction_number TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      change_amount REAL NOT NULL,
      cashier_id TEXT,
      cashier_name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0
    )
  `);

  // Transaction items table
  db.run(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_each REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )
  `);

  // Sync queue table
  db.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables created');
  saveDatabase();
};

// Save database to localStorage
const saveDatabase = () => {
  if (!db) return;
  
  try {
    const data = db.export();
    const buffer = JSON.stringify(Array.from(data));
    localStorage.setItem('pos_local_database', buffer);
  } catch (error) {
    console.error('❌ Failed to save database:', error);
  }
};

// Get all rows from query
export const query = (sql, params = []) => {
  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return { success: false, error: 'Database not initialized' };
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Query error:', error);
    return { success: false, error: error.message };
  }
};

// Insert data
export const insert = (table, data) => {
  try {
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');
    
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
    db.run(sql, values);
    saveDatabase();
    
    return { success: true };
  } catch (error) {
    console.error('Insert error:', error);
    return { success: false, error: error.message };
  }
};

// Update data
export const update = (table, data, where) => {
  try {
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }

    const setClauses = Object.keys(data).map(key => `${key} = ?`).join(',');
    const setValues = Object.values(data);
    
    const whereClauses = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(where);
    
    const sql = `UPDATE ${table} SET ${setClauses} WHERE ${whereClauses}`;
    db.run(sql, [...setValues, ...whereValues]);
    saveDatabase();
    
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }
};

// Delete data
export const deleteRecord = (table, where) => {
  try {
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }

    const whereClauses = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(where);
    
    const sql = `DELETE FROM ${table} WHERE ${whereClauses}`;
    db.run(sql, whereValues);
    saveDatabase();
    
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

// Add to sync queue
export const addToSyncQueue = (table, recordId, operation, data) => {
  const queueData = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    table_name: table,
    record_id: recordId,
    operation: operation,
    data: JSON.stringify(data),
    created_at: new Date().toISOString()
  };
  
  return insert('sync_queue', queueData);
};

// Get sync queue
export const getSyncQueue = () => {
  return query('SELECT * FROM sync_queue ORDER BY created_at ASC');
};

// Clear synced items
export const clearSyncQueue = (ids) => {
  try {
    if (!db || !ids || ids.length === 0) {
      return { success: true };
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM sync_queue WHERE id IN (${placeholders})`;
    db.run(sql, ids);
    saveDatabase();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Get database stats
export const getStats = () => {
  try {
    const products = query('SELECT COUNT(*) as count FROM products');
    const transactions = query('SELECT COUNT(*) as count FROM transactions');
    const syncQueue = query('SELECT COUNT(*) as count FROM sync_queue');

    return {
      success: true,
      data: {
        products: products.data[0]?.count || 0,
        transactions: transactions.data[0]?.count || 0,
        pendingSync: syncQueue.data[0]?.count || 0
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Clear all data (for testing)
export const clearDatabase = () => {
  try {
    db.run('DELETE FROM products');
    db.run('DELETE FROM transactions');
    db.run('DELETE FROM transaction_items');
    db.run('DELETE FROM sync_queue');
    saveDatabase();
    console.log('✅ Database cleared');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  initDatabase,
  query,
  insert,
  update,
  deleteRecord,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  isOnline,
  getStats,
  clearDatabase
};