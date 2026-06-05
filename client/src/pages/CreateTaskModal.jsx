import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { productionApi } from '../api/production';
import { X, Play, AlertTriangle } from 'lucide-react';

const STATUS_LABELS = {
  'новый': 'Новый',
  'на_согласовании': 'На согласовании',
  'подтверждён': 'Подтверждён',
  'в_производстве': 'В производстве',
  'готов': 'Готов',
  'отгружен': 'Отгружен',
  'завершён': 'Завершён',
  'отклонён': 'Отклонён',
};

const CreateTaskModal = ({ order, onClose, onSave }) => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [detail, usersRes] = await Promise.all([
          apiClient.get(`/orders/${order.id}`),
          apiClient.get('/users'),
        ]);
        const orderData = detail.data;
        const itemsData = (orderData.items || []).map(i => ({
          ...i,
          quantity: i.quantity || 1,
          start_date: '',
          end_date: '',
          notes: '',
          selected: true,
        }));
        setItems(itemsData);
        setUsers((usersRes.data || []).filter(u => u.is_active && (u.role === 'мастер' || u.role === 'начальник_производства')));
      } catch (e) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [order.id]);

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleCreate = async () => {
    const selected = items.filter(i => i.selected);
    if (selected.length === 0) {
      setError('Выберите хотя бы одну позицию для производства');
      return;
    }

    setSaving(true);
    setError('');

    try {
      for (const item of selected) {
        await productionApi.createTask({
          order_id: order.id,
          order_item_id: item.id,
          product_id: item.product_id,
          assigned_to: item.assigned_to || null,
          quantity: item.quantity,
          start_date: item.start_date || null,
          end_date: item.end_date || null,
          notes: item.notes || '',
        });
      }

      await apiClient.patch(`/orders/${order.id}/status`, { status: 'в_производстве' });
      onSave();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка создания задания');
    } finally {
      setSaving(false);
    }
  };

  const fmtCurrency = (val) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Запуск в производство</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div className="loader-container">Загрузка...</div>
        ) : (
          <div className="modal-body">
            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{order.order_number}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                {order.customer_name} — {STATUS_LABELS[order.status] || order.status}
              </div>
            </div>

            {error && (
              <div className="form-message error" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.85rem' }}>
                <AlertTriangle size={14} style={{ marginRight: 6 }} />{error}
              </div>
            )}

            <table className="data-table" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Товар</th>
                  <th style={{ width: 80 }}>Кол-во</th>
                  <th style={{ width: 120 }}>Начало</th>
                  <th style={{ width: 120 }}>Окончание</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={e => handleItemChange(idx, 'selected', e.target.checked)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {item.quantity} × {fmtCurrency(item.unit_price)}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.start_date}
                        onChange={e => handleItemChange(idx, 'start_date', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.end_date}
                        onChange={e => handleItemChange(idx, 'end_date', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="form-group">
              <label>Ответственный (мастер)</label>
              <select
                value={items[0]?.assigned_to || ''}
                onChange={e => {
                  const val = e.target.value;
                  setItems(prev => prev.map(i => ({ ...i, assigned_to: val || null })));
                }}
              >
                <option value="">— Не назначен —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.role.replace(/_/g, ' ')})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Отмена</button>
          <button className="btn-primary" onClick={handleCreate} disabled={saving || loading}>
            <Play size={16} /> {saving ? 'Создание...' : 'Запустить в производство'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;