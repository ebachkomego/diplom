import React, { useState, useEffect } from 'react';
import { productionApi } from '../api/production';
import GanttChart from '../components/gantt/GanttChart';
import { Play, CheckCircle, AlertTriangle } from 'lucide-react';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';
import '../styles/gantt-custom.css'; // Наши стили поверх frappe

const ProductionPage = () => {
  const [tasks, setTasks] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printPage = usePagePrint('План производства');

  // Загружаем инфу о задачах и данные для графика параллельно
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, ganttRes] = await Promise.all([
        productionApi.getTasks({}),
        productionApi.getGanttData()
      ]);
      const normalizedTasks = Array.isArray(tasksRes) ? tasksRes : [];
      setTasks(normalizedTasks);

      // Чтобы frappe-gantt не ругался на отсутствие дат или битые даты, фильтруем данные
      const validGantt = (Array.isArray(ganttRes) ? ganttRes : []).filter(
        (task) => task.start && task.end && !Number.isNaN(new Date(task.start).getTime()) && !Number.isNaN(new Date(task.end).getTime())
      );
      setGanttData(validGantt);
    } catch (error) {
      console.error('Ошибка загрузки производства', error);
      setError(error.response?.data?.error || 'Не удалось загрузить производственные данные');
      setTasks([]);
      setGanttData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Перевод задачи в следующий статус
  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'ожидание') nextStatus = 'в_работе';
    else if (currentStatus === 'в_работе') nextStatus = 'завершено';
    else return;

    try {
      await productionApi.updateStatus(id, nextStatus);
      fetchData(); // обновляем всё после смены статуса
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка смены статуса');
    }
  };

  const renderDateRange = (task) => {
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 'Даты не указаны';
    }
    return `${startDate.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}`;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>План производства</h1>
          <p>Оперативное управление и контроль загрузки</p>
        </div>
        <PrintActionButton onClick={printPage} label="Печать плана" />
      </div>

      {/* График Ганта */}
      <div className="glass-panel dashboard-card mb-4" style={{ marginBottom: '2rem' }}>
        <h3>Диаграмма загрузки</h3>
        {error && (
          <div className="alert-box error" style={{ marginBottom: '1rem' }}>
            <div className="alert-icon"><AlertTriangle size={18} /></div>
            <div className="alert-content">
              <h4>Проблема загрузки</h4>
              <p>{error}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="loader-container">Загрузка плана...</div>
        ) : ganttData.length === 0 ? (
          <div className="loader-container">Нет данных для диаграммы</div>
        ) : (
          <GanttChart tasks={ganttData} />
        )}
      </div>

      {/* Таблица текущих заданий */}
      <div className="glass-panel dashboard-card">
        <h3>Очередь заданий</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Продукция</th>
                <th>Кол-во</th>
                <th>Статус</th>
                <th>Сроки</th>
                <th>Исполнитель</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && !loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "1.5rem" }}>Нет активных заданий</td></tr>
              ) : tasks.map(task => (
                <tr key={task.id}>
                  <td className="font-medium text-primary">{task.order_number}</td>
                  <td>{task.product_name}</td>
                  <td>{task.quantity} шт.</td>
                  <td>
                    <span className={`badge-status status-${task.status.replace(/_/g, '-')}`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{renderDateRange(task)}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                    {task.assigned_name || 'Не назначен'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {task.status === 'ожидание' && (
                        <button className="btn-primary" onClick={() => handleStatusChange(task.id, task.status)}>
                          <Play size={14} /> В работу
                        </button>
                      )}
                      {task.status === 'в_работе' && (
                        <button className="btn-primary" onClick={() => handleStatusChange(task.id, task.status)}
                          style={{ background: 'linear-gradient(135deg, var(--color-success), #059669)' }}>
                          <CheckCircle size={14} /> Завершить
                        </button>
                      )}
                      {task.status === 'завершено' && (
                        <button className="btn-outline" disabled style={{ opacity: 0.5 }}>
                          Завершено
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionPage;
