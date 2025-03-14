import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('company');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterPrefecture, setFilterPrefecture] = useState('');
  const [prefectures, setPrefectures] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched jobs data:', data); // デバッグ用ログ
      console.log('First job item:', data && data.length > 0 ? JSON.stringify(data[0], null, 2) : null); // 最初のアイテムを詳細表示
      
      // デバッグ情報を設定
      setDebugInfo({
        dataLength: data.length,
        firstItem: data && data.length > 0 ? data[0] : null,
        responseStatus: response.status,
        timestamp: new Date().toISOString()
      });
      
      setJobs(data);
      
      // 都道府県の一覧を抽出（フィルター用）
      const uniquePrefectures = data && data.length > 0 ? [...new Set(data.map(job => job.prefecture).filter(Boolean))] : [];
      setPrefectures(uniquePrefectures);
      
      // 求人データ例（最初の項目）をログに出力
      console.log('求人データ例（最初の項目）:');
      if (data && data.length > 0) {
        console.log({
          id: data[0].id,
          title: data[0].title,
          company: data[0].company,
          prefecture: data[0].prefecture,
          city: data[0].city,
          // その他の都道府県や場所に関連するフィールド
          location: data[0].location,
          address: data[0].address
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
      setLoading(false);
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
    setCurrentPage(1); // 検索時は1ページ目に戻る
  };

  const handlePrefectureFilter = (e) => {
    setFilterPrefecture(e.target.value);
    setCurrentPage(1); // フィルター変更時は1ページ目に戻る
  };

  // 検索、フィルタリング、ソート処理
  const filteredAndSortedJobs = jobs
 && jobs.length > 0 ? jobs
    .filter(job => {
      // 検索フィルタリング
      const matchesSearch = 
        (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // 都道府県フィルタリング
      const matchesPrefecture = 
        filterPrefecture === '' || 
        job.prefecture === filterPrefecture;
      
      return matchesSearch && matchesPrefecture;
    })
    .sort((a, b) => {
      // ソート処理
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;
      
      let valueA, valueB;
      
      // 数値フィールドの場合は数値として比較
      if (sortField === 'fee' || sortField === 'salary') {
        // 数値部分を抽出（例: "¥300,000" → 300000）
        valueA = parseInt((a[sortField] || '').replace(/[^0-9]/g, '')) || 0;
        valueB = parseInt((b[sortField] || '').replace(/[^0-9]/g, '')) || 0;
      } else {
        valueA = (a[sortField] || '').toString().toLowerCase();
        valueB = (b[sortField] || '').toString().toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return typeof valueA === 'number' ? valueA - valueB : valueA.localeCompare(valueB);
      } else {
        return typeof valueA === 'number' ? valueB - valueA : valueB.localeCompare(valueA);
      }
    }) : [];

  // ページネーション処理
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);

  // ページ変更ハンドラー
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 前のページへ
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 次のページへ
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

    // 勤務地を表示する関数
  const displayLocation = (job) => {
    const prefecture = job.prefecture || '';
    const city = job.city || '';
    
    if (prefecture && city) {
      return `${prefecture} ${city}`;
    } else if (prefecture) {
      return prefecture;
    } else if (city) {
      return city;
    } else {
      return '未設定';
    }
  };

  const dummyJobs = [
    {
      id: 'dummy-1',
      company: 'サンプル企業株式会社',
      prefecture: '東京都',
      city: '千代田区',
      salary: '月給25万円〜',
      fee: '30%',
      age_limit: '35歳まで'
    },
    {
      id: 'dummy-2',
      company: '架空工業有限会社',
      prefecture: '大阪府',
      city: '大阪市',
      salary: '時給1,300円〜',
      fee: '25%',
      age_limit: '40歳まで'
    },
    {
      id: 'dummy-3',
      company: 'テスト製造工場',
      prefecture: '愛知県',
      city: '名古屋市',
      salary: '月給23万円〜',
      fee: '28%',
      age_limit: '制限なし'
    }
  ];


  if (loading) {
    return <div>読み込み中...</div>;
  };

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  };

  return (
    <div>
      <h2>求人情報一覧</h2>
      
      {/* デバッグ情報 */}
      {/*<div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f8f8', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>デバッグ情報</h3>
        <p>取得したデータ数: {jobs.length}</p>
        <p>フィルタリング後のデータ数: {filteredAndSortedJobs ? filteredAndSortedJobs.length : 0}</p>
        <p>現在のページ: {currentPage}</p>
        <p>総ページ数: {totalPages}</p>
        <p>表示アイテム: {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedJobs.length)}</p>
        <p>現在の表示件数: {currentItems.length}</p>
        <details>
          <summary>詳細情報</summary>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
        <button onClick={fetchJobs} style={{ marginTop: '10px', padding: '5px 10px' }}>データを再取得</button>
      </div>*/}
      
      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="タイトル、会社名、説明で検索"
          value={searchTerm}
          onChange={handleSearch}
          style={{ padding: '8px', minWidth: '250px', flexGrow: 1 }}
        />
        
        <select 
          value={filterPrefecture} 
          onChange={handlePrefectureFilter}
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">すべての都道府県</option>
          {prefectures.map(prefecture => (
            <option key={prefecture} value={prefecture}>{prefecture}</option>
          ))}
        </select>
        
        <Link to="/jobs/add">
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>+</span> 求人情報を追加
          </button>
        <button
          onClick={async () => {
            if (window.confirm('本当にすべての求人情報を削除しますか？')) {
              try {
                const response = await fetch('/api/jobs/delete-all', {
                  method: 'DELETE',
                });
                if (!response.ok) {
                  throw new Error(`API error: ${response.status}`);
                }
                // 削除後に求人情報を再取得
                fetchJobs();
              } catch (error) {
                console.error('Error deleting all jobs:', error);
                alert(`エラーが発生しました: ${error.message}`);
              }
            }
          }}
          style={{ backgroundColor: 'red', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          全て削除
        </button>
        </Link>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('company')}>
                会社名 {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('prefecture')}>
                勤務地 {sortField === 'prefecture' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('salary')}>
                給与 {sortField === 'salary' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('fee')}>
                フィー {sortField === 'fee' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('age_limit')}>
                年齢上限 {sortField === 'age_limit' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((job, index) => (
                <tr key={job.id || index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{job.company || job.cf_fc || `会社 ${job.id || index + 1}`}</td>
                  <td style={{ padding: '12px' }}>{displayLocation(job) || '東京都'}</td>
                  <td style={{ padding: '12px' }}>{job.salary || '要相談'}</td>
                  <td style={{ padding: '12px' }}>{job.fee || '未設定'}</td>
                  <td style={{ padding: '12px' }}>{job.age_limit || (job.max_age ? `${job.max_age}歳` : '制限なし')}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                     {console.log('job.id:', job.id)}
                     <Link to={`/jobs/${job.id}`}>
                    <button
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
                  </Link>

                    <button 
                      onClick={() => window.alert('求人削除機能は開発中です')}
                      style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '12px', textAlign: 'center' }}>
                  求人情報が見つかりません。ダミーデータを表示します。
                </td>
              </tr>
            )}
            
            {/* データがない場合はダミーデータを表示 */}
            {(!currentItems || currentItems.length === 0) && dummyJobs.map((job) => (
              <tr key={`dummy-${job.id}`} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fffde7' }}>
                <td style={{ padding: '12px' }}>{job.company}</td>
                <td style={{ padding: '12px' }}>{`${job.prefecture} ${job.city}`}</td>
                <td style={{ padding: '12px' }}>{job.salary}</td>
                <td style={{ padding: '12px' }}>{job.fee}</td>
                <td style={{ padding: '12px' }}>{job.age_limit}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => window.alert('これはダミーデータです')}
                    style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    詳細
                  </button>
                  <button 
                    onClick={() => window.alert('これはダミーデータです')}
                    style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ページネーション */}
      {filteredAndSortedJobs && filteredAndSortedJobs.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: currentPage === 1 ? '#f0f0f0' : '#4CAF50', 
              color: currentPage === 1 ? '#888' : 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: currentPage === 1 ? 'default' : 'pointer' 
            }}
          >
            前へ
          </button>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // 現在のページを中心に最大5ページ表示
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: currentPage === pageNum ? '#4CAF50' : '#f0f0f0', 
                    color: currentPage === pageNum ? 'white' : 'black', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span style={{ alignSelf: 'center' }}>...</span>
                <button
                  onClick={() => paginate(totalPages)}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: currentPage === totalPages ? '#4CAF50' : '#f0f0f0', 
                    color: currentPage === totalPages ? 'white' : 'black', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#4CAF50', 
              color: currentPage === totalPages ? '#888' : 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: currentPage === totalPages ? 'default' : 'pointer' 
            }}
          >
            次へ
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <h3>求人情報のインポート</h3>
        <p>Excelファイルから求人情報をインポートできます。</p>
        <Link to="/jobs/add">
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#FF9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}>
            Excelファイルをアップロード
          </button>
        </Link>
      </div>
      
      {/* 表示情報 */}
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>表示: {filteredAndSortedJobs && filteredAndSortedJobs.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredAndSortedJobs.length)} / 全${filteredAndSortedJobs.length}件` : '0件'}</p>
      </div>
    </div>
  );
}

export default JobsList;