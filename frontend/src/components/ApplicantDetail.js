import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function ApplicantDetail() {
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // タブ状態管理
  const [progress, setProgress] = useState({
    application_date: null,
    call_date: null,
    connection_date: null,
    proposal_date: null,
    document_sent_date: null,
    document_passed_date: null,
    interview_date: null,
    offer_date: null,
    hire_date: null,
    payment_date: null
  });
  const [referralFee, setReferralFee] = useState('');
  const { applicantId } = useParams();
  const navigate = useNavigate();

  // 社員一覧を管理するステート
  const [employees, setEmployees] = useState([]);
  // 担当社員IDを管理するステート
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  // マッチング機能用のステート
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchingError, setMatchingError] = useState(null);
  const [sortBy, setSortBy] = useState('age_limit'); // デフォルトは年齢上限順

  useEffect(() => {
    // Axiosのグローバル設定（コンポーネント初期化時に一度だけ設定）
     // baseURLを空文字列に設定して相対パスを使用
    axios.defaults.baseURL = '';  // 空の文字列に設定
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    // 求職者詳細データと社員一覧を取得
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('求職者データと社員一覧の取得を開始');

        // 求職者データの取得
        const applicantResponse = await axios.get(`/api/applicants/${applicantId}`);
        if (applicantResponse.status !== 200) {
          throw new Error(`API error: ${applicantResponse.status}`);
        }

        const applicantData = applicantResponse.data;
        
        // デバッグ情報を詳細に出力
        console.log('取得した求職者データ:', applicantData);
        console.log('担当社員情報:', {
          employee_id: applicantData.employee_id,
          assigned_employee_id: applicantData.assigned_employee_id,
          dataType: typeof(applicantData.employee_id || applicantData.assigned_employee_id)
        });
        
        setApplicant(applicantData);

        // 進捗情報の設定
        if (applicantData.progress) {
          setProgress(applicantData.progress);
        } else {
          // 既存のフィールドから進捗情報を抽出
          const progressData = {};
          ['application_date', 'call_date', 'connection_date', 'proposal_date',
           'document_sent_date', 'document_passed_date', 'interview_date',
           'offer_date', 'hire_date', 'payment_date'].forEach(field => {
            progressData[field] = applicantData[field] || null;
          });
          setProgress(progressData);
        }

        // 紹介料情報の設定
        if (applicantData.referral_fee) {
          setReferralFee(applicantData.referral_fee);
        }

        // 担当社員IDの設定 - 両方のフィールド名をチェック
        if (applicantData.assigned_employee_id) {
          console.log('assigned_employee_idを設定:', applicantData.assigned_employee_id);
          // 文字列に統一して設定
          setAssignedEmployeeId(String(applicantData.assigned_employee_id));
        } else if (applicantData.employee_id) {
          console.log('employee_idを設定:', applicantData.employee_id);
          // 文字列に統一して設定
          setAssignedEmployeeId(String(applicantData.employee_id));
        } else {
          console.log('担当社員IDがありません');
          setAssignedEmployeeId('');
        }

        // 社員一覧の取得
        const employeesResponse = await axios.get('/api/employees');
        if (employeesResponse.status === 200) {
          setEmployees(employeesResponse.data);
          console.log('取得した社員一覧:', employeesResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`データの取得に失敗しました: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [applicantId]);

  // applicantが変更されたときに担当社員IDを同期するための専用useEffect
  useEffect(() => {
    if (applicant) {
      const employeeId = applicant.employee_id || applicant.assigned_employee_id;
      if (employeeId !== undefined && employeeId !== null) {
        console.log('applicant変更による担当社員ID更新:', employeeId);
        setAssignedEmployeeId(String(employeeId));
      }
    }
  }, [applicant]);

  // 日付フォーマットの検証と変換関数
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null; // 無効な日付
      return date.toISOString().split('T')[0]; // YYYY-MM-DD形式に変換
    } catch (e) {
      console.error('日付変換エラー:', e);
      return null;
    }
  };

  // 進捗状況が変更されたときの処理
  const handleProgressChange = async (field, value) => {
    try {
      console.log('applicantId:', applicantId);
      console.log('更新フィールド:', field, '値:', value);
      // 日付フィールドの前処理
      const formattedValue = field.endsWith('_date') ? formatDateForAPI(value) : value;
      const updatedProgress = { ...progress, [field]: formattedValue };
      setProgress(updatedProgress);

      // リクエストオプションを明示的に設定
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      };

      console.log('リクエスト送信先:', `/api/applicants/${applicantId}/progress`);
      console.log('送信データ:', updatedProgress);
      // APIを呼び出して進捗状況を更新
      const progressResponse = await axios.put(
        `/api/applicants/${applicantId}/progress`,
        updatedProgress,
        options
      );

      // レスポンスを確認
      console.log('APIレスポンス:', progressResponse);
      if (progressResponse.status !== 200) {
        throw new Error(`API error: ${progressResponse.status}`);
      }
      showSuccessMessage('進捗状況を更新しました');
    } catch (error) {
      console.error('Error updating progress:', error);
      // エラーオブジェクトの詳細情報を取得
      let errorMessage = `進捗状況の更新に失敗しました: ${error.message}`;
      // レスポンスデータが存在する場合は追加
      if (error.response) {
        console.log('Error response:', error.response);
        errorMessage += ` (Status: ${error.response.status})`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        // リクエストは送られたがレスポンスがない場合
        console.log('Error request:', error.request);
        errorMessage += ' - サーバーからの応答がありません。';
      }
      setError(errorMessage);
    }
  };

  const handleEmployeeChange = async (employeeId) => {
    try {
      console.log('担当社員変更:', employeeId, typeof employeeId);
      
      // IDを即時反映（API成功を待たずに）
      setAssignedEmployeeId(employeeId);
      
      // フィールド名をemployee_idに変更
      const requestData = {
        employee_id: employeeId  // assigned_employee_id ではなく employee_id
      };
      
      console.log('送信データ:', requestData);
      
      const response = await axios.put(
        `/api/applicants/${applicantId}/assign-employee`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log('API応答:', response.data);
      showSuccessMessage('担当社員を更新しました');
      
      // 成功したら画面上の求職者データも更新
      setApplicant(prev => ({
        ...prev,
        employee_id: employeeId,
        assigned_employee_id: employeeId
      }));
      
    } catch (error) {
      console.error('Error updating assigned employee:', error);
      
      // エラーが発生した場合は元の値に戻す
      if (applicant && (applicant.employee_id || applicant.assigned_employee_id)) {
        setAssignedEmployeeId(String(applicant.employee_id || applicant.assigned_employee_id));
      } else {
        setAssignedEmployeeId('');
      }
      
      let errorMessage = `担当社員の更新に失敗しました: ${error.message}`;
      
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      }
      
      setError(errorMessage);
    }
  };

  // 求職者データを再取得する関数
  const fetchApplicantData = async () => {
    try {
      console.log('求職者データを再取得します');
      const response = await axios.get(`/api/applicants/${applicantId}`);
      
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const applicantData = response.data;
      console.log('再取得した求職者データ:', applicantData);
      setApplicant(applicantData);
      
      // 担当社員IDを再設定
      if (applicantData.assigned_employee_id) {
        setAssignedEmployeeId(String(applicantData.assigned_employee_id));
      } else if (applicantData.employee_id) {
        setAssignedEmployeeId(String(applicantData.employee_id));
      }
    } catch (error) {
      console.error('Error re-fetching applicant data:', error);
      setError(`データの再取得に失敗しました: ${error.message}`);
    }
  };

  // 紹介料が変更されたときの処理
  const handleReferralFeeChange = (e) => {
    // 数字のみ許可
    const value = e.target.value.replace(/[^\d]/g, '');
    setReferralFee(value);
  };

  // 紹介料を保存する処理
  const saveReferralFee = async () => {
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      };

      console.log('紹介料保存リクエスト:', { referral_fee: referralFee });
      const referralFeeResponse = await axios.put(
        `/api/applicants/${applicantId}/referral-fee`,
        { referral_fee: referralFee },
        options
      );

      if (referralFeeResponse.status !== 200) {
        throw new Error(`API error: ${referralFeeResponse.status}`);
      }
      showSuccessMessage('紹介料を保存しました');
    } catch (error) {
      console.error('Error saving referral fee:', error);
      let errorMessage = `紹介料の保存に失敗しました: ${error.message}`;
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.request) {
        errorMessage += ' - サーバーからの応答がありません。';
      }
      setError(errorMessage);
    }
  };

  // マッチング求人を取得する処理
  const fetchMatchingJobs = async (sort = sortBy) => {
    try {
      setIsLoadingMatches(true);
      setMatchingError(null);
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      console.log(`マッチング求人の取得を開始: applicantId=${applicantId}, sort=${sort}`);
      const response = await axios.get(
        `/api/matching/applicant/${applicantId}?sort_by=${sort}`,
        options
      );

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      console.log('マッチング求人取得成功:', response.data.length, '件');
      setMatchingJobs(response.data);
      setIsLoadingMatches(false);
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
      setMatchingError(`マッチング求人の取得に失敗しました: ${error.message}`);
      setIsLoadingMatches(false);
    }
  };

  // ソート方法変更時の処理
  const handleSortChange = (newSortBy) => {
    console.log('ソート方法変更:', newSortBy);
    setSortBy(newSortBy);
    fetchMatchingJobs(newSortBy);
  };

  // 成功メッセージを表示する処理
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    // エラーメッセージがあれば消去
    setError(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return (
      <div>
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          エラーが発生しました: {error}
        </div>
        <button
          onClick={() => setError(null)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          エラーを閉じる
        </button>
      </div>
    );
  }

  if (!applicant) {
    return <div>求職者情報が見つかりません</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 成功メッセージの表示 */}
      {successMessage && (
        <div style={{
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          {successMessage}
        </div>
      )}

      {/* エラーメッセージの表示 */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              backgroundColor: 'transparent',
              color: '#721c24',
              border: '1px solid #721c24',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/applicants" style={{ textDecoration: 'none', color: '#333' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '5px' }}>&larr;</span> 求職者一覧に戻る
          </div>
        </Link>
        <h2 style={{ margin: 0 }}>{applicant.name} さん</h2>
      </div>

      {/* 進捗状況と紹介料セクション */}
      <div style={{ display: 'flex', marginBottom: '30px', gap: '25px', flexWrap: 'wrap' }}>
        {/* 進捗状況トラッカー */}
        <div style={{
          flex: '3',
          minWidth: '650px',
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>進捗状況</h3>
            {/* 担当社員選択プルダウン - 新しく追加 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="assigned-employee" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                担当社員:
              </label>
              <select
                id="assigned-employee"
                value={assignedEmployeeId || ''}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  minWidth: '150px'
                }}
              >
                <option value="">選択してください</option>
                {employees.map(employee => {
                  // 値を文字列に統一
                  const employeeIdStr = String(employee.id);
                  const isSelected = employeeIdStr === assignedEmployeeId;
                  
                  return (
                    <option 
                      key={employeeIdStr} 
                      value={employeeIdStr}
                    >
                      {employee.name} {employee.department ? `(${employee.department})` : ''}
                      {isSelected ? ' ' : ''}
                    </option>
                  );
                })}
              </select>
              {/* 現在の選択状態をデバッグ表示（開発時のみ） 
              {process.env.NODE_ENV !== 'production' && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginLeft: '10px',
                }}>
                  ID: {assignedEmployeeId || 'なし'}
                </div>*/}
              
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'space-between'
          }}>
            {[
              { label: '応募', field: 'application_date' },
              { label: '架電', field: 'call_date' },
              { label: '接続', field: 'connection_date' },
              { label: '提案', field: 'proposal_date' },
              { label: 'F送付', field: 'document_sent_date' },
              { label: 'F通過', field: 'document_passed_date' },
              { label: '面接済', field: 'interview_date' },
              { label: '内定', field: 'offer_date' },
              { label: '入社', field: 'hire_date' },
              { label: '入金', field: 'payment_date' }
            ].map((step, index, arr) => {
              const hasDate = progress[step.field] !== null && progress[step.field] !== undefined && progress[step.field] !== '';
              const isCompleted = hasDate;
              return (
                <div
                  key={step.field}
                  style={{
                    width: 'calc(10% - 10px)',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {/* 進捗線の表示 */}
                  {index < arr.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '-50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: isCompleted ? '#4CAF50' : '#ddd',
                      zIndex: 1
                    }}></div>
                  )}
                  {/* ステップアイコン */}
                  <div style={{
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#4CAF50' : '#ddd',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto',
                    color: 'white',
                    fontWeight: 'bold',
                    position: 'relative',
                    zIndex: 2,
                    fontSize: '12px'
                  }}>
                    {index + 1}
                  </div>
                  {/* ステップラベル */}
                  <div style={{ marginTop: '5px', fontSize: '12px' }}>
                    {step.label}
                  </div>
                  {/* 日付入力 */}
                  <input
                    type="date"
                    value={progress[step.field] || ''}
                    onChange={(e) => handleProgressChange(step.field, e.target.value)}
                    style={{
                      marginTop: '5px',
                      padding: '3px',
                      width: '100%',
                      fontSize: '10px'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 紹介料フォーム */}
        <div style={{
          flex: '1',
          minWidth: '250px',
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>紹介料</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              紹介料金額:
            </label>
            <div style={{ display: 'flex' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px 0 0 4px'
              }}>¥</span>
              <input
                value={referralFee}
                onChange={handleReferralFeeChange}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '0 4px 4px 0',
                  borderLeft: 'none'
                }}
                placeholder="例: 300000"
              />
            </div>
          </div>
          <button
            onClick={saveReferralFee}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            紹介料を保存
          </button>
        </div>
      </div>

      {/* タブナビゲーション - マッチングタブを追加 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #ddd',
        marginBottom: '15px',
        overflow: 'auto'
      }}>
        {['basic', 'work', 'physical', 'other', 'matching'].map(tab => {
          const labels = {
            'basic': '基本情報',
            'work': '就業情報',
            'physical': '身体情報',
            'other': 'その他の情報',
            'matching': 'マッチング求人'
          };
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // マッチングタブを選択時に自動的にデータ取得
                if (tab === 'matching' && matchingJobs.length === 0) {
                  fetchMatchingJobs();
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab ? '#f5f5f5' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #2196F3' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                color: activeTab === tab ? '#2196F3' : '#333'
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        {activeTab === 'basic' && (
          <div className="tab-content">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">氏名</span>
                  <span className="info-value">{applicant.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">生年月日</span>
                  <span className="info-value">{applicant.birthdate || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">住所</span>
                  <span className="info-value">{applicant.address || '情報なし'}</span>
                </div>
              </div>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">メール</span>
                  <span className="info-value">{applicant.email || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">電話番号</span>
                  <span className="info-value">{applicant.phone_number || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">性別 / 国籍</span>
                  <span className="info-value">{applicant.gender || '不明'} / {applicant.nationality || '不明'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'work' && (
          <div className="tab-content">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">希望職種</span>
                  <span className="info-value">{applicant.desired_occupation || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">希望勤務地</span>
                  <span className="info-value">{applicant.desired_location || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">就業状況</span>
                  <span className="info-value">{applicant.employment_status || '情報なし'}</span>
                </div>
              </div>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">就業可能時期</span>
                  <span className="info-value">{applicant.available_date || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">就業期間</span>
                  <span className="info-value">{applicant.employment_period || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">希望給与</span>
                  <span className="info-value">{applicant.desired_salary || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">希望勤務時間</span>
                  <span className="info-value">{applicant.desired_working_hours || '情報なし'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'physical' && (
          <div className="tab-content">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">身長</span>
                  <span className="info-value">{applicant.height || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">体重</span>
                  <span className="info-value">{applicant.weight || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">作業服サイズ</span>
                  <span className="info-value">{applicant.clothing_size || '情報なし'}</span>
                </div>
              </div>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">既往歴</span>
                  <span className="info-value">{applicant.medical_history || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">障害者手帳</span>
                  <span className="info-value">{applicant.disability_certificate || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">タトゥー</span>
                  <span className="info-value">
                    {applicant.tattoo || '情報なし'}
                    {applicant.tattoo === '有' && applicant.tattoo_details ? `（${applicant.tattoo_details}）` : ''}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">逮捕歴/犯罪歴</span>
                  <span className="info-value">{applicant.criminal_record || '情報なし'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'other' && (
          <div className="tab-content">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">通勤/入寮</span>
                  <span className="info-value">{applicant.commute_or_dormitory || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">通勤手段</span>
                  <span className="info-value">{applicant.commute_method || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">通勤圏内/最寄り駅</span>
                  <span className="info-value">{applicant.commute_area || '情報なし'}</span>
                </div>
              </div>
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">工場経験</span>
                  <span className="info-value">{applicant.factory_experience || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">最重要ポイント</span>
                  <span className="info-value">{applicant.most_important_point || '情報なし'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">最近の応募先</span>
                  <span className="info-value">{applicant.recent_applications || '情報なし'}</span>
                </div>
              </div>
            </div>

            {(applicant.experience_details || applicant.important_point_details) && (
              <div style={{ marginTop: '15px' }}>
                {applicant.experience_details && (
                  <div className="info-item" style={{ marginBottom: '15px' }}>
                    <span className="info-label">経験詳細</span>
                    <span className="info-value" style={{ whiteSpace: 'pre-wrap', display: 'block', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                      {applicant.experience_details}
                    </span>
                  </div>
                )}

                {applicant.important_point_details && (
                  <div className="info-item">
                    <span className="info-label">重要ポイント詳細</span>
                    <span className="info-value" style={{ whiteSpace: 'pre-wrap', display: 'block', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                      {applicant.important_point_details}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 新しいマッチング求人タブコンテンツ (新しいAPIに対応) */}
        {activeTab === 'matching' && (
          <div className="tab-content">
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>マッチング求人</h3>
              <div>
                <label htmlFor="sort-select" style={{ marginRight: '8px' }}>ソート:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  style={{ padding: '5px', borderRadius: '4px' }}
                >
                  <option value="age_limit">年齢上限順</option>
                  <option value="location">希望勤務地優先</option>
                </select>
              </div>
            </div>

            {isLoadingMatches ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>マッチング求人を検索中...</p>
              </div>
            ) : matchingError ? (
              <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                <p>{matchingError}</p>
              </div>
            ) : matchingJobs.length > 0 ? (
              <div>
                {/* 求職者の年齢情報を表示 */}
                {matchingJobs[0].applicant_age && (
                  <div style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px'
                  }}>
                    <p style={{ margin: 0 }}>
                      <strong>求職者の年齢:</strong> {matchingJobs[0].applicant_age}歳
                      {sortBy === 'age_limit' && ' (年齢条件を満たす求人を優先的に表示しています)'}
                      {sortBy === 'location' && ' (希望勤務地に一致する求人を優先的に表示しています)'}
                    </p>
                  </div>
                )}

                {/* 求人リスト */}
                {matchingJobs.map((result, index) => (
                  <div key={index} style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0 }}>{result.job.title || result.job.company}</h4>
                      {/* 年齢条件バッジ */}
                      <div style={{
                        padding: '3px 8px',
                        backgroundColor: result.age_match ? '#e8f5e9' : '#ffebee',
                        color: result.age_match ? '#2e7d32' : '#c62828',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {result.age_match
                          ? <span>年齢条件OK</span>
                          : <span>年齢超過</span>}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {/* 年齢上限バッジ */}
                      {result.job.age_limit && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '0.85em'
                        }}>
                          年齢上限: {result.job.age_limit}歳
                        </span>
                      )}

                      {/* 希望勤務地マッチバッジ */}
                      {result.location_match > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '0.85em'
                        }}>
                          勤務地マッチ: {result.location_match === 100 ? '完全一致' : '部分一致'}
                        </span>
                      )}
                    </div>

                    <p><strong>企業:</strong> {result.job.company}</p>
                    <p><strong>勤務地:</strong> {result.job.prefecture} {result.job.city || ''}</p>
                    <p><strong>給与:</strong> {result.job.salary || '情報なし'}</p>
                    <div style={{ textAlign: 'right' }}>
                      <Link to={`/jobs/${result.job.id}`}>
                        <button style={{
                          padding: '5px 10px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          詳細を見る
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p>マッチする求人が見つかりませんでした。</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 操作ボタン */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to={`/applicants/${applicant.id}/matching`}>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            この求職者に合う求人を探す
          </button>
        </Link>
        <button
          onClick={() => navigate(`/interviews/add?applicantId=${applicant.id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          面接を登録
        </button>
        <button
          onClick={() => navigate(`/phone-calls/add?applicantId=${applicant.id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          架電記録を追加
        </button>
        <button
          onClick={() => navigate(`/applicants/edit/${applicant.id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          編集
        </button>
      </div>

      {/* インラインCSS */}
      <style>{`
        .tab-content {
          animation: fadeIn 0.3s ease;
        }
        .info-group {
          margin-bottom: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 15px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 768px) {
          button {
            padding: 8px 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default ApplicantDetail;
