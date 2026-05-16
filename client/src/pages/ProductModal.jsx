import React, { useState } from 'react';
import { productsApi } from '../api/catalogs';
import { X } from 'lucide-react';
import '../styles/modals.css';

const ProductModal = ({ item, onClose, onSave }) => {
  const isEdit = !!item;

  const [formData, setFormData] = useState({
    article:               item?.article               || '',
    name:                  item?.name                  || '',
    category:              item?.category              || '',
    unit:                  item?.unit                  || 'шт',
    price:                 item?.price                 || 0,
    production_time_hours: item?.production_time_hours || 1,
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
      if (isEdit) await productsApi.update(item.id, formData);
      else        await productsApi.create(formData);
      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка при сохранении продукции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-slide-up">
        <div className="modal-header">
          <h2>{isEdit ? `Редактирование: ${item.name}` : 'Новая позиция продукции'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Артикул *</label>
              <input name="article" value={formData.article} onChange={handleChange}
                placeholder="П-001" required />
            </div>
            <div className="form-group flex-1">
              <label>Категория</label>
              <input name="category" value={formData.category} onChange={handleChange}
                placeholder="Пневмоаппараты" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Наименование *</label>
            <input name="name" value={formData.name} onChange={handleChange}
              placeholder="Полное наименование изделия" required />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Ед. изм. *</label>
              <select name="unit" value={formData.unit} onChange={handleChange} required>
                <option value="шт">шт</option>
                <option value="компл">компл</option>
                <option value="кг">кг</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Цена (BYN) *</label>
              <input type="number" step="0.01" min="0" name="price"
                value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group flex-1">
              <label>Норма времени (ч)</label>
              <input type="number" step="0.1" min="0" name="production_time_hours"
                value={formData.production_time_hours} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
