import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InterviewsList = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // データフェッチ
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interviews');
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }
        const data = await response.json();
        setInterviews(data);
        setLoading(false);
      } catch (err) {
        console.error('面接データの取得エラー:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  // 面接日をフォーマットするための関数
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', { hour12: false });
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>面接一覧</h2>
      {interviews.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>日時</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>求職者ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>求人ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>ステータス</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>結果</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>備考</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map(interview => (
              <tr key={interview.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{interview.id}</td>
                <td style={{ padding: '10px' }}>{formatDate(interview.date)}</td>
                <td style={{ padding: '10px' }}>{interview.applicant_id}</td>
                <td style={{ padding: '10px' }}>{interview.job_id}</td>
                <td style={{ padding: '10px' }}>{interview.status}</td>
                <td style={{ padding: '10px' }}>{interview.result || '-'}</td>
                <td style={{ padding: '10px' }}>{interview.notes || '-'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <Link to={`/interviews/${interview.id}`}>
                    <button style={{ padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      詳細
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>面接データがありません。</p>
      )}
    </div>
  );
};

export default InterviewsList;