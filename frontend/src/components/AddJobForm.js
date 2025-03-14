import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddJobForm() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState('cnt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    // ファイル形式の検証
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Excelファイル（.xlsx または .xls）を選択してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('sheetType', selectedSheet);

      const response = await fetch('/api/upload-job-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);

      setSuccess(true);
      setFile(null);

      // 3秒後に求人一覧ページに戻る
      setTimeout(() => {
        navigate('/jobs');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 手動入力フォーム用の状態
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        job_url: '',
        job_number: '',
        cf_fc: '',
        prefecture: '',
        city: '',
        salary: '',
        fee: '',
        age_limit: '',
        description: '',
        requirements: '',
        benefits: '',
        working_hours: '',
        employment_type: '',
        holidays: '',
        dormitory: false,
        housing_cost: '',
        housing_allowance: '',
        work_style: '',
        annual_holidays: '',
        gender: '',
        min_age: '',
        max_age: '',
        work_experience: '',
        occupation_experience: '',
        japanese_required: false,
        commute_method: '',
        nearest_station: '',
        salary_type: '',
        hourly_wage: '',
        shift: '',
        products: '',
        occupation_major_category: '',
        occupation_minor_category: '',
        advantages: '',
        smoking_measures: ''
    });

  // 手動入力フィールドの変更を処理
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

  // 手動入力フォームの送信
  const handleManualSubmit = async (event) => {
    event.preventDefault();
    
    // 必須フィールドの検証
    if (!formData.title || !formData.company) {
      setError('求人タイトルと会社名は必須です');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/jobs', {
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
      
      const data = await response.json();
      console.log('Success:', data);
      
      setSuccess(true);
      
      // フォームをリセット
      setFormData({
        title: '',
        company: '',
        job_url: '',
        job_number: '',
        cf_fc: '',
        prefecture: '',
        city: '',
        salary: '',
        fee: '',
        age_limit: '',
        description: '',
        requirements: '',
        benefits: '',
        working_hours: '',
        employment_type: '',
        holidays: '',
        dormitory: false,
        housing_cost: '',
        housing_allowance: '',
        work_style: '',
        annual_holidays: '',
        gender: '',
        min_age: '',
        max_age: '',
        work_experience: '',
        occupation_experience: '',
        japanese_required: false,
        commute_method: '',
        nearest_station: '',
        salary_type: '',
        hourly_wage: '',
        shift: '',
        products: '',
        occupation_major_category: '',
        occupation_minor_category: '',
        advantages: '',
        smoking_measures: ''
      });
      
      // 3秒後に求人一覧ページに戻る
      setTimeout(() => {
        navigate('/jobs');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // スタイル定義
  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  };
  
  const formGroupStyle = {
    marginBottom: '15px',
  };
  
  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  };
  
  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };
  
  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };
  
  const errorStyle = {
    color: 'red',
    marginBottom: '15px',
  };
  
  const successStyle = {
    color: 'green',
    marginBottom: '15px',
  };
  
  const tabStyle = {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
  };
  
  const tabButtonStyle = (active) => ({
    padding: '10px 20px',
    backgroundColor: active ? '#f0f0f0' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #4CAF50' : 'none',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
  });

  // タブ切り替え用の状態
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div style={containerStyle}>
      <h2>求人情報追加</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>求人情報が正常に追加されました。求人一覧ページに戻ります...</div>}
      
      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'upload')} 
          onClick={() => setActiveTab('upload')}
        >
          Excelファイルアップロード
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'manual')} 
          onClick={() => setActiveTab('manual')}
        >
          手動入力
        </button>
      </div>
      
      {activeTab === 'upload' ? (
        <div>
          <p>求人情報が記載されたExcelファイルをアップロードしてください。</p>
          <p>以下のいずれかのシートを含むExcelファイルをアップロードしてください：</p>
          
          <div style={formGroupStyle}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
                <input
                  type="radio"
                  name="sheetType"
                  value="cnt"
                  checked={selectedSheet === 'cnt'}
                  onChange={() => setSelectedSheet('cnt')}
                  style={{ marginRight: '8px' }}
                />
                シート名: "新案件共有データ(CNT)最新"
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="sheetType"
                  value="aim"
                  checked={selectedSheet === 'aim'}
                  onChange={() => setSelectedSheet('aim')}
                  style={{ marginRight: '8px' }}
                />
                シート名: "新案件共有データ(AIM)最新"
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>必要な列情報:</h4>
            {selectedSheet === 'cnt' ? (
              <div>
                <p style={{ fontSize: '14px', margin: '0 0 5px 0' }}>シート「新案件共有データ(CNT)最新」には以下の列が必要です：</p>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px', backgroundColor: '#fff', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  注力フラグ, ジョブパルＵＲＬ, お仕事№, cf / fc / 事業所, 企業名 / 工場名, 所在地（都道府県）, 所在地（市区町村以降）, 当月欠員数, 次月欠員数(見込), フィー, 職場見学, 職場見学に関する備考, 入寮可否, 社宅費負担, 社宅費補助額, 社宅費補助額に関する備考, 家族入寮, カップル入居可否, 引っ越し費用, 総支給額, 基準内賃金, 法定内残業手当, 法定外残業手当, 深夜手当, 休日出勤手当, 雇用形態, 勤務形態, 年間休日, 休日, 休日・休暇に関する備考, 性別1, 年齢下限1, 年齢上限1, 制服サイズ上限, ウエストサイズ上限, BMI制限, BMI上限, 業務経験1, 業務経験詳細1, 職種経験1, 職種経験詳細1, 配属可能条件に関する備考1, 外国人受け入れ, カップル入社, 【刺青】可否, 【刺青】可能条件, 事業会社, bu / ユニット, cc / セクション, 配属スケジュールに関する備考, 想定LT, 可能通勤手段, 通勤に関する備考, 最寄り駅（駅名）, 給与形態, 時給, シフト, 勤務時間に関する備考, 休暇有無, 試用期間, 契約期間※有期の場合, 生産品目, 職種①大分類, 職種①小分類, 職種②大分類, 職種②小分類, 業務内容詳細, メリット（訴求ポイント）, 受動喫煙防止対策, （月平均）法定内残業, （月平均）法定外残業, 勤務時間開始１, 勤務時間終了１, 休憩時間合計１, 勤務時間開始２, 勤務時間終了２, 休憩時間合計２, 勤務時間開始３, 勤務時間終了３, 休憩時間合計３, 勤務時間開始４, 勤務時間終了４, 休憩時間合計４, 勤務時間開始５, 勤務時間終了５, 休憩時間合計５, 入社祝金, 入社祝金に関する備考, 特別待遇, 特別待遇に関する備考, その他キャンペーン, その他キャンペーンに関する備考, 性別1, 年齢下限1, 年齢上限1, 業務経験1, 業務経験詳細1, 職種経験1, 職種経験詳細1, 配属可能条件に関する備考1, 性別2, 年齢下限2, 年齢上限2, 業務経験2, 業務経験詳細2, 職種経験2, 職種経験詳細2, 配属可能条件に関する備考2, 性別3, 年齢下限3, 年齢上限3, 業務経験3, 業務経験詳細3, 職種経験3, 職種経験詳細3, 配属可能条件に関する備考3, 性別4, 年齢下限4, 年齢上限4, 業務経験4, 業務経験詳細4, 職種経験4, 職種経験詳細4, 配属可能条件に関する備考4, 性別5, 年齢下限5, 年齢上限5, 業務経験5, 業務経験詳細5, 職種経験5, 職種経験詳細5, 配属可能条件に関する備考5, 【明るい髪色】可否, 【明るい髪色】可能条件, 【ひげ】可否, 【ひげ】可能条件, 【ネイル】可否, 【ネイル】可能条件, 【化粧】可否, 【化粧】可能条件, 【アクセサリー】可否, 【アクセサリー】可能条件, 求人広告掲載, 業務内容の変更の範囲, 就業場所の変更の範囲
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', margin: '0 0 5px 0' }}>シート「新案件共有データ(AIM)最新」には以下の列が必要です：</p>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px', backgroundColor: '#fff', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  ジョブパルＵＲＬ, 優先度, 条件フラグ※案件の特徴, お仕事№, cf / fc / 事業所, 企業名 / 工場名, 所在地（都道府県）, 所在地（市区町村以降）, 当月欠員数, 翌月欠員数(見込), 翌々月欠員数(見込), Fee, 入社祝金, 入社祝金に関する備考, 入寮可否, 社宅費負担, 社宅費補助額, 社宅費補助額に関する備考, 家族入寮, カップル入居, カップル入社, 引っ越し費用, 総支給額, 雇用形態, 勤務形態, 年間休日, 休日, 休日備考, 性別1, 年齢下限1, 年齢上限1, 制服サイズ上限, ウエストサイズ, BMI上限, 身長下限, 身長上限, 業務経験1, 業務経験詳細1, 職種経験1, 職種経験詳細1, 配属可能条件に関する備考1, 外国人受け入れ, 【刺青】可否, 【刺青】可能条件, 事業会社, bu / ユニット, cc / セクション, 配属スケジュールに関する備考, 可能通勤手段, 通勤に関する備考, 最寄り駅（駅名）, 給与形態, 時給, 基準内賃金, 法定外残業手当, 深夜手当, シフト, 勤務時間に関する備考, 長期休暇有無, 試用期間, 雇用形態, 生産品目, 業務内容詳細, メリット（訴求ポイント）, 受動喫煙防止対策, 工場見学の有無, 工場見学に関する備考, （月平均）法定内残業, （月平均）法定外残業, 勤務時間開始１, 勤務時間終了１, 休憩時間合計１, 勤務時間開始２, 勤務時間終了２, 休憩時間合計２, 勤務時間開始３, 勤務時間終了３, 休憩時間合計３, 勤務時間開始４, 勤務時間終了４, 休憩時間合計４, 勤務時間開始５, 勤務時間終了５, 休憩時間合計５, 特別待遇, 特別待遇に関する備考, その他キャンペーン, その他キャンペーンに関する備考, 性別2, 年齢下限2, 年齢上限2, 業務経験2, 業務経験詳細2, 職種経験2, 職種経験詳細2, 配属可能条件に関する備考2, 性別3, 年齢下限3, 年齢上限3, 業務経験3, 業務経験詳細3, 職種経験3, 職種経験詳細3, 配属可能条件に関する備考3, 性別4, 年齢下限4, 年齢上限4, 業務経験4, 業務経験詳細4, 職種経験4, 職種経験詳細4, 配属可能条件に関する備考4, 性別5, 年齢下限5, 年齢上限5, 業務経験5, 業務経験詳細5, 職種経験5, 職種経験詳細5, 配属可能条件に関する備考5, 【明るい髪色】可否, 【明るい髪色】可能条件, 【ひげ】可否, 【ひげ】可能条件, 【ネイル】可否, 【ネイル】可能条件, 【化粧】可否, 【化粧】可能条件, 【アクセサリー】可否, 【アクセサリー】
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label htmlFor="file" style={labelStyle}>Excelファイル:</label>
              <input
                type="file"
                id="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={inputStyle}
              />
            </div>
            <button 
              type="submit" 
              style={buttonStyle}
              disabled={loading || !file}
            >
              {loading ? 'アップロード中...' : 'アップロード'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <p>求人情報を手動で入力してください。</p>
          
          <form onSubmit={handleManualSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={formGroupStyle}>
                  <label htmlFor="title" style={labelStyle}>求人タイトル: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div style={formGroupStyle}>
                  <label htmlFor="company" style={labelStyle}>会社名: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="job_url" style={labelStyle}>ジョブパルURL:</label>
                  <input
                    type="text"
                    id="job_url"
                    value={formData.job_url}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="job_number" style={labelStyle}>お仕事No:</label>
                  <input
                    type="text"
                    id="job_number"
                    value={formData.job_number}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="cf_fc" style={labelStyle}>cf / fc / 事業所:</label>
                  <input
                    type="text"
                    id="cf_fc"
                    value={formData.cf_fc}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="prefecture" style={labelStyle}>都道府県:</label>
                  <input
                    type="text"
                    id="prefecture"
                    value={formData.prefecture}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <div style={formGroupStyle}>
                  <label htmlFor="city" style={labelStyle}>市区町村:</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="salary" style={labelStyle}>給与:</label>
                  <input
                    type="text"
                    id="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="fee" style={labelStyle}>フィー:</label>
                  <input
                    type="text"
                    id="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="description" style={labelStyle}>業務内容詳細:</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{...inputStyle, minHeight: '100px'}}
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              style={buttonStyle}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddJobForm;
