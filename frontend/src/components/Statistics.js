import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const Statistics = () => {
  const [interviewStats, setInterviewStats] = useState(null);
  const [applicantStats, setApplicantStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // チャート用のrefを作成
  const interviewChartRef = useRef(null);
  const employmentStatusChartRef = useRef(null);
  const availableDateChartRef = useRef(null);
  const occupationChartRef = useRef(null);
  
  // チャートインスタンスの参照を保持
  const chartInstancesRef = useRef({});

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 面接結果のチャートを描画するためのuseEffect
  useEffect(() => {
    if (loading || !interviewStats || !interviewChartRef.current) return;
    
    const { passed, failed } = interviewStats;
    
    const data = {
      labels: ['合格', '不合格'],
      datasets: [
        {
          label: '面接結果',
          data: [passed, failed],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
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
          text: '面接結果の分布',
        },
      },
    };

    renderChartToCanvas('interviewChart', 'pie', data, options);
  }, [interviewStats, loading]);

  // 就業状況のチャートを描画するためのuseEffect
  useEffect(() => {
    if (loading || !applicantStats || !employmentStatusChartRef.current) return;
    
    const { employmentStatusCount } = applicantStats;
    
    const data = {
      labels: Object.keys(employmentStatusCount),
      datasets: [
        {
          label: '求職者数',
          data: Object.values(employmentStatusCount),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
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
          text: '就業状況の分布',
        },
      },
    };

    renderChartToCanvas('employmentStatusChart', 'doughnut', data, options);
  }, [applicantStats, loading]);

  // 就業可能時期のチャートを描画するためのuseEffect
  useEffect(() => {
    if (loading || !applicantStats || !availableDateChartRef.current) return;
    
    const { availableDateCount } = applicantStats;
    
    const data = {
      labels: Object.keys(availableDateCount),
      datasets: [
        {
          label: '求職者数',
          data: Object.values(availableDateCount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: '就業可能時期の分布',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    renderChartToCanvas('availableDateChart', 'bar', data, options);
  }, [applicantStats, loading]);

  // 希望職種のチャートを描画するためのuseEffect
  useEffect(() => {
    if (loading || !applicantStats || !occupationChartRef.current) return;
    
    const { topOccupations } = applicantStats;
    
    const data = {
      labels: Object.keys(topOccupations),
      datasets: [
        {
          label: '求職者数',
          data: Object.values(topOccupations),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: '人気の希望職種 (上位5つ)',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    renderChartToCanvas('occupationChart', 'bar', data, options);
  }, [applicantStats, loading]);

  // コンポーネントのアンマウント時にチャートを破棄
  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, []);

  const renderChartToCanvas = (canvasId, type, data, options) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // 既存のチャートを破棄
    if (chartInstancesRef.current[canvasId]) {
      chartInstancesRef.current[canvasId].destroy();
    }
    
    // 新しいチャートを作成
    const ctx = canvas.getContext('2d');
    chartInstancesRef.current[canvasId] = new Chart(ctx, {
      type,
      data,
      options,
    });
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 面接結果の統計を取得
      const interviewResponse = await fetch('/api/statistics/interview-results');
      if (!interviewResponse.ok) {
        throw new Error(`API error: ${interviewResponse.status}`);
      }
      const interviewData = await interviewResponse.json();
      setInterviewStats(interviewData);
      
      // 求職者データを取得して統計を計算
      const applicantsResponse = await fetch('/api/applicants');
      if (!applicantsResponse.ok) {
        throw new Error(`API error: ${applicantsResponse.status}`);
      }
      const applicantsData = await applicantsResponse.json();
      
      // 求職者の統計情報を計算
      const stats = calculateApplicantStats(applicantsData);
      setApplicantStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // 求職者データから統計情報を計算
  const calculateApplicantStats = (applicants) => {
    // 就業状況の集計
    const employmentStatusCount = applicants.reduce((acc, applicant) => {
      const status = applicant.employment_status || '未設定';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // 就業可能時期の集計
    const availableDateCount = applicants.reduce((acc, applicant) => {
      const date = applicant.available_date || '未設定';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // 希望職種の集計
    const occupationCount = applicants.reduce((acc, applicant) => {
      if (!applicant.desired_occupation) return acc;
      
      const occupation = applicant.desired_occupation;
      acc[occupation] = (acc[occupation] || 0) + 1;
      return acc;
    }, {});
    
    // 希望職種の上位5つを取得
    const topOccupations = Object.entries(occupationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    
    return {
      employmentStatusCount,
      availableDateCount,
      topOccupations,
      totalApplicants: applicants.length
    };
  };

  // 面接結果のグラフを描画
  const renderInterviewChart = () => {
    if (!interviewStats) return null;
    
    return (
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <canvas ref={interviewChartRef} id="interviewChart"></canvas>
      </div>
    );
  };

  // 就業状況のグラフを描画
  const renderEmploymentStatusChart = () => {
    if (!applicantStats) return null;
    
    return (
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <canvas ref={employmentStatusChartRef} id="employmentStatusChart"></canvas>
      </div>
    );
  };

  // 就業可能時期のグラフを描画
  const renderAvailableDateChart = () => {
    if (!applicantStats) return null;
    
    return (
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <canvas ref={availableDateChartRef} id="availableDateChart"></canvas>
      </div>
    );
  };

  // 希望職種のグラフを描画
  const renderOccupationChart = () => {
    if (!applicantStats) return null;
    
    return (
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <canvas ref={occupationChartRef} id="occupationChart"></canvas>
      </div>
    );
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div>
      <h2>統計分析</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>概要</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <h4>総求職者数</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{applicantStats?.totalApplicants || 0}</p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <h4>総面接数</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{interviewStats?.total || 0}</p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <h4>面接合格率</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {interviewStats?.pass_rate ? interviewStats.pass_rate.toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div>
          {renderInterviewChart()}
        </div>
        <div>
          {renderEmploymentStatusChart()}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          {renderAvailableDateChart()}
        </div>
        <div>
          {renderOccupationChart()}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
