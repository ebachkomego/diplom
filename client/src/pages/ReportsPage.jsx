import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, TrendingUp, Cpu, AlertCircle } from 'lucide-react';

const ReportsPage = () => {
  const [resourceLoad, setResourceLoad] = useState([]);
  const [planFact, setPlanFact] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const printPage = usePagePrint('Отчеты и аналитика');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [resLoad, pf] = await Promise.all([
          apiClient.get('/reports/resource-load'),
          apiClient.get('/reports/plan-fact')
        ]);
        setResourceLoad(resLoad.data);
        setPlanFact(pf.data);
      } catch (error) {
        console.error('Ошибка загрузки отчетов', error);
        const msg = error.response?.data?.error || error.message || 'Неизвестная ошибка';
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1><PieChart size={24} style={{ marginRight: '0.6rem', verticalAlign: 'middle' }} />Отчёты и аналитика</h1>
          <p>Сводные данные производства (План/Факт и загрузка оборудования)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary no-print" onClick={() => navigate('/reports/builder')}>
            <TrendingUp size={16} />
            Конструктор графиков
          </button>
          <PrintActionButton onClick={printPage} />
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid var(--color-danger)', borderRadius: '8px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* График План-Факт */}
        <div className="glass-panel dashboard-card">
          <div className="card-header">
            <h3>План-факт выпуска продукции</h3>
          </div>
          {loading ? <div className="loader-container">Формирование отчета...</div> : (
            <div className="chart-wrapper" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planFact} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-solid)" opacity={0.5} />
                  <XAxis 
                    dataKey="product_name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="planned_qty" name="План (шт.)" fill="var(--color-info)" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="actual_qty" name="Факт (шт.)" fill="var(--color-success)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Таблица загрузки оборудования */}
        <div className="glass-panel dashboard-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3><Cpu size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Текущая загрузка оборудования</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Оборудование</th>
                  <th>Тип</th>
                  <th>Мощность</th>
                  <th>Задач в очереди</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {resourceLoad.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Нет данных о загрузке</td></tr>
                ) : resourceLoad.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{r.name}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{r.type.replace(/_/g, ' ')}</td>
                    <td>{r.capacity} ед/ч</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '100%', 
                          maxWidth: '100px', 
                          height: '6px', 
                          background: 'var(--color-bg-hover)', 
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${Math.min((r.active_tasks / r.capacity) * 100, 100)}%`, 
                            height: '100%', 
                            background: r.active_tasks > r.capacity ? 'var(--color-danger)' : 'var(--color-success)' 
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, minWidth: '20px' }}>{r.active_tasks}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${r.status === 'активен' ? 'status-готов' : 'status-ожидание'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
