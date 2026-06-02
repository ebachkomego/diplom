import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import KPICard from '../components/ui/KPICard';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';
import {
  ArrowRightLeft, Factory, CheckCircle, Clock, Truck,
  AlertCircle, Package, User, Calendar, Filter, RefreshCw, MapPin
} from 'lucide-react';

const TransfersPage = () => {
  const [transfers, setTransfers]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const printPage = usePagePrint('Передачи между цехами');

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const [transfersRes, statsRes] = await Promise.all([
        apiClient.get('/transfers', { params }),
        apiClient.get('/transfers/stats'),
      ]);
      setTransfers(transfersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки передач', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, [filterStatus]);

  const handleTransfer = async (id) => {
    if (!window.confirm('Отметить как отправленное в цех?')) return;
    try { await apiClient.patch(`/transfers/${id}/transfer`); fetchTransfers(); }
    catch (err) { alert(err.response?.data?.error || 'Ошибка'); }
  };

  const handleReceive = async (id) => {
    if (!window.confirm('Подтвердить получение в цехе?')) return;
    try { await apiClient.patch(`/transfers/${id}/receive`); fetchTransfers(); }
    catch (err) { alert(err.response?.data?.error || 'Ошибка'); }
  };

  const getStatusBadge = (status) => {
    const map = {
      'в_ожидании': { cls: 'status-ожидание',  label: 'В ожидании' },
      'в_пути':     { cls: 'status-в-работе',   label: 'В пути'     },
      'принято':    { cls: 'status-завершено',   label: 'Принято'    },
      'отклонено':  { cls: 'status-отклонён',    label: 'Отклонено'  },
    };
    const s = map[status] || { cls: '', label: status };
    return <span className={`badge-status ${s.cls}`}>{s.label}</span>;
  };

  const byStatus = transfers.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Передачи между цехами</h1>
          <p>Отслеживание перемещения деталей и узлов между Цехом №1 и Цехом №2</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={fetchTransfers}>
            <RefreshCw size={16} /> Обновить
          </button>
          <PrintActionButton onClick={printPage} label="Печать" />
        </div>
      </div>

      {/* KPI Grid — use standard KPICard component */}
      <div className="kpi-grid">
        <KPICard title="Всего передач"  value={transfers.length}              icon={Package}      colorClass="primary" />
        <KPICard title="В ожидании"     value={byStatus['в_ожидании'] || 0}  icon={Clock}        colorClass="warning" />
        <KPICard title="В пути"         value={byStatus['в_пути'] || 0}      icon={Truck}        colorClass="info"    />
        <KPICard title="Принято"        value={byStatus['принято'] || 0}     icon={CheckCircle}  colorClass="success" />
      </div>

      {/* Filters */}
      <div className="controls-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-box">
          <Filter size={16} className="filter-icon" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Все статусы</option>
            <option value="в_ожидании">В ожидании</option>
            <option value="в_пути">В пути</option>
            <option value="принято">Принято</option>
            <option value="отклонено">Отклонено</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loader-container">Загрузка передач...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Статус</th>
                  <th>Маршрут</th>
                  <th>Деталь / Узел</th>
                  <th>Кол-во</th>
                  <th>Заказ</th>
                  <th>Даты</th>
                  <th>Ответственные</th>
                  <th className="no-print">Действия</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Нет передач</td></tr>
                ) : transfers.map(t => (
                  <tr key={t.id}>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge-status status-подтверждён">
                          <Factory size={11} style={{ marginRight: 3 }} />{t.from_workshop}
                        </span>
                        <ArrowRightLeft size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        <span className="badge-status status-готов">
                          <Factory size={11} style={{ marginRight: 3 }} />{t.to_workshop}
                        </span>
                      </div>
                      {t.from_resource_name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {t.from_resource_name} → {t.to_resource_name || '—'}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.part_name}</td>
                    <td><strong>{t.quantity}</strong> шт.</td>
                    <td>
                      {t.order_number && (
                        <span className="badge-status status-новый">{t.order_number}</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>
                      {t.transfer_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} /> {new Date(t.transfer_date).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                      {t.receive_date && (
                        <div style={{ color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={12} /> {new Date(t.receive_date).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={12} /> {t.transferred_by_name || '—'}
                      </div>
                      {t.received_by_name && (
                        <div style={{ color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={12} /> {t.received_by_name}
                        </div>
                      )}
                    </td>
                    <td className="no-print">
                      <div className="action-buttons">
                        {t.status === 'в_ожидании' && (
                          <button className="btn-icon" onClick={() => handleTransfer(t.id)} title="Отправить">
                            <Truck size={15} />
                          </button>
                        )}
                        {t.status === 'в_пути' && (
                          <button className="btn-icon" style={{ color: 'var(--color-success)' }} onClick={() => handleReceive(t.id)} title="Принять">
                            <CheckCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Route stats */}
      {stats?.routes?.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} /> Статистика по маршрутам
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {stats.routes.map((route, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-hover)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
                  <Factory size={13} style={{ color: 'var(--color-primary)' }} /> {route.from}
                  <ArrowRightLeft size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <Factory size={13} style={{ color: 'var(--color-success)' }} /> {route.to}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  {Object.entries(route.counts).map(([status, count]) => (
                    <span key={status} style={{ color: 'var(--color-text-muted)' }}>
                      {status}: <strong style={{ color: 'var(--color-text-main)' }}>{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
