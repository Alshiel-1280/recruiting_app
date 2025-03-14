import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    email: '',
    phone_number: '',
    hire_date: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('この社員情報を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // 削除成功後、リストを更新
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError(error.message);
      }
    }
  };

  const handleSort = (field) => {
    // 同じフィールドをクリックした場合は並び順を反転
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('氏名は必須です');
      return;
    }
    
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      // 成功したらフォームをリセットして再取得
      setFormData({
        name: '',
        department: '',
        position: '',
        email: '',
        phone_number: '',
        hire_date: ''
      });
      setShowAddForm(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error.message);
    }
  };

  // 検索、ソート処理
  const filteredAndSortedEmployees = employees
    .filter(employee => {
      // 検索フィルタリング
      return (
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone_number?.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      // ソート処理
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;
      
      const valueA = a[sortField].toString().toLowerCase();
      const valueB = b[sortField].toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div>
      <h2>社員一覧</h2>
      
      <div className="filters" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="名前、部署、役職、メール、電話番号で検索"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: showAddForm ? '#f44336' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {showAddForm ? '追加フォームを閉じる' : '新規社員追加'}
        </button>
      </div>
      
      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>社員情報追加</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>氏名: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            
            <div>
              <label htmlFor="department" style={{ display: 'block', marginBottom: '5px' }}>部署:</label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label htmlFor="position" style={{ display: 'block', marginBottom: '5px' }}>役職:</label>
              <input
                type="text"
                id="position"
                value={formData.position}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>メールアドレス:</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" style={{ display: 'block', marginBottom: '5px' }}>電話番号:</label>
              <input
                type="tel"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label htmlFor="hire_date" style={{ display: 'block', marginBottom: '5px' }}>入社日:</label>
              <input
                type="date"
                id="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="submit" 
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                社員を追加
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}
>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                氏名 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('department')}>
                部署 {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
  
            <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('position')}>
                役職 {sortField === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>連絡先</th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('hire_date')}>
                入社日 {sortField === 'hire_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>KPI</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEmployees.length > 0 ? (
              filteredAndSortedEmployees.map((employee) => (
                <tr key={employee.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{employee.name}</td>
                  <td style={{ padding: '12px' }}>{employee.department}</td>
                  <td style={{ padding: '12px' }}>{employee.position}</td>
                  <td style={{ padding: '12px' }}>
                    {employee.email}<br />
                    {employee.phone_number}
                  </td>
                  <td style={{ padding: '12px' }}>{employee.hire_date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <Link to={`/employees/${employee.id}/kpi`} style={{
                      padding: '5px 10px',
                      backgroundColor: '#9C27B0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}>
                      KPI管理
                    </Link>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => alert('社員詳細ページは開発中です')}
                      style={{ 
                        marginRight: '5px', 
                        padding: '5px 10px', 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      詳細
                    </button>
                    <button 
                      onClick={() => handleDelete(employee.id)}
                      style={{ 
                        padding: '5px 10px', 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '12px', textAlign: 'center' }}>
                  社員情報が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeesList;