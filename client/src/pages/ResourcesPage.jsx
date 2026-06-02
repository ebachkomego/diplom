import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Search, Plus, Edit, Trash2, 
  Factory, Star, Calendar, MapPin, Gauge, Award
} from 'lucide-react';
import ResourceModal from './ResourceModal';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterWorkshop, setFilterWorkshop] = useState('all');
  const [filterQuality, setFilterQuality] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const printPage = usePagePrint('Оборудование и ресурсы');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterWorkshop !== 'all') params.workshop = filterWorkshop;
      if (filterQuality !== 'all') params.quality_grade = filterQuality;
      
      const response = await apiClient.get('/resources', { params });
      setResources(response.data);
    } catch (err) {
      console.error('Ошибка загрузки ресурсов', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterWorkshop, filterQuality]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить этот ресурс из системы?")) {
      try {
        await apiClient.delete(`/resources/${id}`);
        fetchResources();
      } catch (err) {
        alert(err.response?.data?.error || "Ошибка удаления");
      }
    }
  };

  const groupedResources = resources.reduce((acc, res) => {
    const workshop = res.location || 'Без цеха';
    if (!acc[workshop]) acc[workshop] = [];
    acc[workshop].push(res);
    return acc;
  }, {});

  const filteredResources = searchQuery 
    ? resources.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : resources;

  const getQualityColor = (grade) => {
    const colors = {
      'премиум': 'var(--color-success)',
      'стандарт': 'var(--color-warning)',
      'эконом': 'var(--color-text-muted)'
    };
    return colors[grade] || 'var(--color-text-muted)';
  };

  const getStatusClass = (status) => {
    if (status === 'активен') return 'status-готов';
    if (status === 'на_обслуживании') return 'status-ожидание';
    return 'status-отклонён';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Оборудование и цеха</h1>
          <p>Мониторинг производственных мощностей и состояния станков</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <PrintActionButton onClick={printPage} label="Печать" />
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={16} />
            Добавить станок
          </button>
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="controls-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по названию станка..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box" style={{ flex: 1 }}>
          <MapPin size={15} className="filter-icon" />
          <select value={filterWorkshop} onChange={(e) => setFilterWorkshop(e.target.value)}>
            <option value="all">Все цеха</option>
            <option value="Цех №1">Цех №1</option>
            <option value="Цех №2">Цех №2</option>
          </select>
        </div>
        <div className="filter-box" style={{ flex: 1 }}>
          <Award size={15} className="filter-icon" />
          <select value={filterQuality} onChange={(e) => setFilterQuality(e.target.value)}>
            <option value="all">Все классы</option>
            <option value="премиум">Премиум</option>
            <option value="стандарт">Стандарт</option>
            <option value="эконом">Эконом</option>
          </select>
        </div>
      </div>

      {/* Сводка по цехам */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {Object.entries(groupedResources).map(([workshop, machines]) => {
          const activeCount = machines.filter(m => m.status === 'активен').length;
          const totalCapacity = machines.reduce((sum, m) => sum + m.capacity, 0);
          
          return (
            <div key={workshop} className="dashboard-card glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="user-avatar" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <Factory size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{workshop}</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{machines.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Станков</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success)' }}>{activeCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Активных</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalCapacity}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ед/ч</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Таблица станков */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loader-container">Загрузка оборудования...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Цех</th>
                  <th>Оборудование</th>
                  <th>Тип</th>
                  <th>Класс / Точность</th>
                  <th>Характеристики</th>
                  <th>Мощность</th>
                  <th>Статус</th>
                  <th className="no-print">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Оборудование не найдено</td></tr>
                ) : filteredResources.map(res => (
                  <tr key={res.id}>
                    <td>
                      <span className={`badge-status ${res.location === 'Цех №1' ? 'status-подтверждён' : 'status-готов'}`}>
                        {res.location || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{res.name}</div>
                      {res.notes && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{res.notes}</div>}
                    </td>
                    <td>{res.type}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge-status" style={{ 
                          border: `1px solid ${getQualityColor(res.quality_grade)}`,
                          color: getQualityColor(res.quality_grade),
                          background: 'transparent',
                          padding: '0.15rem 0.5rem'
                        }}>
                          {res.quality_grade}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          кл. {res.precision_grade}
                          {Array(res.precision_grade <= 4 ? 3 : 1).fill().map((_, i) => (
                            <Star key={i} size={10} fill="var(--color-warning)" color="var(--color-warning)" />
                          ))}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} /> {res.year_manufactured || '—'}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        {res.manufacturer || '—'}
                      </div>
                    </td>
                    <td>
                      <strong>{res.capacity}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ед/ч</span>
                    </td>
                    <td>
                      <span className={`badge-status ${getStatusClass(res.status)}`}>
                        {res.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="no-print">
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEdit(res)} title="Редактировать">
                          <Edit size={14} />
                        </button>
                        <button className="btn-icon danger" onClick={() => handleDelete(res.id)} title="Удалить">
                          <Trash2 size={14} />
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
        <ResourceModal 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchResources} 
        />
      )}
    </div>
  );
};

export default ResourcesPage;
