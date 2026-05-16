import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../api/warehouse';
import { ArrowDownRight, ArrowUpRight, AlertTriangle, Search, X } from 'lucide-react';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

/* Shared tab-button style helper — works in both themes */
const tabStyle = (active) => ({
  padding: '0.6rem 1.25rem',
  background:   active ? 'var(--color-primary-light)' : 'transparent',
  border:       active ? '1px solid var(--color-primary)' : '1px solid var(--color-border-solid)',
  borderRadius: 'var(--radius-md)',
  color:        active ? 'var(--color-primary)' : 'var(--color-text-muted)',
  fontWeight:   active ? 700 : 500,
  cursor:       'pointer',
  fontSize:     '0.9rem',
  fontFamily:   'var(--font-family)',
  transition:   'all 0.2s',
});

const WarehousePage = () => {
  const [activeTab, setActiveTab]     = useState('materials');
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [modalType, setModalType]     = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty]                 = useState('');
  const printPage = usePagePrint('Складской учет');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'materials'
        ? await warehouseApi.getMaterials()
        : await warehouseApi.getProducts();
      setData(res);
    } catch (e) {
      console.error('Ошибка загрузки склада', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!qty || qty <= 0) { alert('Кол-во должно быть больше нуля!'); return; }
    try {
      const payload = {
        item_type: activeTab === 'materials' ? 'material' : 'product',
        item_id:   selectedItem.item_id || selectedItem.id,
        quantity:  parseFloat(qty),
      };
      if (modalType === 'receive') await warehouseApi.receive(payload);
      else                         await warehouseApi.issue(payload);
      closeModal();
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Произошла ошибка базы данных');
    }
  };

  const closeModal = () => { setModalType(null); setQty(''); setSelectedItem(null); };

  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.article && item.article.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1>Складской учёт</h1>
          <p>Управление остатками материалов и готовой продукции</p>
        </div>
        <PrintActionButton onClick={printPage} label="Печать склада" />
      </div>

      {/* Controls bar */}
      <div className="controls-bar">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={tabStyle(activeTab === 'materials')} onClick={() => setActiveTab('materials')}>
            Сырьё и материалы
          </button>
          <button style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>
            Готовая продукция
          </button>
        </div>
        <div className="search-box" style={{ maxWidth: 280 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Поиск по названию/артикулу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loader-container">Обновление остатков...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Артикул</th>
                  <th>Наименование</th>
                  <th>Ед. изм.</th>
                  <th>В наличии</th>
                  <th>Резерв</th>
                  <th>Доступно</th>
                  {activeTab === 'materials' && <th>Мин. остаток</th>}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'materials' ? 8 : 7}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      Нет данных на складе
                    </td>
                  </tr>
                ) : filtered.map(item => {
                  const isLow = activeTab === 'materials' && item.is_low_stock === 1;
                  return (
                    <tr key={item.id} style={isLow ? { background: 'var(--color-danger-bg)' } : {}}>
                      <td style={{ fontWeight: 600 }}>{item.article}</td>
                      <td>
                        <span>{item.name}</span>
                        {isLow && (
                          <AlertTriangle size={13}
                            style={{ color: 'var(--color-danger)', marginLeft: 6, verticalAlign: 'middle' }}
                            title="Заканчивается!" />
                        )}
                      </td>
                      <td>{item.unit}</td>
                      <td>{item.quantity}</td>
                      <td style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{item.reserved}</td>
                      <td style={{ fontWeight: 700, color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {item.available}
                      </td>
                      {activeTab === 'materials' && <td style={{ color: 'var(--color-text-muted)' }}>{item.min_stock}</td>}
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Приход"
                            style={{ color: 'var(--color-success)', borderColor: 'var(--color-success-bg)' }}
                            onClick={() => { setModalType('receive'); setSelectedItem(item); }}>
                            <ArrowDownRight size={15} />
                          </button>
                          <button className="btn-icon" title="Расход"
                            style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning-bg)' }}
                            onClick={() => { setModalType('issue'); setSelectedItem(item); }}>
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receive / Issue modal */}
      {modalType && selectedItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h2>{modalType === 'receive' ? '📥 Приход на склад' : '📤 Выдача со склада'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleAction} className="modal-body">
              <div className="form-group">
                <label>Позиция</label>
                <div style={{ padding: '0.65rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', fontWeight: 600 }}>
                  {selectedItem.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({selectedItem.article})</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                  Текущий доступный остаток: <strong>{selectedItem.available} {selectedItem.unit}</strong>
                </p>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Количество ({selectedItem.unit}) *</label>
                <input
                  type="number" min="0.01" step="0.01"
                  value={qty} onChange={e => setQty(e.target.value)}
                  required autoFocus
                  placeholder="Введите количество"
                />
              </div>
              <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn-outline" onClick={closeModal}>Отмена</button>
                <button type="submit" className="btn-primary"
                  style={modalType === 'receive'
                    ? { background: 'linear-gradient(135deg, var(--color-success), #059669)' }
                    : { background: 'linear-gradient(135deg, var(--color-warning), #d97706)' }}>
                  {modalType === 'receive' ? 'Оформить приход' : 'Оформить выдачу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;
