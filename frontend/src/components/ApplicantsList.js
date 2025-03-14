import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ApplicantsList() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      // APIサーバーはポート5001で稼働しているため、URLを修正
      const response = await fetch('http://localhost:5001/api/applicants');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setApplicants(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('この求職者を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/applicants/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // 削除成功後、リストを更新
        fetchApplicants();
      } catch (error) {
        console.error('Error deleting applicant:', error);
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

  // 検索、フィルタリング、ソート処理
  const filteredAndSortedApplicants = applicants
    .filter(applicant => {
      // 検索フィルタリング
      const matchesSearch = 
        applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.phone_number?.includes(searchTerm);
      
      // ステータスフィルタリング
      const matchesStatus = 
        filterStatus === 'all' || 
        applicant.employment_status === filterStatus;
      
      return matchesSearch && matchesStatus;
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
      <h2>求職者一覧</h2>
      
      <div className="filters" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="名前、メール、電話番号で検索"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        
        <select 
          value={filterStatus} 
          onChange={handleFilterChange}
          style={{ padding: '5px' }}
        >
          <option value="all">すべてのステータス</option>
          <option value="在職中">在職中</option>
          <option value="求職中">求職中</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <Link to="/applicants/add">
          <button style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            新規求職者追加
          </button>
        </Link>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                氏名 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>連絡先</th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('employment_status')}>
                就業状況 {sortField === 'employment_status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('available_date')}>
                就業可能時期 {sortField === 'available_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('desired_occupation')}>
                希望職種 {sortField === 'desired_occupation' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplicants.length > 0 ? (
              filteredAndSortedApplicants.map((applicant) => (
                <tr key={applicant.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{applicant.name}</td>
                  <td style={{ padding: '12px' }}>
                    {applicant.email}<br />
                    {applicant.phone_number}
                  </td>
                  <td style={{ padding: '12px' }}>{applicant.employment_status}</td>
                  <td style={{ padding: '12px' }}>{applicant.available_date}</td>
                  <td style={{ padding: '12px' }}>{applicant.desired_occupation}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <Link to={`/applicants/${applicant.id}`}>
                      <button style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        詳細
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(applicant.id)}
                      style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>
                  求職者が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicantsList;