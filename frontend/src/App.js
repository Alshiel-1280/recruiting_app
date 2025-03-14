import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Dashboard from './components/Dashboard';
import ApplicantsList from './components/ApplicantsList';
import JobsList from './components/JobsList';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import EmployeesList from './components/EmployeesList';
import AddApplicantForm from './components/AddApplicantForm';
import InterviewsList from './components/InterviewsList';
import PhoneCallsList from './components/PhoneCallsList';
import MatchingSystem from './components/MatchingSystem';
import AddJobForm from './components/AddJobForm';
import JobImport from './components/JobImport';
import JobDetail from './components/JobDetail';
import ApplicantDetail from './components/ApplicantDetail';
import ApplicantEdit from './components/ApplicantEdit';
import ApplicantMatching from './components/ApplicantMatching';
import EmployeeKPI from './components/EmployeeKPI';
import CompanyKPI from './components/CompanyKPI';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* 公開ルート */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      
      {/* 保護されたルート */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicants" element={
        <ProtectedRoute>
          <AppLayout>
            <ApplicantsList />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicants/add" element={
        <ProtectedRoute>
          <AppLayout>
            <AddApplicantForm />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicants/:applicantId" element={
        <ProtectedRoute>
          <AppLayout>
            <ApplicantDetail />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicants/edit/:applicantId" element={
        <ProtectedRoute>
          <AppLayout>
            <ApplicantEdit />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs" element={
        <ProtectedRoute>
          <AppLayout>
            <JobsList />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs/add" element={
        <ProtectedRoute>
          <AppLayout>
            <AddJobForm />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs/:jobId" element={
        <ProtectedRoute>
          <AppLayout>
            <JobDetail />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs/import" element={
        <ProtectedRoute>
          <AppLayout>
            <JobImport />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/interviews" element={
        <ProtectedRoute>
          <AppLayout>
            <InterviewsList />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/phone-calls" element={
        <ProtectedRoute>
          <AppLayout>
            <PhoneCallsList />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/matching" element={
        <ProtectedRoute>
          <AppLayout>
            <MatchingSystem />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/statistics" element={
        <ProtectedRoute>
          <AppLayout>
            <Statistics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/employees" element={
        <ProtectedRoute>
          <AppLayout>
            <EmployeesList />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicants/:applicantId/matching" element={
        <ProtectedRoute>
          <AppLayout>
            <ApplicantMatching />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applicant-matching" element={
        <ProtectedRoute>
          <AppLayout>
            <ApplicantMatching />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/employees/:employeeId/kpi" element={
        <ProtectedRoute>
          <AppLayout>
            <EmployeeKPI />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/company-kpi" element={
        <ProtectedRoute>
          <AppLayout>
            <CompanyKPI />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* 認証されていたらダッシュボードにリダイレクト */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
}

function AppLayout({ children }) {
  const { logout } = useAuth();
  
  return (
    <div>
      <nav className="app-nav">
        <div className="container">
          <h1>人材紹介アプリ</h1>
          <ul style={{listStyle: 'none', padding: 0}}>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/dashboard">ダッシュボード</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/applicants">求職者一覧</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/applicants/add">求職者追加</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/jobs">求人情報一覧</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/jobs/add">求人情報追加</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/employees">社員一覧</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/company-kpi">会社KPI</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}><Link to="/settings">設定</Link></li>
            <li style={{display: 'inline-block', margin: '0 10px'}}>
              <button 
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ログアウト
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="app-content">
        {children}
      </div>
      
      <style jsx>{`
        .app-nav {
          background-color: #f8fafc;
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .app-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  );
}

export default App;
