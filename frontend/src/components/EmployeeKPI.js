import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

function EmployeeKPI() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // week, month, quarter, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // グラフ用の色定義
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    // 社員詳細データの取得
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/employees/${employeeId}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setEmployee(data);
        
        // 社員のKPIデータを取得
        const kpiResponse = await fetch(`/api/employees/${employeeId}/kpi?timeframe=${timeframe}`);
        if (!kpiResponse.ok) {
          throw new Error(`API error: ${kpiResponse.status}`);
        }
        const kpiData = await kpiResponse.json();
        setKpiData(kpiData);
        
        setLoading(false);
      } catch (error) {
        console.error('社員KPIデータ取得エラー:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, timeframe]);

  // デモンストレーション用のモックデータ作成
  useEffect(() => {
    if (!employee) return;
    
    // モックデータ - 実際のアプリケーションではAPIから取得するはず
    const mockKpiData = {
      name: employee.name,
      department: employee.department,
      position: employee.position,
      
      // サマリー指標
      summary: {
        totalApplicants: 45,
        totalCalls: 120,
        totalConnections: 80,
        totalProposals: 60,
        totalDocumentsSent: 40,
        totalDocumentsPassed: 30,
        totalInterviews: 25,
        totalOffers: 20,
        totalHires: 15,
        totalPayments: 12,
        totalRevenue: 3600000, // 360万円
      },
      
      // 変換率
      conversionRates: {
        callToConnection: 66.7, // 80/120
        connectionToProposal: 75.0, // 60/80
        proposalToDocument: 66.7, // 40/60
        documentToPass: 75.0, // 30/40
        interviewToOffer: 80.0, // 20/25
        offerToHire: 75.0, // 15/20
        hireToPayment: 80.0, // 12/15
      },
      
      // 月次進捗 - 折れ線グラフ用
      monthlyProgress: [
        { month: '4月', calls: 30, connections: 20, proposals: 15, documents: 10, passes: 8, interviews: 7, offers: 5, hires: 4, payments: 3 },
        { month: '5月', calls: 28, connections: 18, proposals: 14, documents: 9, passes: 7, interviews: 6, offers: 5, hires: 4, payments: 3 },
        { month: '6月', calls: 32, connections: 22, proposals: 16, documents: 11, passes: 8, interviews: 6, offers: 5, hires: 3, payments: 3 },
        { month: '7月', calls: 30, connections: 20, proposals: 15, documents: 10, passes: 7, interviews: 6, offers: 5, hires: 4, payments: 3 },
      ],
      
      // パイプライン分布 - 円グラフ用
      pipelineDistribution: [
        { name: '架電待ち', value: 10 },
        { name: '接続待ち', value: 15 },
        { name: '提案済み', value: 12 },
        { name: '書類送付済み', value: 8 },
        { name: '選考通過', value: 5 },
        { name: '面接調整中', value: 6 },
        { name: '内定待ち', value: 4 },
        { name: '入社待ち', value: 3 },
        { name: '入金待ち', value: 2 },
      ],
      
      // ステージ間の平均日数
      timeBetweenStages: [
        { name: '架電→接続', days: 2.3 },
        { name: '接続→提案', days: 1.8 },
        { name: '提案→書類送付', days: 3.5 },
        { name: '書類送付→通過', days: 7.2 },
        { name: '通過→面接', days: 5.4 },
        { name: '面接→内定', days: 4.8 },
        { name: '内定→入社', days: 12.5 },
        { name: '入社→入金', days: 25.2 },
      ],
    };
    
    setKpiData(mockKpiData);
    setLoading(false);
  }, [employee]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
  };
  
  if (loading) {
    return <div>読み込み中...</div>;
  }
  
  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }
  
  if (!employee || !kpiData) {
    return <div>データが見つかりません</div>;
  }

  return (
    <div className="employee-kpi-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{employee.name}のKPI管理</h2>
        <div>
          <Link to="/employees" style={{ marginRight: '15px', textDecoration: 'none' }}>← 社員一覧に戻る</Link>
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
      <div className="kpi-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>担当求職者数</h3>
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
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>売上</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{formatCurrency(kpiData.summary.totalRevenue)}</p>
        </div>
        <div style={{ backgroundColor: '#e6e6fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>面接成功率</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{kpiData.conversionRates.interviewToOffer}%</p>
        </div>
      </div>
      
      {/* 変換率 */}
      <div className="kpi-conversion-rates" style={{ marginBottom: '30px' }}>
        <h3>コンバージョン率</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: '架電→接続', rate: kpiData.conversionRates.callToConnection },
                { name: '接続→提案', rate: kpiData.conversionRates.connectionToProposal },
                { name: '提案→書類送付', rate: kpiData.conversionRates.proposalToDocument },
                { name: '書類→通過', rate: kpiData.conversionRates.documentToPass },
                { name: '面接→内定', rate: kpiData.conversionRates.interviewToOffer },
                { name: '内定→入社', rate: kpiData.conversionRates.offerToHire },
                { name: '入社→入金', rate: kpiData.conversionRates.hireToPayment },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis domain={[0, 100]} label={{ value: '%', position: 'insideLeft', angle: -90 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="rate" fill="#8884d8" name="コンバージョン率" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 月次進捗 */}
      <div className="kpi-monthly-progress" style={{ marginBottom: '30px' }}>
        <h3>月次進捗状況</h3>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={kpiData.monthlyProgress}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#8884d8" name="架電数" />
              <Line type="monotone" dataKey="connections" stroke="#82ca9d" name="接続数" />
              <Line type="monotone" dataKey="proposals" stroke="#ffc658" name="提案数" />
              <Line type="monotone" dataKey="documents" stroke="#ff8042" name="書類送付数" />
              <Line type="monotone" dataKey="passes" stroke="#0088FE" name="書類通過数" />
              <Line type="monotone" dataKey="interviews" stroke="#00C49F" name="面接数" />
              <Line type="monotone" dataKey="offers" stroke="#FFBB28" name="内定数" />
              <Line type="monotone" dataKey="hires" stroke="#FF8042" name="入社数" />
              <Line type="monotone" dataKey="payments" stroke="#8884d8" name="入金数" />
            </LineChart>
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
        
        {/* ステージ間の時間 */}
        <div className="kpi-time-between-stages">
          <h3>ステージ間の平均所要日数</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kpiData.timeBetweenStages}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis label={{ value: '日数', position: 'insideLeft', angle: -90 }} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}日`, '平均所要日数']} />
                <Bar dataKey="days" fill="#82ca9d" name="平均所要日数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                <td style={{ padding: '12px' }}>担当求職者数</td>
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
                <td style={{ padding: '12px', fontWeight: 'bold' }}>売上</td>
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

export default EmployeeKPI;
