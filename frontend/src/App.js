import React from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [adminSection, setAdminSection] = React.useState('dashboard');
  const [notices, setNotices] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

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
    setAdminSection('dashboard');
    alert('로그아웃되었습니다.');
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notices');
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('제품 로딩 실패:', error);
    }
  };

  const addNotice = async (notice) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice)
      });
      if (response.ok) {
        fetchNotices();
        alert('공지사항이 추가되었습니다.');
      }
    } catch (error) {
      console.error('공지사항 추가 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        fetchProducts();
        alert('제품이 추가되었습니다.');
      }
    } catch (error) {
      console.error('제품 추가 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isLoggedIn && adminSection === 'notices') {
      fetchNotices();
    }
    if (isLoggedIn && adminSection === 'products') {
      fetchProducts();
    }
  }, [isLoggedIn, adminSection]);

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
            
            {adminSection === 'dashboard' && (
              <div className="feature-grid">
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('notices')}>
                  <h3>📝 공지사항 관리</h3>
                  <p>공지사항을 등록하고 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('products')}>
                  <h3>📦 제품 관리</h3>
                  <p>GF 시리즈 제품을 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('images')}>
                  <h3>🖼️ 이미지 관리</h3>
                  <p>웹사이트 이미지를 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('statistics')}>
                  <h3>📊 통계 분석</h3>
                  <p>방문자 통계를 확인합니다</p>
                </div>
              </div>
            )}

            {adminSection === 'notices' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>공지사항 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3>새 공지사항 추가</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const title = e.target.title.value;
                    const content = e.target.content.value;
                    if (title && content) {
                      addNotice({ title, content });
                      e.target.reset();
                    }
                  }}>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="title"
                        type="text" 
                        placeholder="제목"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <textarea 
                        name="content"
                        placeholder="내용"
                        rows="4"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      {loading ? '추가 중...' : '공지사항 추가'}
                    </button>
                  </form>
                </div>

                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>등록된 공지사항</h3>
                  {notices.length > 0 ? (
                    notices.map((notice, index) => (
                      <div key={index} style={{borderBottom: '1px solid #eee', padding: '15px 0'}}>
                        <h4 style={{margin: '0 0 10px 0', color: '#333'}}>{notice.title}</h4>
                        <p style={{margin: '0 0 10px 0', color: '#666'}}>{notice.content}</p>
                        <small style={{color: '#999'}}>{notice.date}</small>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', margin: '20px 0'}}>등록된 공지사항이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'products' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>제품 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3>새 제품 추가</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target.name.value;
                    const description = e.target.description.value;
                    const category = e.target.category.value;
                    if (name && description && category) {
                      addProduct({ name, description, category });
                      e.target.reset();
                    }
                  }}>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="name"
                        type="text" 
                        placeholder="제품명"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <select 
                        name="category"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      >
                        <option value="">카테고리 선택</option>
                        <option value="GF-KIDS">GF-KIDS</option>
                        <option value="GF-KIOSK">GF-KIOSK</option>
                        <option value="GF-CCTV">GF-CCTV</option>
                        <option value="GF-VIP">GF-VIP</option>
                      </select>
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <textarea 
                        name="description"
                        placeholder="제품 설명"
                        rows="3"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      {loading ? '추가 중...' : '제품 추가'}
                    </button>
                  </form>
                </div>

                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>등록된 제품</h3>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <div key={index} style={{borderBottom: '1px solid #eee', padding: '15px 0'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                          <div>
                            <h4 style={{margin: '0 0 5px 0', color: '#333'}}>{product.name}</h4>
                            <span style={{background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginBottom: '10px', display: 'inline-block'}}>{product.category}</span>
                            <p style={{margin: '10px 0 0 0', color: '#666'}}>{product.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', margin: '20px 0'}}>등록된 제품이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'images' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>이미지 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>이미지 업로드</h3>
                  <p style={{color: '#666', marginBottom: '20px'}}>웹사이트에 사용할 이미지를 업로드하고 관리할 수 있습니다.</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    style={{marginBottom: '15px'}}
                  />
                  <br />
                  <button 
                    style={{padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    onClick={() => alert('이미지 업로드 기능은 곧 추가될 예정입니다.')}
                  >
                    이미지 업로드
                  </button>
                </div>
              </div>
            )}

            {adminSection === 'statistics' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>통계 분석</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px'}}>
                  <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                    <h3 style={{color: '#28a745', margin: '0 0 10px 0'}}>총 방문자</h3>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>1,234</div>
                  </div>
                  <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                    <h3 style={{color: '#007bff', margin: '0 0 10px 0'}}>오늘 방문자</h3>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>89</div>
                  </div>
                  <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                    <h3 style={{color: '#ffc107', margin: '0 0 10px 0'}}>페이지뷰</h3>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>3,456</div>
                  </div>
                  <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                    <h3 style={{color: '#e74c3c', margin: '0 0 10px 0'}}>평균 체류시간</h3>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>2:34</div>
                  </div>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>최근 방문 기록</h3>
                  <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{borderBottom: '2px solid #eee'}}>
                          <th style={{padding: '10px', textAlign: 'left'}}>시간</th>
                          <th style={{padding: '10px', textAlign: 'left'}}>IP</th>
                          <th style={{padding: '10px', textAlign: 'left'}}>페이지</th>
                          <th style={{padding: '10px', textAlign: 'left'}}>브라우저</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '10px'}}>2024-01-15 14:32</td>
                          <td style={{padding: '10px'}}>192.168.1.100</td>
                          <td style={{padding: '10px'}}>홈페이지</td>
                          <td style={{padding: '10px'}}>Chrome</td>
                        </tr>
                        <tr style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '10px'}}>2024-01-15 14:25</td>
                          <td style={{padding: '10px'}}>192.168.1.101</td>
                          <td style={{padding: '10px'}}>제품페이지</td>
                          <td style={{padding: '10px'}}>Firefox</td>
                        </tr>
                        <tr style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '10px'}}>2024-01-15 14:18</td>
                          <td style={{padding: '10px'}}>192.168.1.102</td>
                          <td style={{padding: '10px'}}>공지사항</td>
                          <td style={{padding: '10px'}}>Safari</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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