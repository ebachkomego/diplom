import React, { useState } from 'react';
import apiClient from '../api/client';
import { X } from 'lucide-react';
import '../styles/modals.css';

const UserModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', role: 'мастер',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/users', formData);
      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-slide-up">
        <div className="modal-header">
          <h2>Новый пользователь</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Имя пользователя (Логин) *</label>
            <input name="username" value={formData.username} onChange={handleChange}
              placeholder="например: ivanov" required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>ФИО *</label>
            <input name="full_name" value={formData.full_name} onChange={handleChange}
              placeholder="Иванов Иван Иванович" required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Пароль *</label>
            <input type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Минимум 6 символов" required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Роль в системе *</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="администратор">Администратор (Полный доступ)</option>
              <option value="менеджер">Менеджер по продажам</option>
              <option value="начальник_производства">Начальник производства</option>
              <option value="мастер">Мастер цеха</option>
              <option value="кладовщик">Кладовщик</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Создание…' : 'Создать пользователя'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
