import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart, LineChart, PieChart, CartesianGrid, XAxis, YAxis, Tooltip, 
  Legend, ResponsiveContainer, Bar, Line, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { chartBuilderApi } from '../api/chartBuilder';
import { 
  Settings2, Save, Play, Trash2, History, Layout, 
  BarChart2, TrendingUp, PieChart as PieChartIcon 
} from 'lucide-react';

const chartColors = [
  'var(--color-primary)', 
  'var(--color-success)', 
  'var(--color-warning)', 
  'var(--color-danger)', 
  'var(--color-info)', 
  '#8b5cf6'
];

const ChartBuilderPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [config, setConfig] = useState({
    source: '',
    dimension: '',
    metric: '',
    aggregation: 'sum',
    chartType: 'bar',
    filters: {}
  });
  const [series, setSeries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templateScope, setTemplateScope] = useState('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNotInitialized, setIsNotInitialized] = useState(false);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await chartBuilderApi.getDatasets();
        const list = response.datasets || [];
        setDatasets(list);
        if (list.length > 0) {
          const first = list[0];
          setConfig((prev) => ({
            ...prev,
            source: first.id,
            dimension: first.dimensions[0]?.key || '',
            metric: first.metrics[0]?.key || ''
          }));
        }
      } catch (fetchError) {
        setError(fetchError.response?.data?.error || 'Не удалось загрузить источники данных');
      }
    };
    fetchDatasets();
    chartBuilderApi.getTemplates()
      .then(setTemplates)
      .catch((err) => {
        if (err.response?.status === 503) {
          setIsNotInitialized(true);
        }
        setTemplates([]);
      });
  }, []);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await chartBuilderApi.initializeStorage();
      setIsNotInitialized(false);
      const latest = await chartBuilderApi.getTemplates();
      setTemplates(latest);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка инициализации хранилища');
    } finally {
      setLoading(false);
    }
  };

  const selectedDataset = useMemo(
    () => datasets.find((item) => item.id === config.source),
    [datasets, config.source]
  );

  const handleBuild = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await chartBuilderApi.query(config);
      setSeries(response.data || []);
    } catch (queryError) {
      setSeries([]);
      setError(queryError.response?.data?.error || 'Ошибка построения графика');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Укажите название шаблона для сохранения');
      return;
    }
    try {
      await chartBuilderApi.createTemplate({
        name: templateName.trim(),
        config,
        scope: templateScope,
        role: templateScope === 'role' ? 'менеджер' : null
      });
      const latest = await chartBuilderApi.getTemplates();
      setTemplates(latest);
      setTemplateName('');
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Не удалось сохранить шаблон');
    }
  };

  const renderChart = () => {
    if (!series.length) {
      return (
        <div className="alert-empty" style={{ height: '100%' }}>
          <Layout size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>Настройте параметры и нажмите "Сформировать отчет"</p>
        </div>
      );
    }

    const commonProps = {
      data: series,
      margin: { top: 20, right: 30, left: 10, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-main)' }}>{label}</p>
            <p style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {config.metric}: {payload[0].value.toLocaleString()}
            </p>
          </div>
        );
      }
      return null;
    };

    if (config.chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-solid)" opacity={0.5} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={series} 
              dataKey="value" 
              nameKey="label" 
              cx="50%" 
              cy="50%" 
              innerRadius={60}
              outerRadius={100} 
              paddingAngle={5}
              label
            >
              {series.map((item, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-solid)" opacity={0.5} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1><Settings2 size={24} style={{ marginRight: '0.6rem', verticalAlign: 'middle' }} />Конструктор графиков</h1>
          <p>Интеллектуальный анализ производственных данных</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '350px 1fr', alignItems: 'start' }}>
        {/* Боковая панель настроек */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={18} /> Параметры отчета
          </h3>
          
          <div className="form-group">
            <label>Источник данных</label>
            <select
              value={config.source}
              onChange={(event) => {
                const next = datasets.find((item) => item.id === event.target.value);
                setConfig((prev) => ({
                  ...prev,
                  source: event.target.value,
                  dimension: next?.dimensions[0]?.key || '',
                  metric: next?.metrics[0]?.key || ''
                }));
              }}
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>{dataset.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Группировка (X)</label>
            <select
              value={config.dimension}
              onChange={(event) => setConfig((prev) => ({ ...prev, dimension: event.target.value }))}
            >
              {(selectedDataset?.dimensions || []).map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Метрика (Y)</label>
            <select
              value={config.metric}
              onChange={(event) => setConfig((prev) => ({ ...prev, metric: event.target.value }))}
            >
              {(selectedDataset?.metrics || []).map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Агрегация</label>
              <select
                value={config.aggregation}
                onChange={(event) => setConfig((prev) => ({ ...prev, aggregation: event.target.value }))}
              >
                <option value="sum">Сумма</option>
                <option value="count">Кол-во</option>
                <option value="avg">Среднее</option>
              </select>
            </div>
            <div className="form-group">
              <label>Тип</label>
              <select
                value={config.chartType}
                onChange={(event) => setConfig((prev) => ({ ...prev, chartType: event.target.value }))}
              >
                <option value="bar">Столбцы</option>
                <option value="line">Линии</option>
                <option value="pie">Круг</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleBuild} disabled={loading}>
            <Play size={16} /> {loading ? 'Формирование...' : 'Сформировать отчет'}
          </button>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />

          <div className="form-group">
            <label>Название шаблона</label>
            <input
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Мой отчет по продажам..."
            />
          </div>

          <div className="form-group">
            <label>Уровень доступа</label>
            <select value={templateScope} onChange={(event) => setTemplateScope(event.target.value)}>
              <option value="private">Личный</option>
              <option value="role">Для моей роли</option>
              <option value="public">Общий</option>
            </select>
          </div>

          <button className="btn-outline" style={{ width: '100%' }} onClick={handleSaveTemplate}>
            <Save size={16} /> Сохранить в шаблоны
          </button>
        </div>

        {/* Основная область графика */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div className="alert-box error">{error}</div>}
          
          <div className="glass-panel chart-container" style={{ height: '450px', padding: '1.5rem' }}>
            {isNotInitialized ? (
              <div className="alert-empty" style={{ height: '100%' }}>
                <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>Хранилище не инициализировано</h3>
                <p style={{ marginBottom: '1.5rem' }}>Для сохранения и использования шаблонов необходимо подготовить базу данных.</p>
                <button className="btn-primary" onClick={handleInitialize} disabled={loading}>
                  {loading ? 'Инициализация...' : 'Инициализировать хранилище'}
                </button>
              </div>
            ) : (
              <div className="chart-wrapper" style={{ height: '100%' }}>
                {renderChart()}
              </div>
            )}
          </div>

          {/* История шаблонов */}
          {templates.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} /> Сохраненные шаблоны
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {templates.map((item) => (
                  <div 
                    key={item.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '0.75rem', 
                      cursor: 'pointer', 
                      transition: 'transform 0.2s',
                      background: 'var(--color-bg-hover)',
                      borderColor: 'var(--color-border-solid)'
                    }}
                    onClick={() => {
                      const parsedConfig = typeof item.config_json === 'string' ? JSON.parse(item.config_json) : item.config_json;
                      setConfig(parsedConfig);
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      Доступ: {item.scope}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartBuilderPage;
