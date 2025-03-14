import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function PhoneCallsList() {
  const [phoneCalls, setPhoneCalls] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('call_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    applicant_id: '',
    employee_id: '',
    call_date: new Date().toISOString().slice(0, 16),
    status: 'scheduled',
    notes: '',
    follow_up_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 架電記録データを取得
      const phoneCallsResponse = await fetch('/api/phone-calls');
      if (!phoneCallsResponse.ok) {
        throw new Error(`API error: ${phoneCallsResponse.status}`);
      }
      const phoneCallsData = await phoneCallsResponse.json();
      setPhoneCalls(phoneCallsData);
      
      // 求職者データを取得
      const applicantsResponse = await fetch('/api/applicants');
      if (!applicantsResponse.ok) {
        throw new Error(`API error: ${applicantsResponse.status}`);
      }
      const applicantsData = await applicantsResponse.json();
      setApplicants(applicantsData);
      
      // 社員データを取得
      const employeesResponse = await fetch('/api/employees');
      if (!employeesResponse.ok) {
        throw new Error(`API error: ${employeesResponse.status}`);
      }
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('この架電記録を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/phone-calls/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // 削除成功後、リストを更新
        fetchData();
      } catch (error) {
        console.error('Error deleting phone call:', error);
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

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
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
    
    if (!formData.applicant_id) {
      alert('求職者は必須です');
      return;
    }
    
    try {
      const response = await fetch('/api/phone-calls', {
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
        applicant_id: '',
        employee_id: '',
        call_date: new Date().toISOString().slice(0, 16),
        status: 'scheduled',
        notes: '',
        follow_up_date: ''
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding phone call:', error);
      setError(error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const phoneCall = phoneCalls.find(call => call.id === id);
      if (!phoneCall) return;
      
      const response = await fetch(`/api/phone-calls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...phoneCall,
          status
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // 更新成功後、リストを更新
      fetchData();
    } catch (error) {
      console.error('Error updating phone call status:', error);
      setError(error.message);
    }
  };

  // 検索、フィルタリング、ソート処理
  const filteredAndSortedPhoneCalls = phoneCalls
    .filter(phoneCall => {
      // 検索フィルタリング
      const applicant = applicants.find(a => a.id === phoneCall.applicant_id) || {};
      const employee = employees.find(e => e.id === phoneCall.employee_id) || {};
      
      const matchesSearch = 
        applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneCall.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // ステータスフィルタリング
      const matchesStatus = 
        filterStatus === 'all' || 
        phoneCall.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // ソート処理
      if (sortField === 'call_date') {
        return sortDirection === 'asc' 
          ? new Date(a.call_date) - new Date(b.call_date)
          : new Date(b.call_date) - new Date(a.call_date);
      }
      
      if (sortField === 'applicant') {
        const applicantA = applicants.find(a => a.id === a.applicant_id)?.name || '';
        const applicantB = applicants.find(a => a.id === b.applicant_id)?.name || '';
        return sortDirection === 'asc'
          ? applicantA.localeCompare(applicantB)
          : applicantB.localeCompare(applicantA);
      }
      
      if (sortField === 'employee') {
        const employeeA = employees.find(e => e.id === a.employee_id)?.name || '';
        const employeeB = employees.find(e => e.id === b.employee_id)?.name || '';
        return sortDirection === 'asc'
          ? employeeA.localeCompare(employeeB)
          : employeeB.localeCompare(employeeA);
      }
      
      return 0;
    });

  // 日時のフォーマット
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // ステータスの表示
  const renderStatus = (status) => {
    switch (status) {
      case 'scheduled':
        return <span style={{ color: '#2196F3' }}>予定</span>;
      case 'completed':
        return <span style={{ color: '#4CAF50' }}>完了</span>;
      case 'no_answer':
        return <span style={{ color: '#FF9800' }}>不在</span>;
      case 'cancelled':
        return <span style={{ color: '#f44336' }}>キャンセル</span>;
      default:
        return status;
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div>
      <h2>架電業務管理</h2>
      
      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="求職者名、社員名、メモで検索"
          value={searchTerm}
          onChange={handleSearch}
          style={{ padding: '8px', minWidth: '250px', flexGrow: 1 }}
        />
        
        <select 
          value={filterStatus} 
          onChange={handleFilterChange}
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="all">すべてのステータス</option>
          <option value="scheduled">予定</option>
          <option value="completed">完了</option>
          <option value="no_answer">不在</option>
          <option value="cancelled">キャンセル</option>
        </select>
        
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
          {showAddForm ? '追加フォームを閉じる' : '新規架電記録追加'}
        </button>
      </div>
      
      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>架電記録追加</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="applicant_id" style={{ display: 'block', marginBottom: '5px' }}>求職者: <span style={{ color: 'red' }}>*</span></label>
              <select
                id="applicant_id"
                value={formData.applicant_id}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              >
                <option value="">選択してください</option>
                {applicants.map(applicant => (
                  <option key={applicant.id} value={applicant.id}>{applicant.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="employee_id" style={{ display: 'block', marginBottom: '5px' }}>担当社員:</label>
              <select
                id="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">選択してください</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="call_date" style={{ display: 'block', marginBottom: '5px' }}>架電日時:</label>
              <input
                type="datetime-local"
                id="call_date"
                value={formData.call_date}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label htmlFor="status" style={{ display: 'block', marginBottom: '5px' }}>ステータス:</label>
              <select
                id="status"
                value={formData.status}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="scheduled">予定</option>
                <option value="completed">完了</option>
                <option value="no_answer">不在</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="follow_up_date" style={{ display: 'block', marginBottom: '5px' }}>フォローアップ日時:</label>
              <input
                type="datetime-local"
                id="follow_up_date"
                value={formData.follow_up_date}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px' }}>メモ:</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', height: '100px' }}
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
                架電記録を追加
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('call_date')}>
                架電日時 {sortField === 'call_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('applicant')}>
                求職者 {sortField === 'applicant' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('employee')}>
                担当社員 {sortField === 'employee' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>ステータス</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>フォローアップ日時</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPhoneCalls.length > 0 ? (
              filteredAndSortedPhoneCalls.map((phoneCall) => {
                const applicant = applicants.find(a => a.id === phoneCall.applicant_id) || {};
                const employee = employees.find(e => e.id === phoneCall.employee_id) || {};
                
                return (
                  <tr key={phoneCall.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{formatDateTime(phoneCall.call_date)}</td>
                    <td style={{ padding: '12px' }}>{applicant.name || '-'}</td>
                    <td style={{ padding: '12px' }}>{employee.name || '-'}</td>
                    <td style={{ padding: '12px' }}>{renderStatus(phoneCall.status)}</td>
                    <td style={{ padding: '12px' }}>{formatDateTime(phoneCall.follow_up_date)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {phoneCall.status === 'scheduled' && (
                        <div style={{ marginBottom: '5px' }}>
                          <button 
                            onClick={() => handleUpdateStatus(phoneCall.id, 'completed')}
                            style={{ 
                              marginRight: '5px', 
                              padding: '5px 10px', 
                              backgroundColor: '#4CAF50', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer' 
                            }}
                          >
                            完了
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(phoneCall.id, 'no_answer')}
                            style={{ 
                              marginRight: '5px', 
                              padding: '5px 10px', 
                              backgroundColor: '#FF9800', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer' 
                            }}
                          >
                            不在
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(phoneCall.id, 'cancelled')}
                            style={{ 
                              padding: '5px 10px', 
                              backgroundColor: '#f44336', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer' 
                            }}
                          >
                            キャンセル
                          </button>
                        </div>
                      )}
                      <div>
                        <button 
                          onClick={() => alert('架電詳細ページは開発中です')}
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
                          onClick={() => handleDelete(phoneCall.id)}
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>
                  架電記録が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PhoneCallsList;