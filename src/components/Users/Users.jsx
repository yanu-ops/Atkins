import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'employee'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await api.users.getAll();
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }
    
    if (!formData.username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    setSubmitting(true);
    
    const userData = {
      ...formData,
      role: 'employee'
    };
    
    const result = await api.users.create(userData);
    setSubmitting(false);
    
    if (result.success) {
      alert('✅ Employee account created successfully! They can now login.');
      setShowForm(false);
      setFormData({ username: '', password: '', name: '', role: 'employee' });
      loadUsers();
    } else {
      alert('❌ Failed to create user:\n\n' + result.error);
    }
  };

  const handleDelete = async (user) => {
    const currentUser = JSON.parse(localStorage.getItem('pos_user') || '{}');
    
    if (user.id === currentUser.id) {
      alert('❌ You cannot delete your own account!');
      return;
    }

    if (user.role === 'admin') {
      alert('❌ Cannot delete admin accounts!');
      return;
    }

    const hasTransactions = await checkUserHasTransactions(user.id);
    
    if (hasTransactions) {
      const deactivateInstead = confirm(
        `⚠️ CANNOT DELETE USER\n\n` +
        `"${user.name}" has processed transactions and cannot be permanently deleted.\n\n` +
        `This is to preserve transaction history and maintain data integrity.\n\n` +
        `ALTERNATIVE: Would you like to DEACTIVATE this account instead?\n\n` +
        `• Deactivated users cannot login\n` +
        `• Transaction history is preserved\n` +
        `• Account can be reactivated later if needed\n\n` +
        `Click OK to deactivate, or Cancel to keep as is.`
      );
      
      if (deactivateInstead) {
        const deactivateResult = await api.users.deactivate(user.id);
        
        if (deactivateResult.success) {
          alert('✅ User account deactivated successfully!\n\nThey can no longer login to the system.');
          loadUsers();
        } else {
          alert('❌ Failed to deactivate user:\n\n' + deactivateResult.error);
        }
      }
      return;
    }

    const confirmDelete = confirm(
      `⚠️ DELETE USER?\n\n` +
      `Name: ${user.name}\n` +
      `Username: ${user.username}\n` +
      `Role: ${user.role}\n\n` +
      `This user has NO transaction history.\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure you want to permanently delete this user?`
    );
    
    if (!confirmDelete) return;


    const doubleConfirm = confirm(
      `⚠️ FINAL CONFIRMATION\n\n` +
      `Click OK to permanently delete "${user.name}"`
    );

    if (!doubleConfirm) return;


    const result = await api.users.delete(user.id);
    
    if (result.success) {
      alert('✅ User deleted successfully');
      loadUsers();
    } else {
      if (result.error && result.error.includes('foreign key')) {
        const deactivateInstead = confirm(
          `❌ Deletion failed due to database constraints.\n\n` +
          `Would you like to DEACTIVATE this account instead?\n\n` +
          `This will prevent login while preserving data integrity.`
        );
        
        if (deactivateInstead) {
          const deactivateResult = await api.users.deactivate(user.id);
          if (deactivateResult.success) {
            alert('✅ User account deactivated successfully!');
            loadUsers();
          }
        }
      } else {
        alert('❌ Failed to delete user:\n\n' + result.error);
      }
    }
  };

  const checkUserHasTransactions = async (userId) => {
    try {
      const result = await api.users.hasTransactions(userId);
      return result.success ? result.hasTransactions : false;
    } catch (error) {
      console.error('Error checking transactions:', error);
      return false;
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="users-container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>
            {adminCount} admin{adminCount !== 1 ? 's' : ''} · {' '}
            {employeeCount} employee{employeeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Add Employee
        </button>
      </div>

      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <div className="info-content">
          <strong>User Deletion Policy:</strong> Users who have processed transactions cannot be deleted 
          (to preserve transaction history). They can only be deactivated.
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={!user.is_active ? 'inactive-row' : ''}>
                <td><strong>{user.name}</strong></td>
                <td>{user.username}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.role === 'employee' ? (
                    <div className="user-actions">
                      {user.is_active ? (
                        <button
                          onClick={() => handleDelete(user)}
                          className="btn btn-sm btn-danger"
                          title="Delete or Deactivate User"
                        >
                          🗑️ Delete
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const result = await api.users.activate(user.id);
                            if (result.success) {
                              alert('✅ User activated successfully!');
                              loadUsers();
                            }
                          }}
                          className="btn btn-sm btn-success"
                          title="Reactivate User"
                        >
                          ✓ Activate
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="protected-badge" title="Admin accounts cannot be deleted">
                      🔒 Protected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button onClick={() => setShowForm(false)} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="John Doe"
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().trim()})}
                  required
                  placeholder="johndoe"
                  disabled={submitting}
                />
                <small>Lowercase, no spaces. This will be used for login.</small>
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="Min. 6 characters"
                  minLength="6"
                  disabled={submitting}
                />
                <small>Minimum 6 characters. Employee will use this to login.</small>
              </div>

              <div className="form-group">
                <label>Role</label>
                <div className="role-display">
                  <span className="badge badge-employee">EMPLOYEE</span>
                  <small>All new accounts are created as employees</small>
                </div>
              </div>

              <div className="alert alert-info" style={{marginTop: '16px'}}>
                <strong>ℹ️ Note:</strong> Employee accounts can access POS, view transactions and reports. 
                Admin features are restricted to admin accounts only.
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Employee...' : 'Create Employee Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}