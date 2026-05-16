import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import OrderModal from './OrderModal';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

const TAB_ACTIVE  = ['новый', 'на_согласовании', 'подтверждён', 'в_производстве', 'готов'];
const TAB_ARCHIVE = ['отгружен', 'завершён', 'отклонён'];

const OrdersPage = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab]       = useState('active');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const printPage = usePagePrint('Заказы');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll({ search, status: statusFilter, limit: 50 });
      setOrders(data.data || []);
    } catch (e) {
      console.error('Ошибка загрузки заказов', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [search, statusFilter]);

  const displayed = orders.filter(o =>
    activeTab === 'active' ? TAB_ACTIVE.includes(o.status) : TAB_ARCHIVE.includes(o.status)
  );

  const handleCreate = () => { setEditingOrder(null); setIsModalOpen(true); };

  const handleEdit = (order) => {
    if (!['новый', 'на_согласовании'].includes(order.status)) {
      alert('Редактировать можно только новые заказы или на согласовании'); return;
    }
    setEditingOrder(order); setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;
    try { await ordersApi.delete(id); fetchOrders(); }
    catch (e) { alert(e.response?.data?.error || 'Ошибка удаления'); }
  };

  const fmt = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', maximumFractionDigits: 0 }).format(val);

  const switchTab = (tab) => { setActiveTab(tab); setStatusFilter(''); };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1>Управление заказами</h1>
          <p>Просмотр и ведение клиентских заказов</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <PrintActionButton onClick={printPage} label="Печать заказов" />
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={16} /> Новый заказ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)' }}>
        {[['active', 'Активные заказы'], ['archive', 'Архив (Завершённые)']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            style={{
              padding: '0.6rem 1.5rem',
              background: activeTab === key ? 'rgba(255, 255, 255, 0.1)' : 'none', /* Background highlight for active tab */
              border: 'none',
              borderBottom: activeTab === key ? '3px solid #ffffff' : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              color: activeTab === key ? '#ffffff' : 'var(--color-text-muted)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-family)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Поиск по номеру или клиенту..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={15} className="filter-icon" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Все статусы</option>
            {activeTab === 'active' ? (
              <>
                <option value="новый">Новый</option>
                <option value="на_согласовании">На согласовании</option>
                <option value="подтверждён">Подтверждён</option>
                <option value="в_производстве">В производстве</option>
                <option value="готов">Готов</option>
              </>
            ) : (
              <>
                <option value="отгружен">Отгружен</option>
                <option value="завершён">Завершён</option>
                <option value="отклонён">Отклонён</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loader-container">Загрузка...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Дата создания</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Приоритет</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      Нет заказов, соответствующих фильтрам
                    </td>
                  </tr>
                ) : displayed.map(order => (
                  <tr key={order.id}>
                    <td className="font-medium text-primary">{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>{order.customer_name}</td>
                    <td className="font-medium">{fmt(order.total_cost)}</td>
                    <td>
                      <span className={`badge-status status-${order.status.replace(/_/g, '-')}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-priority priority-${order.priority}`}>{order.priority}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Редактировать"
                          onClick={() => handleEdit(order)}
                          disabled={!['новый','на_согласовании'].includes(order.status)}>
                          <Edit size={15} />
                        </button>
                        <button className="btn-icon danger" title="Удалить"
                          onClick={() => handleDelete(order.id)}
                          disabled={order.status !== 'новый'}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OrderModal
          order={editingOrder}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrdersPage;
