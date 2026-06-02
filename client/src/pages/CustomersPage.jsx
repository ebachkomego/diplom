import React, { useState, useEffect } from 'react';
import { customersApi } from '../api/catalogs';
import { Search, Users, Plus, Edit, Trash2 } from 'lucide-react';
import CustomerModal from './CustomerModal';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const printPage = usePagePrint('Справочник клиентов');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersApi.getAll({ search });
      setCustomers(data);
    } catch (err) {
      console.error('Ошибка загрузки клиентов', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить контрагента? Удаление невозможно, если с ним связаны заказы.")) {
      try {
        await customersApi.delete(id);
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.error || "Ошибка удаления");
      }
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Справочник клиентов</h1>
          <p>Контрагенты и заказчики ОАО «ТАиМ»</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <PrintActionButton onClick={printPage} label="Печать клиентов" />
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={16} />
            Добавить контрагента
          </button>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по наименованию или ИНН..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel table-container">
        {loading ? (
          <div className="loader-container">Синхронизация...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>УНП / ИНН</th>
                <th>Контактное лицо</th>
                <th>Телефон</th>
                <th>Email</th>
                <th className="no-print">Действия</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">Нет контрагентов</td></tr>
              ) : customers.map(c => (
                <tr key={c.id}>
                  <td className="font-medium text-primary">{c.name}</td>
                  <td>{c.inn}</td>
                  <td>{c.contact_person}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td className="no-print">
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleEdit(c)}><Edit size={16}/></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(c.id)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <CustomerModal 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchCustomers} 
        />
      )}
    </div>
  );
};

export default CustomersPage;
