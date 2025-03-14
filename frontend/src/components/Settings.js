import React, { useState, useEffect } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    spreadsheet: {
      spreadsheet_id: '',
      auto_import: false,
      import_frequency: 'daily'
    },
    excel: {
      auto_import: false,
      import_frequency: 'daily',
      last_import_directory: ''
    },
    notifications: {
      email_notifications: false,
      app_notifications: true,
      email_address: ''
    },
    ui: {
      theme: 'light',
      items_per_page: 10,
      default_sort: 'created_at'
    },
    backup: {
      auto_backup: false,
      backup_frequency: 'weekly',
      backup_directory: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('設定の取得中にエラーが発生しました。');
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      setSuccess('設定が正常に保存されました。');
      setTimeout(() => setSuccess(null), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('設定の保存中にエラーが発生しました。');
      setLoading(false);
    }
  };

  const testSpreadsheetConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);
      
      const response = await fetch('/api/settings/test-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheet_id: settings.spreadsheet.spreadsheet_id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setTestResult({
          success: false,
          message: data.error || 'スプレッドシートへの接続に失敗しました。'
        });
      } else {
        setTestResult({
          success: true,
          message: 'スプレッドシートへの接続に成功しました。',
          details: data
        });
      }
      
      setTestingConnection(false);
    } catch (error) {
      console.error('Error testing spreadsheet connection:', error);
      setTestResult({
        success: false,
        message: 'スプレッドシートへの接続テスト中にエラーが発生しました。'
      });
      setTestingConnection(false);
    }
  };

  if (loading && !settings) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h2>設定</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Google Spreadsheet設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>Google Spreadsheet設定</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              スプレッドシートID:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={settings.spreadsheet.spreadsheet_id}
                onChange={(e) => handleChange('spreadsheet', 'spreadsheet_id', e.target.value)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  flexGrow: 1
                }}
              />
              <button
                type="button"
                onClick={testSpreadsheetConnection}
                disabled={testingConnection || !settings.spreadsheet.spreadsheet_id}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: testingConnection || !settings.spreadsheet.spreadsheet_id ? 'not-allowed' : 'pointer',
                  opacity: testingConnection || !settings.spreadsheet.spreadsheet_id ? 0.7 : 1
                }}
              >
                {testingConnection ? '接続テスト中...' : '接続テスト'}
              </button>
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              スプレッドシートのURLから取得できるIDを入力してください。
              例: https://docs.google.com/spreadsheets/d/1ASNRCmXsBDL1j3Gj7-RpTeM4wfKZm9Z8C-eJ_cSLvaU/edit
            </small>
            
            {testResult && (
              <div style={{ 
                backgroundColor: testResult.success ? '#d4edda' : '#f8d7da', 
                color: testResult.success ? '#155724' : '#721c24', 
                padding: '10px', 
                borderRadius: '4px', 
                marginTop: '10px' 
              }}>
                <p style={{ margin: '0 0 5px 0' }}>{testResult.message}</p>
                {testResult.success && testResult.details && (
                  <div>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                      シート名: {testResult.details.sheet_title}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                      ヘッダー: {testResult.details.headers.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.spreadsheet.auto_import}
                onChange={(e) => handleChange('spreadsheet', 'auto_import', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              自動インポートを有効にする
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              インポート頻度:
            </label>
            <select
              value={settings.spreadsheet.import_frequency}
              onChange={(e) => handleChange('spreadsheet', 'import_frequency', e.target.value)}
              disabled={!settings.spreadsheet.auto_import}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%',
                opacity: !settings.spreadsheet.auto_import ? 0.7 : 1
              }}
            >
              <option value="hourly">毎時</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
        </div>
        
        {/* Excelファイルインポート設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>Excelファイルインポート設定</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.excel.auto_import}
                onChange={(e) => handleChange('excel', 'auto_import', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              自動インポートを有効にする
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              インポート頻度:
            </label>
            <select
              value={settings.excel.import_frequency}
              onChange={(e) => handleChange('excel', 'import_frequency', e.target.value)}
              disabled={!settings.excel.auto_import}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%',
                opacity: !settings.excel.auto_import ? 0.7 : 1
              }}
            >
              <option value="hourly">毎時</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              最後にインポートしたディレクトリ:
            </label>
            <input
              type="text"
              value={settings.excel.last_import_directory}
              onChange={(e) => handleChange('excel', 'last_import_directory', e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%'
              }}
              readOnly
            />
          </div>
        </div>
        
        {/* 通知設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>通知設定</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.notifications.app_notifications}
                onChange={(e) => handleChange('notifications', 'app_notifications', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              アプリ内通知を有効にする
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.notifications.email_notifications}
                onChange={(e) => handleChange('notifications', 'email_notifications', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              メール通知を有効にする
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              通知用メールアドレス:
            </label>
            <input
              type="email"
              value={settings.notifications.email_address}
              onChange={(e) => handleChange('notifications', 'email_address', e.target.value)}
              disabled={!settings.notifications.email_notifications}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%',
                opacity: !settings.notifications.email_notifications ? 0.7 : 1
              }}
            />
          </div>
        </div>
        
        {/* ユーザーインターフェース設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>ユーザーインターフェース設定</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              テーマ:
            </label>
            <select
              value={settings.ui.theme}
              onChange={(e) => handleChange('ui', 'theme', e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%'
              }}
            >
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
              <option value="system">システム設定に合わせる</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              1ページあたりの表示件数:
            </label>
            <select
              value={settings.ui.items_per_page}
              onChange={(e) => handleChange('ui', 'items_per_page', parseInt(e.target.value))}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%'
              }}
            >
              <option value="5">5件</option>
              <option value="10">10件</option>
              <option value="20">20件</option>
              <option value="50">50件</option>
              <option value="100">100件</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              デフォルトの並び順:
            </label>
            <select
              value={settings.ui.default_sort}
              onChange={(e) => handleChange('ui', 'default_sort', e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%'
              }}
            >
              <option value="created_at">作成日時</option>
              <option value="updated_at">更新日時</option>
              <option value="name">名前</option>
            </select>
          </div>
        </div>
        
        {/* バックアップ設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>バックアップ設定</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.backup.auto_backup}
                onChange={(e) => handleChange('backup', 'auto_backup', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              自動バックアップを有効にする
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              バックアップ頻度:
            </label>
            <select
              value={settings.backup.backup_frequency}
              onChange={(e) => handleChange('backup', 'backup_frequency', e.target.value)}
              disabled={!settings.backup.auto_backup}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%',
                opacity: !settings.backup.auto_backup ? 0.7 : 1
              }}
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              バックアップディレクトリ:
            </label>
            <input
              type="text"
              value={settings.backup.backup_directory}
              onChange={(e) => handleChange('backup', 'backup_directory', e.target.value)}
              disabled={!settings.backup.auto_backup}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                width: '100%',
                opacity: !settings.backup.auto_backup ? 0.7 : 1
              }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              空白の場合はデフォルトのディレクトリが使用されます。
            </small>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;