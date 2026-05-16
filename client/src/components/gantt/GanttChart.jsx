import React, { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
// Обертка для frappe-gantt, чтобы он нормально дружил с React
const GanttChart = ({ tasks }) => {
  const ganttContainer = useRef(null);
  const ganttInstance = useRef(null);

  useEffect(() => {
    // Если задач нет, библиотеку лучше не дергать, она падает
    if (!tasks || tasks.length === 0 || !ganttContainer.current) return;

    // Очищаем контейнер перед рендером
    ganttContainer.current.innerHTML = '';

    // Инициализация
    ganttInstance.current = new Gantt(ganttContainer.current, tasks, {
      view_mode: 'Day',
      language: 'ru',
      bar_height: 30,
      padding: 18,
      date_format: 'YYYY-MM-DD',
      custom_popup_html: function(task) {
        return `
          <div class="gantt-popup">
            <h4>${task.name}</h4>
            <p><strong>Начало:</strong> ${new Date(task.start).toLocaleDateString('ru-RU')}</p>
            <p><strong>Конец:</strong> ${new Date(task.end).toLocaleDateString('ru-RU')}</p>
            <p><strong>Прогресс:</strong> ${task.progress}%</p>
            <p><strong>Исполнитель:</strong> ${task.assigned || 'Не назначен'}</p>
          </div>
        `;
      }
    });

    return () => {
      // Очистка при размонтировании или смене задач
      if (ganttContainer.current) {
        ganttContainer.current.innerHTML = '';
      }
    };
  }, [tasks]);

  if (!tasks || tasks.length === 0) {
    return <div className="empty-gantt text-center py-4">Нет запущенных задач для отображения на графике</div>;
  }

  return (
    <div className="gantt-wrapper">
      <div ref={ganttContainer} className="gantt-target"></div>
    </div>
  );
};

export default GanttChart;
