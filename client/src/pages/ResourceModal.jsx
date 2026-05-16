import React, { useState } from 'react';
import apiClient from '../api/client';
import { X } from 'lucide-react';
import '../styles/modals.css';

const ResourceModal = ({ item, onClose, onSave }) => {
  const isEdit = !!item;
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    type: item?.type || 'токарный',
    capacity: item?.capacity || 10,
    status: item?.status || 'активен',
    location: item?.location || 'Цех №1',
    quality_grade: item?.quality_grade || 'стандарт',
    precision_grade: item?.precision_grade || 7,
    workshop_type: item?.workshop_type || 'механообработка',
    year_manufactured: item?.year_manufactured || 2020,
    manufacturer: item?.manufacturer || '',
    notes: item?.notes || ''
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
        await apiClient.put(`/resources/${item.id}`, formData);
      } else {
        await apiClient.post('/resources', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении оборудования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content large animate-slide-up">
        <div className="modal-header">
          <h2>{isEdit ? `Редактирование: ${item.name}` : 'Добавление оборудования'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Наименование оборудования *</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Например: Токарный станок с ЧПУ DMG MORI" 
              required 
            />
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Тип оборудования *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="токарный">Токарный станок</option>
                <option value="фрезерный">Фрезерный станок</option>
                <option value="шлифовальный">Шлифовальный станок</option>
                <option value="линия_сборки">Линия сборки</option>
                <option value="участок_сборки">Сборочный участок</option>
                <option value="испытательный">Испытательный стенд</option>
                <option value="покраска">Покрасочная камера</option>
                <option value="упаковка">Упаковочный участок</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Мощность (ед/час) *</label>
              <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Цех *</label>
              <select name="location" value={formData.location} onChange={handleChange} required>
                <option value="Цех №1">Цех №1 (Механообработка)</option>
                <option value="Цех №2">Цех №2 (Сборка)</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Тип участка</label>
              <select name="workshop_type" value={formData.workshop_type} onChange={handleChange}>
                <option value="механообработка">Механообработка</option>
                <option value="сборка">Сборка</option>
              </select>
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Класс качества</label>
              <select name="quality_grade" value={formData.quality_grade} onChange={handleChange}>
                <option value="премиум">Премиум</option>
                <option value="стандарт">Стандарт</option>
                <option value="эконом">Эконом</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Класс точности (1-12)</label>
              <input type="number" min="1" max="12" name="precision_grade" value={formData.precision_grade} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Год выпуска</label>
              <input type="number" min="1980" max="2030" name="year_manufactured" value={formData.year_manufactured} onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>Производитель</label>
              <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Например: DMG MORI (Германия)" />
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group flex-1">
              <label>Статус оборудования *</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="активен">Активен</option>
                <option value="на_обслуживании">На обслуживании</option>
                <option value="неисправен">Неисправен</option>
                <option value="списан">Списан</option>
              </select>
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Дополнительные примечания</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Особенности эксплуатации, история ремонтов и т.д." />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить данные'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceModal;
