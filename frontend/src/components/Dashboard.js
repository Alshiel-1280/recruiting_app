import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function Dashboard() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    newApplicantsToday: 0,
    totalJobs: 0,
    upcomingInterviews: 0
  });

  // チャート用のrefを作成
  const availableDateChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const conversionRateChartRef = useRef(null);
  const conversionChartInstanceRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 就業可能時期のチャートを描画するためのuseEffect
  useEffect(() => {
    if (loading || !availableDateChartRef.current) return;

    // 就業可能時期ごとの求職者数を集計
    const availableDateCount = applicants.reduce((acc, applicant) => {
      const date = applicant.available_date || '未設定';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const data = {
      labels: Object.keys(availableDateCount),
      datasets: [
        {
          label: '求職者数',
          data: Object.values(availableDateCount),
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(79, 70, 229, 0.7)',
            'rgba(67, 56, 202, 0.7)',
            'rgba(55, 48, 163, 0.7)',
            'rgba(49, 46, 129, 0.7)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(79, 70, 229, 1)',
            'rgba(67, 56, 202, 1)',
            'rgba(55, 48, 163, 1)',
            'rgba(49, 46, 129, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: '就業可能時期の分布',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
      },
    };

    // 既存のチャートを破棄
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // 新しいチャートを作成
    const ctx = availableDateChartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data,
      options,
    });

    // コンバージョン率チャートの描画
    if (conversionRateChartRef.current) {
      if (conversionChartInstanceRef.current) {
        conversionChartInstanceRef.current.destroy();
      }

      const conversionData = {
        labels: ['応募', '架電', '接続', '提案', '書類送付', '面接', '内定', '入社'],
        datasets: [
          {
            label: '件数',
            data: [100, 85, 70, 55, 40, 30, 25, 20],
            backgroundColor: 'rgba(14, 165, 233, 0.7)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 1,
          }
        ]
      };

      const conversionOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'コンバージョンファネル',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      };

      const conversionCtx = conversionRateChartRef.current.getContext('2d');
      conversionChartInstanceRef.current = new Chart(conversionCtx, {
        type: 'bar',
        data: conversionData,
        options: conversionOptions,
      });
    }

    // コンポーネントのアンマウント時にチャートを破棄
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      if (conversionChartInstanceRef.current) {
        conversionChartInstanceRef.current.destroy();
      }
    };
  }, [applicants, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 求職者データを取得
      const applicantsResponse = await fetch('/api/applicants');
      if (!applicantsResponse.ok) {
        throw new Error(`API error: ${applicantsResponse.status}`);
      }
      const applicantsData = await applicantsResponse.json();
      setApplicants(applicantsData);

      // 求人データを取得
      const jobsResponse = await fetch('/api/jobs');
      if (!jobsResponse.ok) {
        throw new Error(`API error: ${jobsResponse.status}`);
      }
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);

      // 面接データを取得
      const interviewsResponse = await fetch('/api/interviews');
      if (!interviewsResponse.ok) {
        throw new Error(`API error: ${interviewsResponse.status}`);
      }
      const interviewsData = await interviewsResponse.json();
      setInterviews(interviewsData);

      // 統計情報を計算
      calculateStats(applicantsData, jobsData, interviewsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // 統計情報を計算
  const calculateStats = (applicantsData, jobsData, interviewsData) => {
    // 今日の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日追加された求職者数
    const newApplicantsToday = applicantsData.filter(applicant => {
      const createdAt = new Date(applicant.created_at);
      return createdAt >= today;
    }).length;

    // 今後の面接数（今日以降の予定）
    const upcomingInterviews = interviewsData.filter(interview => {
      const interviewDate = new Date(interview.date);
      return interviewDate >= today && interview.status === 'scheduled';
    }).length;

    setStats({
      totalApplicants: applicantsData.length,
      newApplicantsToday,
      totalJobs: jobsData.length,
      upcomingInterviews
    });
  };

  // 最近の求職者リストを表示
  const renderRecentApplicants = () => {
    // 作成日時でソートして最新の5件を取得
    const recentApplicants = [...applicants]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return (
      <div className="recent-applicants-card">
        <h3 className="dashboard-card-title">最近追加された求職者</h3>
        {recentApplicants.length > 0 ? (
          <div className="recent-applicants-list">
            {recentApplicants.map(applicant => (
              <div key={applicant.id} className="recent-applicant-item">
                <div className="applicant-details">
                  <div className="applicant-name">{applicant.name}</div>
                  <div className="applicant-occupation">{applicant.desired_occupation || '-'}</div>
                </div>
                <div className="applicant-date">{applicant.available_date || '-'}</div>
                <Link to={`/applicants/${applicant.id}`}>
                  <button className="view-details-btn">詳細</button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">求職者データがありません</p>
        )}
        <div className="card-footer">
          <Link to="/applicants" className="view-all-link">すべての求職者を表示 &raquo;</Link>
        </div>
      </div>
    );
  };

  // 今後の面接予定を表示
  const renderUpcomingInterviews = () => {
    // 今日以降の面接予定を日付順に並べる
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [...interviews]
      .filter(interview => {
        const interviewDate = new Date(interview.date);
        return interviewDate >= today && interview.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    return (
      <div className="upcoming-interviews-card">
        <h3 className="dashboard-card-title">今後の面接予定</h3>
        {upcoming.length > 0 ? (
          <div className="upcoming-interviews-list">
            {upcoming.map(interview => {
              const interviewDate = new Date(interview.date);
              const formattedDate = interviewDate.toLocaleDateString('ja-JP');
              const formattedTime = interviewDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

              // 関連する求職者と求人を検索
              const applicant = applicants.find(a => a.id === interview.applicant_id) || {};
              const job = jobs.find(j => j.id === interview.job_id) || {};

              return (
                <div key={interview.id} className="interview-item">
                  <div className="interview-time">
                    <div className="interview-date">{formattedDate}</div>
                    <div className="interview-hour">{formattedTime}</div>
                  </div>
                  <div className="interview-details">
                    <div className="interview-applicant">{applicant.name || '-'}</div>
                    <div className="interview-job">{job.title || job.company || '-'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data-message">予定されている面接はありません</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>エラーが発生しました</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={fetchData}>再試行</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>ダッシュボード</h2>
        <div className="dashboard-actions">
          <button onClick={fetchData} className="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            更新
          </button>
        </div>
      </div>

      {/* KPI概要 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon applicants-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>総求職者数</h3>
            <p className="stat-number">{stats.totalApplicants}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon new-applicants-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h3>今日の新規求職者</h3>
            <p className="stat-number">{stats.newApplicantsToday}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon jobs-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>求人数</h3>
            <p className="stat-number">{stats.totalJobs}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon interviews-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div className="stat-content">
            <h3>今後の面接</h3>
            <p className="stat-number">{stats.upcomingInterviews}</p>
          </div>
        </div>
      </div>

      {/* グラフと最近のデータ */}
      <div className="dashboard-charts-container">
        <div className="chart-card">
          <canvas ref={availableDateChartRef} id="availableDateChart"></canvas>
        </div>

        <div className="chart-card">
          <canvas ref={conversionRateChartRef} id="conversionRateChart"></canvas>
        </div>
      </div>

      <div className="dashboard-data-row">
        <div className="data-card">
          {renderRecentApplicants()}
        </div>

        <div className="data-card">
          {renderUpcomingInterviews()}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="quick-actions-section">
        <h3>クイックアクション</h3>
        <div className="quick-actions">
          <Link to="/applicants/add" className="action-button add-applicant">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            求職者を追加
          </Link>

          <Link to="/jobs" className="action-button view-jobs">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            求人情報を確認
          </Link>

          <Link to="/statistics" className="action-button view-stats">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            統計分析を表示
          </Link>

          <Link to="/company-kpi" className="action-button view-kpi">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            KPI管理
          </Link>
        </div>
      </div>

      {/* CSS スタイル */}
      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dashboard-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .dashboard-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-button:hover {
          background-color: #f1f5f9;
          color: #334155;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .applicants-icon {
          background-color: rgba(99, 102, 241, 0.1);
          color: #6366F1;
        }

        .new-applicants-icon {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .jobs-icon {
          background-color: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
        }

        .interviews-icon {
          background-color: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        .stat-content h3 {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          margin: 0 0 6px 0;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .dashboard-charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          height: 300px;
        }

        .dashboard-data-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .data-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .dashboard-card-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 15px 0;
          color: #1e293b;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .recent-applicants-card, .upcoming-interviews-card {
          padding: 20px;
          height: 100%;
        }

        .recent-applicants-list, .upcoming-interviews-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-applicant-item, .interview-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          background-color: #f8fafc;
          transition: background-color 0.2s ease;
        }

        .recent-applicant-item:hover, .interview-item:hover {
          background-color: #f1f5f9;
        }

        .applicant-details, .interview-details {
          flex-grow: 1;
        }

        .applicant-name, .interview-applicant {
          font-weight: 500;
          color: #334155;
          margin-bottom: 4px;
        }

        .applicant-occupation, .interview-job {
          font-size: 13px;
          color: #64748b;
        }

        .applicant-date {
          padding: 4px 8px;
          background-color: #e0f2fe;
          border-radius: 4px;
          color: #0369a1;
          font-size: 12px;
          margin-right: 10px;
        }

        .interview-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px;
          background-color: #e0f2fe;
          border-radius: 8px;
          margin-right: 16px;
        }

        .interview-date {
          font-size: 12px;
          color: #0369a1;
          margin-bottom: 2px;
        }

        .interview-hour {
          font-weight: 600;
          color: #0284c7;
        }

        .view-details-btn {
          padding: 5px 10px;
          background-color: #6366F1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s ease;
        }

        .view-details-btn:hover {
          background-color: #4F46E5;
        }

        .card-footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          text-align: right;
        }

        .view-all-link {
          color: #6366F1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #4F46E5;
          text-decoration: underline;
        }

        .no-data-message {
          padding: 20px;
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }

        .quick-actions-section {
          margin-top: 20px;
        }

        .quick-actions-section h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1e293b;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .add-applicant {
          background-color: #10B981;
        }

        .view-jobs {
          background-color: #6366F1;
        }

        .view-stats {
          background-color: #F59E0B;
        }

        .view-kpi {
          background-color: #EF4444;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #6366F1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          padding: 20px;
          text-align: center;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .retry-button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #6366F1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }

        .retry-button:hover {
          background-color: #4F46E5;
        }

        @media (max-width: 768px) {
          .stats-cards {
            grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
          }
          
          .dashboard-charts-container, .dashboard-data-row {
            grid-template-columns: 1fr;
          }
          
          .chart-card {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
