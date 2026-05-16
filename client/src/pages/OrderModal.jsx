import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders';
import { productsApi, customersApi } from '../api/catalogs';
import { X, Plus, Trash2 } from 'lucide-react';
import '../styles/modals.css';

const OrderModal = ({ order, onClose, onSave }) => {
  const isEdit = !!order;

  const [formData, setFormData] = useState({
    customer_id: '',
    priority: 'средний',
    planned_date: '',
    notes: '',
    items: [],
  });
  const [catalogs, setCatalogs] = useState({ products: [], customers: [] });
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          productsApi.getAll(),
          customersApi.getAll(),
        ]);
        setCatalogs({ products: prodRes, customers: custRes });

        if (isEdit) {
          const details = await ordersApi.getById(order.id);
          setFormData({
            customer_id:  details.customer_id,
            priority:     details.priority,
            planned_date: details.planned_date ? details.planned_date.split('T')[0] : '',
            notes:        details.notes || '',
            items: details.items.map(i => ({
              product_id: i.product_id,
              quantity:   i.quantity,
              unit_price: i.unit_price,
            })),
          });
        } else {
          setFormData(p => ({ ...p, items: [{ product_id: '', quantity: 1, unit_price: 0 }] }));
        }
      } catch (e) {
        console.error('Ошибка загрузки справочников', e);
      }
    };
    load();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    if (field === 'product_id') {
      const prod = catalogs.products.find(p => p.id === parseInt(value));
      if (prod) items[idx].unit_price = prod.price;
    }
    items[idx][field] = value;
    setFormData(p => ({ ...p, items }));
  };

  const addItem = () =>
    setFormData(p => ({ ...p, items: [...p.items, { product_id: '', quantity: 1, unit_price: 0 }] }));

  const removeItem = idx =>
    setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.items.length || !formData.items[0].product_id) {
      alert('Добавьте хотя бы одну позицию в заказ'); return;
    }
    setLoading(true);
    try {
      if (isEdit) { await ordersApi.update(order.id, formData); }
      else        { await ordersApi.create(formData); }
      onSave();
      onClose();
    } catch (e) {
      alert(e.response?.data?.error || 'Ошибка сохранения заказа');
    } finally {
      setLoading(false);
    }
  };

  const totalSum = formData.items.reduce(
    (s, i) => s + (parseFloat(i.unit_price) || 0) * (parseFloat(i.quantity) || 0), 0
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content large animate-slide-up">

        <div className="modal-header">
          <h2>{isEdit ? `Редактирование заказа ${order.order_number}` : 'Новый заказ'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Клиент *</label>
              <select name="customer_id" value={formData.customer_id} onChange={handleChange} required disabled={isEdit}>
                <option value="">— Выберите клиента —</option>
                {catalogs.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Приоритет</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="низкий">Низкий</option>
                <option value="средний">Средний</option>
                <option value="высокий">Высокий</option>
                <option value="критический">Критический</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Плановая дата</label>
              <input type="date" name="planned_date" value={formData.planned_date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Состав заказа *</label>
            <div className="order-items-container">
              <table className="data-table items-table">
                <thead>
                  <tr>
                    <th>Продукция</th>
                    <th style={{ width: 130 }}>Цена (BYN)</th>
                    <th style={{ width: 100 }}>Кол-во</th>
                    <th style={{ width: 130 }}>Сумма</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)} required disabled={isEdit}>
                          <option value="">— Выберите —</option>
                          {catalogs.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.article})</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input type="number" min="0" step="0.01" value={item.unit_price}
                          onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                          disabled={isEdit} required />
                      </td>
                      <td>
                        <input type="number" min="1" value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          disabled={isEdit} required />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                        {((item.unit_price || 0) * (item.quantity || 0)).toFixed(2)}
                      </td>
                      <td>
                        {!isEdit && (
                          <button type="button" className="btn-icon danger" onClick={() => removeItem(idx)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isEdit && (
                <button type="button" className="add-item-btn" onClick={addItem}>
                  <Plus size={15} /> Добавить позицию
                </button>
              )}
            </div>

            <div className="total-sum-row">
              Итого:{' '}
              <span>
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', maximumFractionDigits: 0 }).format(totalSum)}
              </span>
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Примечание</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Дополнительная информация к заказу" />
          </div>

          <div className="modal-footer" style={{ margin: '0 -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Сохранение…' : 'Сохранить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
