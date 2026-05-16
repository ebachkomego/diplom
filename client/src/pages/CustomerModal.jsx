import React, { useState } from 'react';
import { customersApi } from '../api/catalogs';
import { X } from 'lucide-react';
import '../styles/modals.css';

const CustomerModal = ({ item, onClose, onSave }) => {
  const isEdit = !!item;
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    inn: item?.inn || '',
    contact_person: item?.contact_person || '',
    phone: item?.phone || '',
    email: item?.email || ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await customersApi.update(item.id, formData);
      } else {
        await customersApi.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении контрагента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-slide-up">
        <div className="modal-header">
          <h2>{isEdit ? `Редактирование: ${item.name}` : 'Новый контрагент'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Наименование организации / ФИО *</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="ОАО «ПримерИнвест»"
              required 
            />
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>УНП / ИНН *</label>
              <input 
                name="inn" 
                value={formData.inn} 
                onChange={handleChange} 
                placeholder="9-значный код"
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label>Контактное лицо</label>
              <input 
                name="contact_person" 
                value={formData.contact_person} 
                onChange={handleChange} 
                placeholder="Имя представителя"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Телефон</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+375 (__) ___-__-__" 
              />
            </div>
            <div className="form-group flex-1">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
