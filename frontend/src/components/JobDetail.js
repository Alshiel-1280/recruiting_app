import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function JobDetail() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 求人詳細データの取得
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        console.log(`JobDetail: Fetching data for job ID: ${jobId}`);
        
        // APIエンドポイントの呼び出し
        const response = await fetch(`/api/jobs/${jobId}`);
        
        // レスポンスのログ出力（デバッグ用）
        console.log(`API Response Status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('JobDetail: Successfully retrieved job data:', data);
        
        setJob(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  // ローディング表示
  if (loading) {
    return <div>読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', margin: '20px 0' }}>
        <h3>エラーが発生しました</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/jobs')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          求人一覧に戻る
        </button>
      </div>
    );
  }

  // 求人情報が見つからない場合
  if (!job) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', margin: '20px 0' }}>
        <h3>求人情報が見つかりません</h3>
        <p>指定された求人情報（ID: {jobId}）は存在しないか、削除された可能性があります。</p>
        <button 
          onClick={() => navigate('/jobs')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          求人一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/jobs">&larr; 求人一覧に戻る</Link>
      </div>

      <h2>{job.title || job.company || '求人詳細'}</h2>
      
      {/* デバッグ情報（開発時のみ表示） */}
      {/*<div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '12px' }}>
        <p>求人ID: {job.id}</p>
      </div>*/}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 基本情報 */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>基本情報</h3>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>企業名</th>
                <td>{job.company || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>勤務地</th>
                <td>
                  {job.prefecture && job.city 
                    ? `${job.prefecture} ${job.city}`
                    : job.prefecture 
                      ? job.prefecture
                      : job.city
                        ? job.city
                        : '情報なし'
                  }
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>給与</th>
                <td>{job.salary || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>フィー</th>
                <td>{job.fee || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>年齢制限</th>
                <td>
                  {job.min_age && job.age_limit 
                    ? `${job.min_age}〜${job.age_limit}歳`
                    : job.age_limit 
                      ? `〜${job.age_limit}歳`
                      : job.min_age
                        ? `${job.min_age}歳〜`
                        : '制限なし'
                  }
                </td>
              </tr>
              {job.job_number && (
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>求人番号</th>
                  <td>{job.job_number}</td>
                </tr>
              )}
              {job.cf_fc && (
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>CF/FC</th>
                  <td>{job.cf_fc}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 勤務条件 */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>勤務条件</h3>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>勤務形態</th>
                <td>{job.work_style || job.employment_type || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>休日</th>
                <td>{job.holidays || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>年間休日</th>
                <td>{job.annual_holidays || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>シフト</th>
                <td>{job.shift || '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>時給</th>
                <td>{job.hourly_wage ? `${job.hourly_wage}円` : job.salary_type === '時給' ? job.salary : '情報なし'}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>入寮</th>
                <td>{job.dormitory === true ? '可' : job.dormitory === false ? '不可' : '情報なし'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細情報 */}
      {(job.description || job.requirements || job.benefits) && (
        <div style={{ marginTop: '20px' }}>
          {job.description && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <h3>業務内容</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <h3>応募要件</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
            </div>
          )}

          {job.benefits && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <h3>待遇・福利厚生</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.benefits}</p>
            </div>
          )}

          {job.advantages && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <h3>働く魅力</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.advantages}</p>
            </div>
          )}
        </div>
      )}

      {/* その他のデータ表示 */}
      <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h3>その他の情報</h3>
        <table style={{ width: '100%' }}>
          <tbody>
            {job.products && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>生産品目</th>
                <td>{job.products}</td>
              </tr>
            )}
            {job.occupation_major_category && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>職種大分類</th>
                <td>{job.occupation_major_category}</td>
              </tr>
            )}
            {job.occupation_minor_category && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>職種小分類</th>
                <td>{job.occupation_minor_category}</td>
              </tr>
            )}
            {job.commute_method && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>通勤手段</th>
                <td>{job.commute_method}</td>
              </tr>
            )}
            {job.nearest_station && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>最寄り駅</th>
                <td>{job.nearest_station}</td>
              </tr>
            )}
            {job.smoking_measures && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', width: '30%' }}>受動喫煙防止対策</th>
                <td>{job.smoking_measures}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* アクションボタン */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
      <button 
        onClick={() => navigate(`/matching?jobId=${job.id}`)}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        この求人に合う求職者を探す
      </button>

        <button
          onClick={() => navigate(`/jobs/edit/${job.id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          編集
        </button>
      </div>
    </div>
  );
}

export default JobDetail;
