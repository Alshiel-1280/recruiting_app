import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function MatchingSystem() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchingResults, setMatchingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchingType, setMatchingType] = useState('applicant-to-job'); // 'applicant-to-job' または 'job-to-applicant'
  
  const location = useLocation();

  // URLクエリパラメータをチェック
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const applicantId = params.get('applicantId');
    const jobId = params.get('jobId');
    
    if (applicantId) {
      setSelectedApplicantId(applicantId);
      setMatchingType('applicant-to-job');
      fetchMatchingJobs(applicantId);
    } else if (jobId) {
      setSelectedJobId(jobId);
      setMatchingType('job-to-applicant');
      fetchMatchingApplicants(jobId);
    }
  }, [location]);
  
  // 初期データのフェッチ
  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);
  
  // 求職者データを取得
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applicants');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setApplicants(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError('求職者データの取得中にエラーが発生しました');
      setLoading(false);
    }
  };
  
  // 求人データを取得
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('求人データの取得中にエラーが発生しました');
      setLoading(false);
    }
  };
  
  // 求職者に合う求人を取得
  // 求職者に合う求人を取得
  const fetchMatchingJobs = async (applicantId) => {
    try {
      setLoading(true);
      setError('');
      setMatchingResults([]);
      
      // URLを修正
      const response = await fetch(`/api/matching/applicant/${applicantId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setMatchingResults(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
      setError('マッチング処理中にエラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  // 求人に合う求職者を取得
  const fetchMatchingApplicants = async (jobId) => {
    try {
      setLoading(true);
      setError('');
      setMatchingResults([]);
      
      // URLを修正
      const response = await fetch(`/api/matching/job/${jobId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setMatchingResults(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matching applicants:', error);
      setError('マッチング処理中にエラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  
  // 選択された求職者が変更されたとき
  const handleApplicantChange = (e) => {
    const applicantId = e.target.value;
    setSelectedApplicantId(applicantId);
    
    if (applicantId) {
      fetchMatchingJobs(applicantId);
    } else {
      setMatchingResults([]);
    }
  };
  
  // 選択された求人が変更されたとき
  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    
    if (jobId) {
      fetchMatchingApplicants(jobId);
    } else {
      setMatchingResults([]);
    }
  };
  
  // マッチングタイプを切り替え
  const toggleMatchingType = () => {
    setMatchingResults([]);
    setSelectedApplicantId('');
    setSelectedJobId('');
    setMatchingType(matchingType === 'applicant-to-job' ? 'job-to-applicant' : 'applicant-to-job');
  };
  
  // スコアバーのスタイル
  const getScoreBarStyle = (score) => {
    let color = '#ff0000'; // 赤 (低いスコア)
    
    if (score >= 70) {
      color = '#4caf50'; // 緑 (高いスコア)
    } else if (score >= 50) {
      color = '#2196f3'; // 青 (中程度のスコア)
    } else if (score >= 30) {
      color = '#ff9800'; // オレンジ (やや低いスコア)
    }
    
    return {
      width: `${score}%`,
      backgroundColor: color,
      height: '10px',
      borderRadius: '5px'
    };
  };
  
  // マッチング詳細の表示
  const renderMatchDetails = (details) => {
    if (!details || details.length === 0) return null;
    
    return (
      <div style={{ margin: '10px 0', fontSize: '0.9em' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '5px', textAlign: 'left', border: '1px solid #ddd' }}>マッチング要素</th>
              <th style={{ padding: '5px', textAlign: 'left', border: '1px solid #ddd' }}>求職者</th>
              <th style={{ padding: '5px', textAlign: 'left', border: '1px solid #ddd' }}>求人</th>
              <th style={{ padding: '5px', textAlign: 'center', border: '1px solid #ddd' }}>一致度</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index}>
                <td style={{ padding: '5px', border: '1px solid #ddd' }}>{detail.factor}</td>
                <td style={{ padding: '5px', border: '1px solid #ddd' }}>{detail.applicant_value}</td>
                <td style={{ padding: '5px', border: '1px solid #ddd' }}>{detail.job_value}</td>
                <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: detail.level === '高' ? '#4caf50' : detail.level === '中' ? '#2196f3' : '#ff9800',
                    color: 'white',
                    fontSize: '0.8em'
                  }}>
                    {detail.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>マッチングシステム</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleMatchingType} 
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {matchingType === 'applicant-to-job' 
            ? '求人から求職者を探す' 
            : '求職者から求人を探す'}に切り替え
        </button>
      </div>
      
      {matchingType === 'applicant-to-job' ? (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="applicantSelect" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            求職者を選択:
          </label>
          <select
            id="applicantSelect"
            value={selectedApplicantId}
            onChange={handleApplicantChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '300px' }}
          >
            <option value="">-- 選択してください --</option>
            {applicants.map(applicant => (
              <option key={applicant.id} value={applicant.id}>
                {applicant.name} ({applicant.desired_occupation || '希望未設定'})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="jobSelect" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            求人を選択:
          </label>
          <select
            id="jobSelect"
            value={selectedJobId}
            onChange={handleJobChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '300px' }}
          >
            <option value="">-- 選択してください --</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title || job.company} ({job.prefecture} {job.city})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>マッチング処理中...</p>
        </div>
      ) : error ? (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          <p>{error}</p>
        </div>
      ) : matchingResults.length > 0 ? (
        <div>
          <h3>
            {matchingType === 'applicant-to-job' 
              ? '適合する求人一覧' 
              : '適合する求職者一覧'}
          </h3>
          
          <div style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <p>全 {matchingResults.length} 件のマッチング結果があります。</p>
          </div>
          
          {matchingResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {matchingType === 'applicant-to-job' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{result.job.title || result.job.company}</h3>
                    <div style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#e8f5e9', 
                      color: '#2e7d32',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      マッチ度 {result.score}%
                    </div>
                  </div>
                  
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: '#eee', 
                    borderRadius: '5px',
                    height: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={getScoreBarStyle(result.score)}></div>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <p><strong>企業:</strong> {result.job.company}</p>
                    <p><strong>勤務地:</strong> {result.job.prefecture} {result.job.city}</p>
                    <p><strong>給与:</strong> {result.job.salary}</p>
                    {result.job.description && <p><strong>業務内容:</strong> {result.job.description.substring(0, 100)}...</p>}
                  </div>
                  
                  {renderMatchDetails(result.match_details)}
                  
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <Link to={`/jobs/${result.job.id}`}>
                      <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}>
                        詳細を見る
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{result.applicant.name}</h3>
                    <div style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#e8f5e9', 
                      color: '#2e7d32',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      マッチ度 {result.score}%
                    </div>
                  </div>
                  
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: '#eee', 
                    borderRadius: '5px',
                    height: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={getScoreBarStyle(result.score)}></div>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <p><strong>希望職種:</strong> {result.applicant.desired_occupation || '未設定'}</p>
                    <p><strong>希望給与:</strong> {result.applicant.desired_salary || '未設定'}</p>
                    <p><strong>居住地:</strong> {result.applicant.address || '未設定'}</p>
                    <p><strong>就業可能時期:</strong> {result.applicant.available_date || '未設定'}</p>
                  </div>
                  
                  {renderMatchDetails(result.match_details)}
                  
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <Link to={`/applicants/${result.applicant.id}`}>
                      <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}>
                        詳細を見る
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : selectedApplicantId || selectedJobId ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>マッチする{matchingType === 'applicant-to-job' ? '求人' : '求職者'}が見つかりませんでした。</p>
        </div>
      ) : null}
    </div>
  );
}

export default MatchingSystem;
