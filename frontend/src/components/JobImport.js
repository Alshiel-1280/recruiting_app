import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JobImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('ファイルを選択してください。');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const response = await fetch('/api/upload-job-data', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ファイルアップロードに失敗しました。');
      }
      const data = await response.json();
      setMessage(data.message || 'ファイルのアップロードが成功しました。');
      setError('');
      setFile(null);
      // 必要に応じて求人一覧ページへ遷移させる
      // navigate('/jobs');
    } catch (err) {
      setError(err.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>求人情報のインポート</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
    </div>
  );
};

export default JobImport;