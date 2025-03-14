import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* ナビゲーションバー */}
      <nav className="navbar">
        <div className="container">
          <div className="logo">人材紹介システム</div>
          <div className="nav-links">
            <a href="#features">機能</a>
            <a href="#benefits">メリット</a>
            <a href="#faq">よくある質問</a>
            <Link to="/login" className="nav-button">ログイン</Link>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>人材紹介業務を効率化する<br />スマートなソリューション</h1>
            <p>求職者管理、求人管理、マッチング、そして業績追跡までを一元管理。<br />人材紹介のプロフェッショナルのための完全統合システム。</p>
            <div className="hero-buttons">
              <Link to="/login" className="primary-button">今すぐ始める</Link>
              <a href="#features" className="secondary-button">詳細を見る</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://via.placeholder.com/600x400?text=Dashboard+Preview" alt="ダッシュボードイメージ" />
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">主な機能</h2>
          <p className="section-subtitle">人材紹介業務を効率化するための包括的な機能セット</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>求職者管理</h3>
              <p>詳細なプロファイル管理から面接のスケジューリングまで、求職者の全情報を一元管理できます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3>求人情報管理</h3>
              <p>企業の求人情報をExcelからインポートし、効率的に管理・検索できます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <h3>インテリジェントマッチング</h3>
              <p>AIを活用したマッチングシステムで、求職者と求人のベストマッチを自動的に見つけ出します。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                  <line x1="0" y1="20" x2="24" y2="20"></line>
                </svg>
              </div>
              <h3>KPI追跡と分析</h3>
              <p>会社および個人のパフォーマンスを可視化し、データに基づいた意思決定をサポートします。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3>面接管理</h3>
              <p>面接のスケジュール管理、結果追跡、フィードバック記録を簡単に行えます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>進捗管理</h3>
              <p>プロセス全体の進捗を視覚的に追跡し、ボトルネックを特定して効率を向上させます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section id="benefits" className="benefits">
        <div className="container">
          <h2 className="section-title">導入メリット</h2>
          <p className="section-subtitle">人材紹介ビジネスをどのように変革するか</p>
          
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>40%の業務効率化</h3>
              <p>手作業での管理業務を大幅に削減し、コア業務に集中できる環境を実現します。</p>
            </div>
            
            <div className="benefit-item">
              <h3>収益向上</h3>
              <p>効率的なマッチングと進捗管理により、成約率と収益が向上します。</p>
            </div>
            
            <div className="benefit-item">
              <h3>データ分析</h3>
              <p>包括的なレポートとダッシュボードで、ビジネスの健全性を一目で把握できます。</p>
            </div>
            
            <div className="benefit-item">
              <h3>スケーラビリティ</h3>
              <p>業務規模の拡大に合わせて柔軟にスケールできる設計を採用しています。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>人材紹介業務を次のレベルへ</h2>
            <p>今すぐ登録して、効率的な人材紹介システムの力を体験してください。</p>
            <Link to="/login" className="cta-button">無料で試してみる</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <h2 className="section-title">よくある質問</h2>
          <p className="section-subtitle">お客様からよく寄せられる質問への回答</p>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>既存のデータを移行できますか？</h3>
              <p>はい、ExcelやCSVからのデータインポート機能を提供しており、スムーズな移行が可能です。</p>
            </div>
            
            <div className="faq-item">
              <h3>カスタマイズは可能ですか？</h3>
              <p>はい、御社の業務フローに合わせたカスタマイズが可能です。詳細はお問い合わせください。</p>
            </div>
            
            <div className="faq-item">
              <h3>導入にはどれくらいの時間がかかりますか？</h3>
              <p>標準的な導入で約2週間、カスタマイズを含む場合は1〜2ヶ月程度が目安です。</p>
            </div>
            
            <div className="faq-item">
              <h3>サポート体制はどうなっていますか？</h3>
              <p>24時間365日のテクニカルサポートを提供しています。また、定期的なトレーニングセッションも実施しています。</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>人材紹介システム</h3>
              <p>人材紹介業務の効率化を実現するソリューション</p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>製品</h4>
                <a href="#features">機能</a>
                <a href="#benefits">メリット</a>
                <a href="#pricing">価格</a>
              </div>
              <div className="footer-links-column">
                <h4>サポート</h4>
                <a href="#faq">よくある質問</a>
                <a href="#contact">お問い合わせ</a>
                <a href="#support">サポートセンター</a>
              </div>
              <div className="footer-links-column">
                <h4>会社情報</h4>
                <a href="#about">会社概要</a>
                <a href="#careers">採用情報</a>
                <a href="#news">ニュース</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} 人材紹介システム. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* 基本スタイル */
        .landing-page {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #1e293b;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .section-title {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 16px;
        }
        
        .section-subtitle {
          font-size: 18px;
          text-align: center;
          color: #64748b;
          margin-bottom: 60px;
        }
        
        /* ナビゲーションバー */
        .navbar {
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 20px;
          font-weight: 700;
          color: #6366F1;
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .nav-links a {
          text-decoration: none;
          color: #1e293b;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-links a:hover {
          color: #6366F1;
        }
        
        .nav-button {
          background-color: #6366F1;
          color: white !important;
          padding: 10px 16px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .nav-button:hover {
          background-color: #4F46E5;
        }
        
        /* ヒーローセクション */
        .hero {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
        }
        
        .hero .container {
          display: flex;
          align-items: center;
          gap: 60px;
        }
        
        .hero-content {
          flex: 1;
        }
        
        .hero h1 {
          font-size: 40px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 20px;
          color: #1e293b;
        }
        
        .hero p {
          font-size: 18px;
          color: #64748b;
          margin-bottom: 30px;
        }
        
        .hero-buttons {
          display: flex;
          gap: 16px;
        }
        
        .primary-button {
          background-color: #6366F1;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }
        
        .primary-button:hover {
          background-color: #4F46E5;
        }
        
        .secondary-button {
          background-color: transparent;
          color: #6366F1;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid #6366F1;
          transition: background 0.2s;
        }
        
        .secondary-button:hover {
          background-color: rgba(99, 102, 241, 0.1);
        }
        
        .hero-image {
          flex: 1;
        }
        
        .hero-image img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
        }
        
        /* 特徴セクション */
        .features {
          padding: 100px 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        
        .feature-card {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: rgba(99, 102, 241, 0.1);
          color: #6366F1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .feature-card p {
          color: #64748b;
          margin: 0;
        }
        
        /* メリットセクション */
        .benefits {
          padding: 100px 0;
          background-color: #f8fafc;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }
        
        .benefit-item h3 {
          font-size: 22px;
          font-weight: 600;
          color: #6366F1;
          margin-bottom: 12px;
          position: relative;
          padding-bottom: 12px;
        }
        
        .benefit-item h3:after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background-color: #6366F1;
        }
        
        .benefit-item p {
          color: #64748b;
          margin: 0;
        }
        
        /* CTAセクション */
        .cta {
          padding: 80px 0;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: white;
        }
        
        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .cta h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        .cta p {
          font-size: 18px;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        
        .cta-button {
          background-color: white;
          color: #6366F1;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }
        
        /* FAQセクション */
        .faq {
          padding: 100px 0;
        }
        
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 40px;
        }
        
        .faq-item {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .faq-item h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1e293b;
        }
        
        .faq-item p {
          color: #64748b;
          margin: 0;
        }
        
        /* フッター */
        .footer {
          background-color: #1e293b;
          color: white;
          padding: 80px 0 40px;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          margin-bottom: 60px;
        }
        
        .footer-logo h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        
        .footer-logo p {
          color: #94a3b8;
          margin: 0;
          max-width: 300px;
        }
        
        .footer-links {
          display: flex;
          gap: 80px;
        }
        
        .footer-links-column h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        
        .footer-links-column a {
          display: block;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        
        .footer-links-column a:hover {
          color: white;
        }
        
        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .footer-bottom p {
          color: #94a3b8;
          margin: 0;
        }
        
        /* レスポンシブデザイン */
        @media (max-width: 992px) {
          .hero .container {
            flex-direction: column;
          }
          
          .hero h1 {
            font-size: 32px;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 40px;
          }
          
          .footer-links {
            flex-wrap: wrap;
            gap: 40px;
          }
        }
        
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
