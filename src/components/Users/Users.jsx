// src/components/Users/Users.jsx
import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    const result = await api.users.create(formData);
    
    if (result.success) {
      alert('User created successfully!');
      setShowForm(false);
      setFormData({ username: '', password: '', name: '', role: 'employee' });
      loadUsers();
    } else {
      alert('Failed to create user: ' + result.error);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    
    const result = await api.users.deactivate(userId);
    if (result.success) {
      alert('User deactivated');
      loadUsers();
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="users-container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage employee accounts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Add User
        </button>
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
              <tr key={user.id}>
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
                  {user.is_active && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
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
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  placeholder="johndoe"
                />
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
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}