import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Bell, User, LogOut, Search, UserCircle, Settings, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uiApi } from '../../api/ui';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchValue, setSearchValue]           = useState('');
  const [searchResults, setSearchResults]       = useState([]);
  const [searchLoading, setSearchLoading]       = useState(false);
  const [notifications, setNotifications]       = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen]       = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readNotifications') || '[]'); }
    catch { return []; }
  });

  const headerRef = useRef(null);

  /* ---- helpers ---- */
  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleLabel = (role) => ({
    'администратор':        'Администратор',
    'менеджер':             'Менеджер по продажам',
    'начальник_производства': 'Начальник производства',
    'мастер':               'Мастер участка',
    'кладовщик':            'Кладовщик',
  }[role] || role);

  /* ---- search debounce ---- */
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!searchValue.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const r = await uiApi.search(searchValue.trim());
        if (!cancelled) setSearchResults(r.results || []);
      } catch { if (!cancelled) setSearchResults([]); }
      finally  { if (!cancelled) setSearchLoading(false); }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchValue]);

  /* ---- notifications polling ---- */
  useEffect(() => {
    const fetch = async () => {
      try { const r = await uiApi.getNotifications(); setNotifications(r.notifications || []); }
      catch { setNotifications([]); }
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  /* ---- click-outside to close dropdowns ---- */
  useEffect(() => {
    const handle = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        if (!searchValue) setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [searchValue]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !readNotificationIds.includes(n.id)).length,
    [notifications, readNotificationIds]
  );

  const handleSelectResult = (link) => {
    setSearchValue('');
    setSearchResults([]);
    navigate(link);
  };

  const handleMarkAllRead = () =>
    setReadNotificationIds(notifications.map(n => n.id));

  return (
    <header className="top-header" ref={headerRef}>
      {/* ── SEARCH ── */}
      <div className="search-input-wrapper">
        {/* Icon rendered as a plain span so it gets position:absolute from CSS */}
        <span className="search-icon">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Поиск заказа (ЗК-2026-...)"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <div className="search-dropdown">
            {searchLoading ? (
              <div className="dropdown-empty">Поиск…</div>
            ) : searchResults.length === 0 ? (
              <div className="dropdown-empty">Ничего не найдено</div>
            ) : searchResults.map(item => (
              <button
                key={item.id}
                className="dropdown-item"
                onClick={() => handleSelectResult(item.link)}
              >
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="header-actions">

        {/* Theme toggle */}
        <button
          className="action-button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="action-button"
            onClick={() => { setIsNotificationsOpen(p => !p); setIsProfileOpen(false); }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge">{Math.min(unreadCount, 9)}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="header-dropdown notifications-dropdown">
              <div className="dropdown-header">
                <h4>Уведомления</h4>
                <button className="btn-link" onClick={handleMarkAllRead}>Прочитать все</button>
              </div>
              {notifications.length === 0 ? (
                <div className="dropdown-empty">Новых уведомлений нет</div>
              ) : notifications.map(item => (
                <button
                  key={item.id}
                  className={`dropdown-item${readNotificationIds.includes(item.id) ? ' is-read' : ''}`}
                  onClick={() => {
                    if (!readNotificationIds.includes(item.id))
                      setReadNotificationIds(p => [...p, item.id]);
                    navigate(item.link);
                    setIsNotificationsOpen(false);
                  }}
                >
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile */}
        <div style={{ position: 'relative' }}>
          <button
            className="user-profile"
            onClick={() => { setIsProfileOpen(p => !p); setIsNotificationsOpen(false); }}
          >
            <div className="user-avatar"><User size={18} /></div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Пользователь'}</span>
              <span className="user-role">{getRoleLabel(user?.role)}</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="header-dropdown profile-dropdown">
              <div className="dropdown-item static">
                <UserCircle size={15} />
                <span>{user?.email || 'Email не указан'}</span>
              </div>
              <button
                className="dropdown-item"
                onClick={() => navigate(user?.role === 'администратор' ? '/admin' : '/dashboard')}
              >
                <Settings size={15} />
                <span>{user?.role === 'администратор' ? 'Управление пользователями' : 'Мой профиль'}</span>
              </button>
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} />
                <span>Выйти из системы</span>
              </button>
            </div>
          )}
        </div>

        {/* Logout shortcut */}
        <button className="action-button logout" onClick={handleLogout} title="Выйти">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
