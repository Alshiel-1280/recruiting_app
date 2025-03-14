import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // リダイレクト元のパスを取得
  const from = location.state?.from?.pathname || '/frontend/src/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('認証に失敗しました。正しいユーザー名とパスワードを入力してください。');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>人材紹介アプリにログイン</h2>
        <p className="login-subtitle">システムにアクセスするには認証が必要です</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />
          </div>
          
          <button type="submit" className="login-button">ログイン</button>
        </form>
        
        {/*<div className="login-help">
          <p>テスト用アカウント: admin / password123</p>
          <p>※ これは簡易認証です。実際の運用では適切な認証システムを使用してください。</p>
        </div>*/}
      </div>
      
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%);
          padding: 20px;
        }
        
        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 450px;
        }
        
        .login-card h2 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 24px;
          text-align: center;
        }
        
        .login-subtitle {
          color: #64748b;
          text-align: center;
          margin-bottom: 24px;
        }
        
        .login-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        
        .form-group input {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        
        .login-button {
          background: #6366F1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 8px;
        }
        
        .login-button:hover {
          background: #4F46E5;
        }
        
        .login-help {
          margin-top: 24px;
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
        }
        
        .login-help p {
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}

export default Login;
