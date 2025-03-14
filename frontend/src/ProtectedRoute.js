import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!isAuthenticated) {
    // 現在のパスを記憶して、ログイン後にリダイレクトできるようにする
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
