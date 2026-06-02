import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Shield, User as UserIcon, UserCog } from 'lucide-react';
import UserModal from './UserModal';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printPage = usePagePrint('Управление пользователями');

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      alert('Нет доступа к админке');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (id, isActive) => {
    try {
      await apiClient.patch(`/users/${id}/toggle`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || 'Ошибка');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Точно удалить юзера? Эту операцию нельзя отменить.')) {
      try {
        await apiClient.delete(`/users/${id}`);
        fetchUsers();
      } catch (e) {
        alert(e.response?.data?.error || 'Ошибка');
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'администратор': 'Администратор',
      'менеджер': 'Менеджер',
      'начальник_производства': 'Нач. производства',
      'мастер': 'Мастер участка',
      'кладовщик': 'Кладовщик'
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'администратор') return 'status-подтверждён';
    if (role === 'менеджер') return 'status-новый';
    if (role === 'начальник_производства') return 'status-в-производстве';
    return 'status-ожидание';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Администрирование</h1>
          <p>Управление доступом и пользователями системы</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <PrintActionButton onClick={printPage} label="Печать" />
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} />
            Добавить пользователя
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? <div className="loader-container">Загрузка пользователей...</div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>ФИО</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th className="no-print">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32 }}>
                          <UserIcon size={16} />
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{u.username}</div>
                      </div>
                    </td>
                    <td>{u.full_name}</td>
                    <td>
                      <span className={`badge-status ${getRoleBadgeClass(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? 
                        <span className="badge-status status-готов">Активен</span> : 
                        <span className="badge-status status-отклонён">Заблокирован</span>
                      }
                    </td>
                    <td className="no-print">
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title={u.is_active ? "Заблокировать" : "Разблокировать"} 
                          onClick={() => handleToggle(u.id, u.is_active)}
                        >
                          {u.is_active ? 
                            <ToggleRight size={18} style={{ color: 'var(--color-success)' }} /> : 
                            <ToggleLeft size={18} style={{ color: 'var(--color-danger)' }} />
                          }
                        </button>
                        <button className="btn-icon danger" title="Удалить" onClick={() => handleDelete(u.id)}>
                          <Trash2 size={16} />
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
        <UserModal onClose={() => setIsModalOpen(false)} onSave={fetchUsers} />
      )}
    </div>
  );
};

export default AdminPage;
