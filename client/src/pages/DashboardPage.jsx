import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import KPICard from '../components/ui/KPICard';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';
import { chartBuilderApi } from '../api/chartBuilder';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Settings, 
  CheckCircle, 
  CircleDollarSign,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const printPage = usePagePrint('Дашборд');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/reports/dashboard');
        
        let dynamicsData = [];
        try {
          const dynamicsResponse = await apiClient.get('/reports/orders-dynamics');
          dynamicsData = dynamicsResponse.data;
        } catch (dynError) {
          console.warn("Динамика заказов недоступна для текущей роли");
        }
        
        setData({
          ...response.data,
          dynamics: dynamicsData
        });
        
        let savedTemplates = [];
        try {
          savedTemplates = await chartBuilderApi.getTemplates();
        } catch (tmplError) {
          console.warn("Шаблоны графиков недоступны для текущей роли");
        }
        setTemplates(savedTemplates);
      } catch (error) {
        console.error("Ошибка загрузки дашборда", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !data) return <div className="loader-container">Загрузка данных...</div>;

  const { kpi, recent_orders, urgent_orders, low_stock } = data;

  const formatCurrency = (val, showDecimals = true) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'BYN',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(val);
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Планирование производственных заказов "ОАО ТАиМ"</h1>
          <p>Сводная панель показателей и мониторинг состояния системы</p>
        </div>
        <PrintActionButton onClick={printPage} label="Печать отчёта" />
      </div>

      {/* KPI-карточки — 4 колонки в ряд по умолчанию */}
      <div className="kpi-grid">
        <KPICard 
          title="Всего заказов" 
          value={kpi.total_orders} 
          icon={ShoppingCart} 
          colorClass="primary" 
        />
        <KPICard 
          title="В производстве" 
          value={kpi.in_production} 
          icon={Settings} 
          colorClass="warning" 
        />
        <KPICard 
          title="Выполнено за месяц" 
          value={kpi.completed_this_month} 
          icon={CheckCircle} 
          colorClass="success" 
        />
        <KPICard 
          title="Выручка (завершено)" 
          value={formatCurrency(kpi.total_revenue, false)} 
          icon={CircleDollarSign} 
          colorClass="info" 
        />
      </div>

      <div className="dashboard-grid">
        {/* График динамики */}
        <div className="dashboard-card glass-panel">
          <div className="card-header">
            <h3>Динамика заказов (сумма)</h3>
          </div>
          <div className="chart-wrapper">
            {data.dynamics && data.dynamics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dynamics}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-solid)" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`} 
                  />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert-empty">
                <p>Нет данных для отображения динамики</p>
              </div>
            )}
          </div>
        </div>

        {/* Уведомления и алерты */}
        <div className="dashboard-card glass-panel">
          <div className="card-header">
            <h3>Уведомления и алерты</h3>
          </div>
          <div className="alerts-list">
            {low_stock.length > 0 && (
              <div className="alert-box error">
                <div className="alert-icon"><AlertTriangle size={20} /></div>
                <div className="alert-content">
                  <h4>Критические остатки материалов</h4>
                  <ul className="alert-items">
                    {low_stock.map((item, idx) => (
                      <li key={idx}>
                        {item.name} ({item.article}) — осталось {item.quantity - item.reserved} {item.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {urgent_orders.length > 0 && (
              <div className="alert-box warning">
                <div className="alert-icon"><Clock size={20} /></div>
                <div className="alert-content">
                  <h4>Приближаются сроки дедлайнов</h4>
                  <ul className="alert-items">
                    {urgent_orders.map(order => (
                      <li key={order.id}>
                        {order.order_number} ({order.customer_name}) — {new Date(order.planned_date).toLocaleDateString('ru-RU')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {low_stock.length === 0 && urgent_orders.length === 0 && (
              <div className="alert-empty">
                <CheckCircle className="text-success" size={32} />
                <p>Все показатели в норме, активных угроз нет.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица последних заказов */}
      <div className="dashboard-card glass-panel full-width" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Последние поступившие заказы</h3>
          <button className="btn-outline" onClick={() => navigate('/orders')}>
            Посмотреть все <ExternalLink size={14} style={{ marginLeft: 6 }} />
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Номер заказа</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Сумма</th>
                <th>Дедлайн</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Заказов пока нет</td></tr>
              ) : recent_orders.map(order => (
                <tr key={order.id}>
                  <td className="font-medium text-primary">{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>
                    <span className={`badge-status status-${order.status.replace(/_/g, '-')}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-priority priority-${order.priority}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="font-medium">{formatCurrency(order.total_cost)}</td>
                  <td>{order.planned_date ? new Date(order.planned_date).toLocaleDateString('ru-RU') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Шаблоны */}
      <div className="dashboard-card glass-panel full-width" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Мои шаблоны графиков</h3>
          <button className="btn-outline no-print" onClick={() => navigate('/reports/builder')}>
            В конструктор
          </button>
        </div>
        {templates.length === 0 ? (
          <div className="alert-empty">
            <p>Нет сохраненных шаблонов. Создайте первый в конструкторе графиков.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Название шаблона</th>
                  <th>Тип доступа</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {templates.slice(0, 5).map((template) => (
                  <tr key={template.id}>
                    <td style={{ fontWeight: 600 }}>{template.name}</td>
                    <td>
                      <span className="badge-status status-ожидание" style={{ textTransform: 'capitalize' }}>
                        {template.scope}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => navigate('/reports/builder')} title="Редактировать">
                        <Settings size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
