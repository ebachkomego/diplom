import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Archive, 
  Activity, 
  Settings,
  BarChart2,
  Wrench,
  LineChart,
  ArrowRightLeft
} from 'lucide-react';

const Sidebar = () => {
  const { hasRole } = useContext(AuthContext);

  const navItems = [
    { path: '/dashboard', label: 'Дашборд', icon: Home, roles: ['администратор', 'менеджер', 'начальник_производства', 'мастер', 'кладовщик'] },
    { path: '/orders', label: 'Заказы', icon: ShoppingCart, roles: ['администратор', 'менеджер', 'начальник_производства'] },
    { path: '/production', label: 'Производство', icon: Activity, roles: ['администратор', 'начальник_производства', 'мастер'] },
    { path: '/warehouse', label: 'Склад', icon: Archive, roles: ['администратор', 'начальник_производства', 'кладовщик'] },
    { path: '/products', label: 'Продукция', icon: Package, roles: ['администратор', 'менеджер', 'начальник_производства'] },
    { path: '/customers', label: 'Клиенты', icon: Users, roles: ['администратор', 'менеджер'] },
    { path: '/resources', label: 'Оборудование', icon: Wrench, roles: ['администратор', 'начальник_производства', 'мастер'] },
    { path: '/transfers', label: 'Передачи между цехами', icon: ArrowRightLeft, roles: ['администратор', 'начальник_производства', 'мастер', 'кладовщик'] },
    { path: '/reports', label: 'Отчёты', icon: BarChart2, roles: ['администратор', 'менеджер', 'начальник_производства'] },
    { path: '/reports/builder', label: 'Конструктор графиков', icon: LineChart, roles: ['администратор', 'менеджер', 'начальник_производства'] },
    { path: '/admin', label: 'Пользователи', icon: Settings, roles: ['администратор'] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-small">
          <Activity size={24} />
        </div>
        <h2>Планирование производственных заказов "ОАО ТАиМ"</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (!hasRole(item.roles)) return null;
          
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot"></span>
          <span>Система онлайн</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
