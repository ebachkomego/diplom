import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/catalogs';
import { Search, Package, Plus, Edit, Trash2 } from 'lucide-react';
import ProductModal from './ProductModal';
import PrintActionButton from '../components/ui/PrintActionButton';
import { usePagePrint } from '../hooks/usePagePrint';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const printPage = usePagePrint('Справочник продукции');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({ search });
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки справочника', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
    if (window.confirm("Действительно удалить позицию? Если она используется в заказах, удаление будет заблокировано.")) {
      try {
        await productsApi.delete(id);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.error || "Ошибка удаления");
      }
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header flex-between">
        <div>
          <h1>Справочник продукции</h1>
          <p>Номенклатура производимых изделий</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <PrintActionButton onClick={printPage} label="Печать продукции" />
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={16} />
            Добавить позицию
          </button>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по названию или артикулу..." 
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
                <th>Артикул</th>
                <th>Наименование</th>
                <th>Категория</th>
                <th>Ед. изм.</th>
                <th>Цена (BYN)</th>
                <th>Время пр-ва (ч)</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">Нет данных</td></tr>
              ) : products.map(product => (
                <tr key={product.id}>
                  <td className="font-medium text-primary">{product.article}</td>
                  <td>{product.name}</td>
                  <td>{product.category || 'Не указана'}</td>
                  <td>{product.unit}</td>
                  <td>{product.price}</td>
                  <td>{product.production_time_hours}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleEdit(product)}><Edit size={16}/></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(product.id)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchProducts} 
        />
      )}
    </div>
  );
};

export default ProductsPage;
