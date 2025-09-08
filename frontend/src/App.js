import React from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const showPage = (page) => {
    if (page === 'admin' && !isLoggedIn) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setCurrentPage('admin');
      alert('로그인 성공!');
    } else {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    alert('로그아웃되었습니다.');
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>GAON</h1>
          <nav>
            <a onClick={() => showPage('home')} style={{cursor: 'pointer'}}>홈</a>
            <a onClick={() => showPage('products')} style={{cursor: 'pointer'}}>제품</a>
            <a onClick={() => showPage('notices')} style={{cursor: 'pointer'}}>공지사항</a>
            <a onClick={() => showPage('admin')} className="admin-link" style={{cursor: 'pointer'}}>관리자</a>
          </nav>
        </div>
      </header>

      {currentPage === 'home' && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>내일의 기술을 만듭니다</h1>
              <p>공인받는 기술력과 아이디어로<br/>차별화된 서비스와 최상의 결과를 만들어드립니다.</p>
              <button className="cta-button">자세히 알아보기</button>
            </div>
          </section>
          
          <section className="features">
            <div className="container">
              <div className="feature-grid">
                <div className="feature">
                  <h3>회사소개</h3>
                  <p>다른 큰 경쟁으로 도약하겠습니다.</p>
                </div>
                <div className="feature">
                  <h3>회사연혁</h3>
                  <p>지금껏 걸어온 길을 살펴보세요.</p>
                </div>
                <div className="feature">
                  <h3>사업분야</h3>
                  <p>차별화된 서비스로 승부합니다.</p>
                </div>
                <div className="feature">
                  <h3>주요실적</h3>
                  <p>다양한 분야에서 위상을 높이고 있습니다.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {currentPage === 'products' && (
        <section className="products-page">
          <div className="container">
            <h1 style={{marginTop: '40px', marginBottom: '30px'}}>GF 시리즈 제품</h1>
            <div className="feature-grid">
              <div className="feature">
                <h3>GF-KIDS</h3>
                <p>어린이 안전 솔루션</p>
              </div>
              <div className="feature">
                <h3>GF-KIOSK</h3>
                <p>무인 키오스크 시스템</p>
              </div>
              <div className="feature">
                <h3>GF-CCTV</h3>
                <p>지능형 CCTV 솔루션</p>
              </div>
              <div className="feature">
                <h3>GF-VIP</h3>
                <p>VIP 관리 시스템</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === 'notices' && (
        <section className="notices-page">
          <div className="container">
            <h1 style={{marginTop: '40px', marginBottom: '30px'}}>공지사항</h1>
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
              <div style={{borderBottom: '1px solid #eee', padding: '15px 0'}}>
                <span style={{background: '#e74c3c', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', marginRight: '10px'}}>공지</span>
                GAON 홈페이지가 새롭게 오픈했습니다
                <span style={{float: 'right', color: '#999'}}>2024.01.15</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === 'login' && (
        <section className="login-page">
          <div className="container">
            <div style={{maxWidth: '400px', margin: '50px auto', background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}>
              <h2 style={{textAlign: 'center', color: '#1e5a8d', marginBottom: '30px'}}>GAON 관리자 로그인</h2>
              <form onSubmit={handleLogin}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px'}}>아이디</label>
                  <input 
                    name="username"
                    type="text" 
                    style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px'}}
                    required 
                  />
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px'}}>비밀번호</label>
                  <input 
                    name="password"
                    type="password" 
                    style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px'}}
                    required 
                  />
                </div>
                <button 
                  type="submit"
                  style={{width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer'}}
                >
                  로그인
                </button>
              </form>
              <div style={{marginTop: '20px', textAlign: 'center', color: '#999', fontSize: '14px'}}>
                테스트 계정: admin / admin123
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === 'admin' && isLoggedIn && (
        <section className="admin-page">
          <div className="container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '40px 0'}}>
              <h1>관리자 대시보드</h1>
              <button 
                onClick={handleLogout}
                style={{padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
              >
                로그아웃
              </button>
            </div>
            <div className="feature-grid">
              <div className="feature">
                <h3>📝 공지사항 관리</h3>
                <p>공지사항을 등록하고 관리합니다</p>
              </div>
              <div className="feature">
                <h3>📦 제품 관리</h3>
                <p>GF 시리즈 제품을 관리합니다</p>
              </div>
              <div className="feature">
                <h3>🖼️ 이미지 관리</h3>
                <p>웹사이트 이미지를 관리합니다</p>
              </div>
              <div className="feature">
                <h3>📊 통계 분석</h3>
                <p>방문자 통계를 확인합니다</p>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <footer className="footer">
        <div className="container">
          <p>가온 | 대표: 박상현 | TEL: 031-281-3980</p>
          <p>© 2024 GAON. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;