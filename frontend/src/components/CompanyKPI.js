import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

function CompanyKPI() {
  const [kpiData, setKpiData] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // week, month, quarter, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topEmployees, setTopEmployees] = useState([]);
  
  // グラフ用の色定義
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    // 会社KPIデータを取得
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/company/kpi?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setKpiData(data);
        
        // トップパフォーマーの社員も取得
        const employeesResponse = await fetch(`/api/company/top-performers?timeframe=${timeframe}`);
        if (!employeesResponse.ok) {
          throw new Error(`API error: ${employeesResponse.status}`);
        }
        const employeesData = await employeesResponse.json();
        setTopEmployees(employeesData);
        
        setLoading(false);
      } catch (error) {
        console.error('会社KPIデータ取得エラー:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [timeframe]);

  // デモ用のモックデータ作成
  useEffect(() => {
    // モックKPIデータ - 実際のアプリケーションではAPIから取得するはず
    const mockKpiData = {
      // サマリー指標
      summary: {
        totalApplicants: 320,
        totalCalls: 980,
        totalConnections: 720,
        totalProposals: 540,
        totalDocumentsSent: 420,
        totalDocumentsPassed: 320,
        totalInterviews: 280,
        totalOffers: 200,
        totalHires: 150,
        totalPayments: 130,
        totalRevenue: 39000000, // 3900万円
        conversionRate: 40.6, // %
        averageTimeToHire: 35, // days
      },
      
      // 変換率
      conversionRates: {
        callToConnection: 73.5, // 720/980
        connectionToProposal: 75.0, // 540/720
        proposalToDocument: 77.8, // 420/540
        documentToPass: 76.2, // 320/420
        interviewToOffer: 71.4, // 200/280
        offerToHire: 75.0, // 150/200
        hireToPayment: 86.7, // 130/150
      },
      
      // 月次進捗 - 折れ線グラフ用
      monthlyProgress: [
        { month: '4月', calls: 240, connections: 180, proposals: 135, documents: 105, passes: 80, interviews: 70, offers: 50, hires: 38, payments: 32, revenue: 9600000 },
        { month: '5月', calls: 250, connections: 185, proposals: 140, documents: 108, passes: 82, interviews: 72, offers: 52, hires: 39, payments: 34, revenue: 10200000 },
        { month: '6月', calls: 245, connections: 180, proposals: 135, documents: 104, passes: 79, interviews: 69, offers: 49, hires: 37, payments: 32, revenue: 9600000 },
        { month: '7月', calls: 245, connections: 175, proposals: 130, documents: 103, passes: 79, interviews: 69, offers: 49, hires: 36, payments: 32, revenue: 9600000 },
      ],
      
      // パイプライン分布 - 円グラフ用
      pipelineDistribution: [
        { name: '架電待ち', value: 70 },
        { name: '接続待ち', value: 90 },
        { name: '提案済み', value: 80 },
        { name: '書類送付済み', value: 60 },
        { name: '選考通過', value: 40 },
        { name: '面接調整中', value: 50 },
        { name: '内定待ち', value: 35 },
        { name: '入社待ち', value: 25 },
        { name: '入金待ち', value: 20 },
      ],
      
      // 部門パフォーマンス
      departmentPerformance: [
        { department: '営業部A', hires: 45, revenue: 13500000 },
        { department: '営業部B', hires: 38, revenue: 11400000 },
        { department: '営業部C', hires: 35, revenue: 10500000 },
        { department: 'カスタマーサポート', hires: 32, revenue: 3600000 },
      ],
      
      // 四半期目標vs実績
      quarterlyPerformance: [
        { quarter: 'Q1', target: 42, actual: 45 },
        { quarter: 'Q2', target: 48, actual: 52 },
        { quarter: 'Q3', target: 45, actual: 38 },
        { quarter: 'Q4', target: 40, actual: 15 }, // 進行中
      ],
    };
    
    // トップパフォーマーのモック
    const mockTopEmployees = [
      { id: 1, name: '田中 太郎', department: '営業部A', hires: 15, revenue: 4500000 },
      { id: 2, name: '佐藤 花子', department: '営業部B', hires: 12, revenue: 3600000 },
      { id: 3, name: '鈴木 一郎', department: '営業部A', hires: 10, revenue: 3000000 },
      { id: 4, name: '高橋 直子', department: '営業部C', hires: 9, revenue: 2700000 },
      { id: 5, name: '伊藤 和彦', department: '営業部B', hires: 8, revenue: 2400000 },
    ];
    
    setKpiData(mockKpiData);
    setTopEmployees(mockTopEmployees);
    setLoading(false);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
  };
  
  if (loading) {
    return <div>読み込み中...</div>;
  }
  
  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }
  
  if (!kpiData) {
    return <div>データが見つかりません</div>;
  }

  return (
    <div className="company-kpi-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>会社全体のKPI</h2>
        <div>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="week">直近1週間</option>
            <option value="month">直近1ヶ月</option>
            <option value="quarter">直近3ヶ月</option>
            <option value="year">直近1年</option>
          </select>
        </div>
      </div>
      
      {/* サマリーカード */}
      <div className="kpi-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>総求職者数</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.summary.totalApplicants}</p>
        </div>
        <div style={{ backgroundColor: '#fff0f5', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>成約数</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.summary.totalHires}</p>
        </div>
        <div style={{ backgroundColor: '#f0fff0', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>入金件数</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.summary.totalPayments}</p>
        </div>
        <div style={{ backgroundColor: '#fffacd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>総売上</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{formatCurrency(kpiData.summary.totalRevenue)}</p>
        </div>
      </div>
      
      <div className="kpi-summary-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#e6e6fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>応募者変換率</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.summary.conversionRate}%</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>応募から入社までの比率</p>
        </div>
        <div style={{ backgroundColor: '#f5f5dc', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>平均採用期間</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.summary.averageTimeToHire}日</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>応募から入社までの日数</p>
        </div>
        <div style={{ backgroundColor: '#f0ffff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>面接成功率</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.conversionRates.interviewToOffer}%</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>面接から内定までの比率</p>
        </div>
        <div style={{ backgroundColor: '#ffe4e1', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>書類通過率</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.conversionRates.documentToPass}%</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>書類送付から通過までの比率</p>
        </div>
      </div>
      
      {/* 売上推移 */}
      <div className="kpi-revenue-trend" style={{ marginBottom: '30px' }}>
        <h3>月次売上推移</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={kpiData.monthlyProgress}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" label={{ value: '人数', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: '売上', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => {
                if (name === '売上') return [formatCurrency(value), name];
                return [value, name];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="hires" name="入社数" fill="#8884d8" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="売上" stroke="#ff7300" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 変換ファネル */}
      <div className="kpi-conversion-funnel" style={{ marginBottom: '30px' }}>
        <h3>変換率ファネル</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: '求職者数', value: kpiData.summary.totalApplicants },
                { name: '架電数', value: kpiData.summary.totalCalls },
                { name: '接続数', value: kpiData.summary.totalConnections },
                { name: '提案数', value: kpiData.summary.totalProposals },
                { name: '書類送付', value: kpiData.summary.totalDocumentsSent },
                { name: '書類通過', value: kpiData.summary.totalDocumentsPassed },
                { name: '面接数', value: kpiData.summary.totalInterviews },
                { name: '内定数', value: kpiData.summary.totalOffers },
                { name: '入社数', value: kpiData.summary.totalHires },
                { name: '入金数', value: kpiData.summary.totalPayments },
              ]}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="件数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* パイプライン分布 */}
        <div className="kpi-pipeline">
          <h3>現在のパイプライン分布</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpiData.pipelineDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {kpiData.pipelineDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}人`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 部門別パフォーマンス */}
        <div className="kpi-department-performance">
          <h3>部門別成績</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kpiData.departmentPerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                <YAxis yAxisId="left" orientation="left" label={{ value: '入社数', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: '売上', angle: 90, position: 'insideRight' }} />
                <Tooltip formatter={(value, name, props) => {
                  if (name === '売上') return [formatCurrency(value), name];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="hires" name="入社数" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="revenue" name="売上" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 四半期目標vs実績 */}
      <div className="kpi-quarterly-performance" style={{ marginBottom: '30px' }}>
        <h3>四半期目標vs実績</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={kpiData.quarterlyPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis label={{ value: '入社数', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="target" name="目標" fill="#8884d8" />
              <Bar dataKey="actual" name="実績" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* トップパフォーマー */}
      <div className="kpi-top-employees" style={{ marginBottom: '30px' }}>
        <h3>トップパフォーマー</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>社員名</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>部署</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>入社数</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>売上</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>詳細</th>
              </tr>
            </thead>
            <tbody>
              {topEmployees.map((employee) => (
                <tr key={employee.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{employee.name}</td>
                  <td style={{ padding: '12px' }}>{employee.department}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{employee.hires}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(employee.revenue)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <Link to={`/employees/${employee.id}/kpi`} style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#2196F3', 
                      color: 'white', 
                      textDecoration: 'none',
                      borderRadius: '4px',
                    }}>
                      KPI詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 詳細KPIテーブル */}
      <div className="kpi-detailed-table">
        <h3>詳細KPI</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ステージ</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>件数</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>前ステージからの変換率</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>エントリーからの変換率</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>求職者総数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalApplicants}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>100%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>架電数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalCalls}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalCalls / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalCalls / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>接続数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalConnections}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.callToConnection.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalConnections / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>提案数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalProposals}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.connectionToProposal.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalProposals / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>書類送付数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalDocumentsSent}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.proposalToDocument.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalDocumentsSent / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>書類通過数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalDocumentsPassed}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.documentToPass.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalDocumentsPassed / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>面接数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalInterviews}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalInterviews / kpiData.summary.totalDocumentsPassed) * 100).toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalInterviews / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>内定数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalOffers}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.interviewToOffer.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalOffers / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>入社数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalHires}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.offerToHire.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalHires / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>入金数</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.summary.totalPayments}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{kpiData.conversionRates.hireToPayment.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{((kpiData.summary.totalPayments / kpiData.summary.totalApplicants) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>総売上</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(kpiData.summary.totalRevenue)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompanyKPI;
