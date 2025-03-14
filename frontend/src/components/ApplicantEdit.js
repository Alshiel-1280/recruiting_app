import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ApplicantEdit() {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 各入力フィールドの状態を管理
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    desired_occupation: '',
    desired_location: '',
    birthdate: '',
    email: '',
    phone_number: '',
    gender: '',
    nationality: '',
    employment_status: '',
    available_date: '',
    employment_period: '',
    medical_history: '',
    disability_certificate: '',
    tattoo: '',
    tattoo_details: '',
    criminal_record: '',
    clothing_size: '',
    commute_or_dormitory: '',
    commute_method: '',
    commute_area: '',
    factory_experience: '',
    experience_details: '',
    desired_working_hours: '',
    recent_applications: '',
    most_important_point: '',
    important_point_details: '',
    desired_salary: '',
    height: '',
    weight: ''
  });

  // 求職者データを取得
  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/applicants/${applicantId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // データをフォームに設定
        setFormData({
          name: data.name || '',
          address: data.address || '',
          desired_occupation: data.desired_occupation || '',
          desired_location: data.desired_location || '',
          birthdate: data.birthdate || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          employment_status: data.employment_status || '',
          available_date: data.available_date || '',
          employment_period: data.employment_period || '',
          medical_history: data.medical_history || '',
          disability_certificate: data.disability_certificate || '',
          tattoo: data.tattoo || '',
          tattoo_details: data.tattoo_details || '',
          criminal_record: data.criminal_record || '',
          clothing_size: data.clothing_size || '',
          commute_or_dormitory: data.commute_or_dormitory || '',
          commute_method: data.commute_method || '',
          commute_area: data.commute_area || '',
          factory_experience: data.factory_experience || '',
          experience_details: data.experience_details || '',
          desired_working_hours: data.desired_working_hours || '',
          recent_applications: data.recent_applications || '',
          most_important_point: data.most_important_point || '',
          important_point_details: data.important_point_details || '',
          desired_salary: data.desired_salary || '',
          height: data.height || '',
          weight: data.weight || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applicant details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [applicantId]);

  // 入力フィールドの変更を処理
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // フォーム送信時の処理
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/applicants/${applicantId}`, {
        method: 'PUT',
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
      
      // 成功したら求職者詳細ページに戻る
      navigate(`/applicants/${applicantId}`);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // フォームのスタイル
  const formStyle = {
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

  if (loading && !Object.values(formData).some(value => value)) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={formStyle}>
      <h2>求職者情報編集</h2>
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 基本情報 */}
          <div>
            <h3>基本情報</h3>
            
            <div style={formGroupStyle}>
              <label htmlFor="name" style={labelStyle}>氏名: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="address" style={labelStyle}>住所:</label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="birthdate" style={labelStyle}>生年月日:</label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="email" style={labelStyle}>メールアドレス:</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="phone_number" style={labelStyle}>電話番号:</label>
              <input
                type="tel"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="gender" style={labelStyle}>性別:</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="それ以外">それ以外</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="nationality" style={labelStyle}>国籍:</label>
              <select
                id="nationality"
                value={formData.nationality}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="日本国籍">日本国籍</option>
                <option value="永住権">永住権</option>
                <option value="それ以外">それ以外</option>
              </select>
            </div>
          </div>
          
          {/* 就業情報 */}
          <div>
            <h3>就業情報</h3>
            
            <div style={formGroupStyle}>
              <label htmlFor="desired_occupation" style={labelStyle}>希望職種:</label>
              <input
                type="text"
                id="desired_occupation"
                value={formData.desired_occupation}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="desired_location" style={labelStyle}>希望勤務地:</label>
              <input
                type="text"
                id="desired_location"
                value={formData.desired_location}
                onChange={handleChange}
                style={inputStyle}
                placeholder="例: 東京都内、千葉県、関東圏など"
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="employment_status" style={labelStyle}>就業状況:</label>
              <select
                id="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="在職中">在職中</option>
                <option value="求職中">求職中</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="available_date" style={labelStyle}>就業可能時期:</label>
              <select
                id="available_date"
                value={formData.available_date}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="即日">即日</option>
                <option value="今月中">今月中</option>
                <option value="来月中">来月中</option>
                <option value="それ以降">それ以降</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="employment_period" style={labelStyle}>就業期間:</label>
              <select
                id="employment_period"
                value={formData.employment_period}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="短期">短期</option>
                <option value="長期">長期</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="desired_working_hours" style={labelStyle}>希望勤務時間:</label>
              <input
                type="text"
                id="desired_working_hours"
                value={formData.desired_working_hours}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="desired_salary" style={labelStyle}>希望給与:</label>
              <input
                type="text"
                id="desired_salary"
                value={formData.desired_salary}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
        
        {/* その他の情報 */}
        <div style={{ marginTop: '20px' }}>
          <h3>その他の情報</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={formGroupStyle}>
                <label htmlFor="medical_history" style={labelStyle}>既往歴:</label>
                <input
                  type="text"
                  id="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="disability_certificate" style={labelStyle}>障害者手帳:</label>
                <select
                  id="disability_certificate"
                  value={formData.disability_certificate}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">選択してください</option>
                  <option value="有">有</option>
                  <option value="無">無</option>
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="tattoo" style={labelStyle}>タトゥー:</label>
                <select
                  id="tattoo"
                  value={formData.tattoo}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">選択してください</option>
                  <option value="有">有</option>
                  <option value="無">無</option>
                </select>
              </div>
              
              {formData.tattoo === '有' && (
                <div style={formGroupStyle}>
                  <label htmlFor="tattoo_details" style={labelStyle}>タトゥー詳細:</label>
                  <input
                    type="text"
                    id="tattoo_details"
                    value={formData.tattoo_details}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              )}
              
              <div style={formGroupStyle}>
                <label htmlFor="criminal_record" style={labelStyle}>逮捕歴/犯罪歴:</label>
                <select
                  id="criminal_record"
                  value={formData.criminal_record}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">選択してください</option>
                  <option value="有">有</option>
                  <option value="無">無</option>
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="clothing_size" style={labelStyle}>作業服サイズ:</label>
                <select
                  id="clothing_size"
                  value={formData.clothing_size}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">選択してください</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="2L">2L</option>
                  <option value="3L">3L</option>
                  <option value="4L">4L</option>
                  <option value="5L">5L</option>
                </select>
              </div>
            </div>
            
            <div>
            <div style={formGroupStyle}>
                <label htmlFor="commute_or_dormitory" style={labelStyle}>通勤/入寮:</label>
                <select
                  id="commute_or_dormitory"
                  value={formData.commute_or_dormitory}
                  onChange={handleChange}
                  style={inputStyle}
                >
                <option value="">選択してください</option>
                  <option value="通勤">通勤</option>
                  <option value="入寮">入寮</option>
                  <option value="どちらでも可">どちらでも可</option>
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="commute_method" style={labelStyle}>通勤手段:</label>
                <select
                  id="commute_method"
                  value={formData.commute_method}
                  onChange={handleChange}
                  style={inputStyle}
                >
                <option value="">選択してください</option>
                  <option value="車">車</option>
                  <option value="公共交通機関">公共交通機関</option>
                  <option value="バイク">バイク</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="commute_area" style={labelStyle}>通勤圏内/最寄り駅:</label>
                <input
                  type="text"
                  id="commute_area"
                  value={formData.commute_area}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="factory_experience" style={labelStyle}>工場経験:</label>
                <input
                  type="text"
                  id="factory_experience"
                  value={formData.factory_experience}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="experience_details" style={labelStyle}>経験詳細:</label>
                <textarea
                  id="experience_details"
                  value={formData.experience_details}
                  onChange={handleChange}
                  style={{ ...inputStyle, height: '80px' }}
                />
              </div>
            </div>
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="recent_applications" style={labelStyle}>直近の応募企業:</label>
            <input
              type="text"
              id="recent_applications"
              value={formData.recent_applications}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="most_important_point" style={labelStyle}>最重要ポイント:</label>
            <input
              type="text"
              id="most_important_point"
              value={formData.most_important_point}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="important_point_details" style={labelStyle}>重要ポイント詳細:</label>
            <textarea
              id="important_point_details"
              value={formData.important_point_details}
              onChange={handleChange}
              style={{ ...inputStyle, height: '80px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={formGroupStyle}>
              <label htmlFor="height" style={labelStyle}>身長:</label>
              <input
                type="text"
                id="height"
                value={formData.height}
                onChange={handleChange}
                style={inputStyle}
                placeholder="例: 170cm"
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="weight" style={labelStyle}>体重:</label>
              <input
                type="text"
                id="weight"
                value={formData.weight}
                onChange={handleChange}
                style={inputStyle}
                placeholder="例: 65kg"
              />
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="submit"
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? '送信中...' : '更新する'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/applicants/${applicantId}`)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginLeft: '10px'
            }}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplicantEdit;
