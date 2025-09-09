import React from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [adminSection, setAdminSection] = React.useState('dashboard');
  const [notices, setNotices] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedProducts, setExpandedProducts] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [bannerImage, setBannerImage] = React.useState(null);
  const [companyInfo, setCompanyInfo] = React.useState({
    about: { title: "회사소개", content: "", images: [] },
    history: { title: "회사연혁", items: [] },
    business: { title: "사업분야", items: [] },
    achievements: { title: "주요실적", items: [] }
  });

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

  const toggleProductDetail = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const groupProductsByCategory = (products) => {
    return products.reduce((groups, product) => {
      const category = product.category || '기타';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notices');
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('제품 로딩 실패:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
    }
  };

  const fetchBannerImage = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/images/banner');
      const data = await response.json();
      setBannerImage(data.bannerImage);
    } catch (error) {
      console.error('배너 이미지 로딩 실패:', error);
    }
  };

  const uploadImage = async (file, type = 'general') => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('http://localhost:5001/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        fetchImages();
        if (type === 'banner') {
          setBannerImage(result.image);
        }
        alert('이미지가 성공적으로 업로드되었습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const setBannerImageById = async (imageId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/images/banner/${imageId}`, {
        method: 'PUT'
      });

      const result = await response.json();
      if (result.success) {
        setBannerImage(result.bannerImage);
        alert('배너 이미지가 설정되었습니다.');
      }
    } catch (error) {
      console.error('배너 이미지 설정 실패:', error);
      alert('배너 이미지 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addNotice = async (notice, image = null) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', notice.title);
      formData.append('content', notice.content);
      formData.append('author', notice.author || '관리자');
      formData.append('category', notice.category || '일반');
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('http://localhost:5001/api/notices', {
        method: 'POST',
        body: formData
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

  const addProduct = async (product, image = null) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('description', product.description);
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        body: formData
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

  // 회사 정보 관련 함수들
  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/company');
      const data = await response.json();
      setCompanyInfo(data);
    } catch (error) {
      console.error('회사 정보 로딩 실패:', error);
    }
  };

  const updateCompanySection = async (section, formData) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/company/${section}`, {
        method: 'PUT',
        body: formData
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setCompanyInfo(prev => ({
          ...prev,
          [section]: updatedData
        }));
        alert('정보가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('정보 업데이트 실패:', error);
      alert('정보 업데이트에 실패했습니다.');
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
    if (isLoggedIn && adminSection === 'images') {
      fetchImages();
    }
    if (isLoggedIn && (adminSection === 'about' || adminSection === 'history' || adminSection === 'business' || adminSection === 'achievements')) {
      fetchCompanyInfo();
    }
    if (currentPage === 'notices') {
      fetchNotices();
    }
    if (currentPage === 'products') {
      fetchProducts();
    }
    if (currentPage === 'about' || currentPage === 'history' || currentPage === 'business' || currentPage === 'achievements') {
      fetchCompanyInfo();
    }
    if (currentPage === 'home') {
      fetchNotices();
      fetchProducts();
      fetchBannerImage();
    }
  }, [isLoggedIn, adminSection, currentPage]);

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>GAON</h1>
          <nav>
            <a onClick={() => showPage('home')} style={{cursor: 'pointer'}}>홈</a>
            <a onClick={() => showPage('about')} style={{cursor: 'pointer'}}>회사소개</a>
            <a onClick={() => showPage('history')} style={{cursor: 'pointer'}}>회사연혁</a>
            <a onClick={() => showPage('business')} style={{cursor: 'pointer'}}>사업분야</a>
            <a onClick={() => showPage('achievements')} style={{cursor: 'pointer'}}>주요실적</a>
            <a onClick={() => showPage('products')} style={{cursor: 'pointer'}}>제품</a>
            <a onClick={() => showPage('notices')} style={{cursor: 'pointer'}}>공지사항</a>
            <a onClick={() => showPage('admin')} className="admin-link" style={{cursor: 'pointer'}}>관리자</a>
          </nav>
        </div>
      </header>

      {currentPage === 'home' && (
        <>
          <section 
            className="hero"
            style={{
              background: bannerImage 
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(http://localhost:5001${bannerImage.path}) center/cover`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
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

          {/* 최신 공지사항 섹션 */}
          {notices.length > 0 && (
            <section style={{padding: '60px 0', background: '#f8f9fa'}}>
              <div className="container">
                <h2 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>최신 공지사항</h2>
                <div style={{maxWidth: '800px', margin: '0 auto'}}>
                  {notices.slice(0, 3).map((notice, index) => (
                    <div key={index} style={{
                      background: 'white', 
                      padding: '20px', 
                      marginBottom: '15px', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }} onClick={() => showPage('notices')}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={{flex: 1}}>
                          <div style={{marginBottom: '10px'}}>
                            <span style={{background: '#e74c3c', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', marginRight: '10px'}}>공지</span>
                            <strong style={{color: '#333'}}>{notice.title}</strong>
                          </div>
                          {notice.content && (
                            <p style={{margin: '0', color: '#666', fontSize: '14px'}}>
                              {notice.content.length > 100 ? notice.content.substring(0, 100) + '...' : notice.content}
                            </p>
                          )}
                          <span style={{color: '#999', fontSize: '12px', display: 'block', marginTop: '10px'}}>{notice.date}</span>
                        </div>
                        {notice.image && (
                          <div style={{marginLeft: '15px'}}>
                            <img 
                              src={`http://localhost:5001${notice.image}`} 
                              alt={notice.title}
                              style={{width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <button 
                      onClick={() => showPage('notices')}
                      style={{padding: '10px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer'}}
                    >
                      더 많은 공지사항 보기
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 주요 제품 소개 섹션 */}
          {products.length > 0 && (
            <section style={{padding: '60px 0', background: 'white'}}>
              <div className="container">
                <h2 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>주요 제품</h2>
                <div className="feature-grid">
                  {products.slice(0, 4).map((product, index) => (
                    <div key={index} className="feature" style={{cursor: 'pointer'}} onClick={() => showPage('products')}>
                      <h3>{product.name}</h3>
                      <div style={{marginBottom: '10px'}}>
                        <span style={{background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px'}}>
                          {product.category}
                        </span>
                      </div>
                      <p>{product.description}</p>
                    </div>
                  ))}
                </div>
                <div style={{textAlign: 'center', marginTop: '30px'}}>
                  <button 
                    onClick={() => showPage('products')}
                    style={{padding: '10px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer'}}
                  >
                    모든 제품 보기
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {currentPage === 'products' && (
        <section className="products-page">
          <div className="container">
            <h1 style={{marginTop: '40px', marginBottom: '30px'}}>GF 시리즈 제품</h1>
            {products.length > 0 ? (
              <div>
                {Object.entries(groupProductsByCategory(products)).map(([category, categoryProducts]) => (
                  <div key={category} style={{marginBottom: '40px'}}>
                    <h2 style={{
                      color: '#333', 
                      borderBottom: '3px solid #667eea', 
                      paddingBottom: '10px', 
                      marginBottom: '20px',
                      fontSize: '24px'
                    }}>
                      {category}
                    </h2>
                    <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
                      {categoryProducts.map((product, index) => (
                        <div key={product.id || index} style={{borderBottom: index < categoryProducts.length - 1 ? '1px solid #eee' : 'none'}}>
                          <div 
                            style={{
                              padding: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: expandedProducts[product.id] ? '#f8f9fa' : 'white',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => toggleProductDetail(product.id)}
                            onMouseEnter={(e) => {
                              if (!expandedProducts[product.id]) {
                                e.target.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!expandedProducts[product.id]) {
                                e.target.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <div>
                              <h3 style={{margin: '0 0 5px 0', color: '#333', fontSize: '18px'}}>{product.name}</h3>
                              <span style={{
                                background: '#667eea', 
                                color: 'white', 
                                padding: '3px 12px', 
                                borderRadius: '15px', 
                                fontSize: '12px'
                              }}>
                                {product.category}
                              </span>
                            </div>
                            <div style={{
                              transform: expandedProducts[product.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease',
                              fontSize: '18px',
                              color: '#667eea'
                            }}>
                              ▶
                            </div>
                          </div>
                          
                          {expandedProducts[product.id] && (
                            <div style={{
                              padding: '20px',
                              backgroundColor: '#f8f9fa',
                              borderTop: '1px solid #e0e0e0',
                              animation: 'slideDown 0.3s ease'
                            }}>
                              <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                              }}>
                                <h4 style={{color: '#667eea', margin: '0 0 15px 0'}}>📋 제품 상세 정보</h4>
                                
                                <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
                                  <div style={{flex: 1}}>
                                    <p style={{
                                      color: '#555',
                                      lineHeight: '1.6',
                                      margin: '0 0 15px 0',
                                      fontSize: '15px'
                                    }}>
                                      {product.description}
                                    </p>
                                  </div>
                                  {product.image && (
                                    <div style={{flexShrink: 0}}>
                                      <img 
                                        src={`http://localhost:5001${product.image}`} 
                                        alt={product.name}
                                        style={{
                                          width: '200px', 
                                          height: '150px', 
                                          objectFit: 'cover', 
                                          borderRadius: '8px', 
                                          border: '2px solid #e0e0e0'
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {product.features && product.features.length > 0 && (
                                  <div>
                                    <h5 style={{color: '#333', margin: '0 0 10px 0'}}>🌟 주요 특징</h5>
                                    <ul style={{
                                      color: '#555',
                                      paddingLeft: '20px',
                                      margin: '0 0 15px 0'
                                    }}>
                                      {product.features.map((feature, idx) => (
                                        <li key={idx} style={{marginBottom: '5px'}}>{feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div style={{
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  paddingTop: '15px',
                                  borderTop: '1px solid #eee'
                                }}>
                                  <span style={{color: '#999', fontSize: '13px'}}>
                                    등록일: {product.createdAt || '2024-01-15'}
                                  </span>
                                  <span style={{
                                    background: product.status === 'active' ? '#28a745' : '#6c757d',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px'
                                  }}>
                                    {product.status === 'active' ? '서비스 중' : '준비 중'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign: 'center', color: '#666', padding: '40px 0'}}>
                {loading ? '제품 정보를 불러오는 중...' : (
                  <div>
                    <p style={{fontSize: '18px', marginBottom: '30px'}}>등록된 제품이 없습니다.</p>
                    <div>
                      {['GF-KIDS', 'GF-KIOSK', 'GF-CCTV', 'GF-VIP'].map((category, index) => (
                        <div key={category} style={{marginBottom: '30px'}}>
                          <h2 style={{
                            color: '#333', 
                            borderBottom: '3px solid #667eea', 
                            paddingBottom: '10px', 
                            marginBottom: '20px'
                          }}>
                            {category}
                          </h2>
                          <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '20px'}}>
                            <h3 style={{color: '#333', margin: '0 0 10px 0'}}>
                              {category === 'GF-KIDS' && '어린이 안전 솔루션'}
                              {category === 'GF-KIOSK' && '무인 키오스크 시스템'}
                              {category === 'GF-CCTV' && '지능형 CCTV 솔루션'}
                              {category === 'GF-VIP' && 'VIP 관리 시스템'}
                            </h3>
                            <span style={{
                              background: '#667eea', 
                              color: 'white', 
                              padding: '3px 12px', 
                              borderRadius: '15px', 
                              fontSize: '12px'
                            }}>
                              {category}
                            </span>
                            <p style={{color: '#666', marginTop: '15px'}}>
                              {category === 'GF-KIDS' && '어린이집, 유치원을 위한 안전한 출입 관리 시스템입니다.'}
                              {category === 'GF-KIOSK' && '얼굴인식 기반 무인 주문 및 결제 시스템입니다.'}
                              {category === 'GF-CCTV' && '지능형 얼굴 인식이 가능한 보안 솔루션입니다.'}
                              {category === 'GF-VIP' && '특별 고객을 위한 맞춤형 관리 시스템입니다.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {currentPage === 'notices' && (
        <section className="notices-page">
          <div className="container">
            <h1 style={{marginTop: '40px', marginBottom: '30px'}}>공지사항</h1>
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
              {notices.length > 0 ? (
                notices.map((notice, index) => (
                  <div key={index} style={{borderBottom: index < notices.length - 1 ? '1px solid #eee' : 'none', padding: '15px 0'}}>
                    <span style={{background: '#e74c3c', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', marginRight: '10px'}}>공지</span>
                    {notice.title}
                    <span style={{float: 'right', color: '#999'}}>{notice.date}</span>
                    {notice.content && (
                      <div style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>
                        {notice.content}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', color: '#666', padding: '40px 0'}}>
                  {loading ? '공지사항을 불러오는 중...' : '등록된 공지사항이 없습니다.'}
                </div>
              )}
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
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('about')}>
                  <h3>🏢 회사소개 관리</h3>
                  <p>회사 소개 내용을 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('history')}>
                  <h3>📅 회사연혁 관리</h3>
                  <p>회사 연혁을 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('business')}>
                  <h3>💼 사업분야 관리</h3>
                  <p>사업 분야를 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('achievements')}>
                  <h3>🏆 주요실적 관리</h3>
                  <p>주요 실적을 관리합니다</p>
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
                    const image = e.target.image.files[0];
                    if (title && content) {
                      addNotice({ title, content }, image);
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
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>첨부 이미지 (선택사항)</label>
                      <input 
                        name="image"
                        type="file"
                        accept="image/*"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
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
                        {notice.image && (
                          <div style={{margin: '10px 0'}}>
                            <img 
                              src={`http://localhost:5001${notice.image}`} 
                              alt={notice.title}
                              style={{maxWidth: '300px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd'}}
                            />
                          </div>
                        )}
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
                    const image = e.target.image.files[0];
                    if (name && description && category) {
                      addProduct({ name, description, category }, image);
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
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>제품 이미지 (선택사항)</label>
                      <input 
                        name="image"
                        type="file"
                        accept="image/*"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
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
                          <div style={{flex: 1}}>
                            <h4 style={{margin: '0 0 5px 0', color: '#333'}}>{product.name}</h4>
                            <span style={{background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginBottom: '10px', display: 'inline-block'}}>{product.category}</span>
                            <p style={{margin: '10px 0 0 0', color: '#666'}}>{product.description}</p>
                          </div>
                          {product.image && (
                            <div style={{marginLeft: '15px'}}>
                              <img 
                                src={`http://localhost:5001${product.image}`} 
                                alt={product.name}
                                style={{width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                              />
                            </div>
                          )}
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
                
                {/* 배너 이미지 업로드 섹션 */}
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3 style={{color: '#e74c3c', marginBottom: '15px'}}>🎯 메인 배너 이미지</h3>
                  <p style={{color: '#666', marginBottom: '20px'}}>홈페이지 메인 배너로 사용할 이미지를 업로드하세요. (권장 크기: 1920x600px)</p>
                  
                  <div style={{marginBottom: '20px'}}>
                    <input 
                      id="bannerImageUpload"
                      type="file" 
                      accept="image/*"
                      style={{marginBottom: '15px'}}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          uploadImage(file, 'banner');
                          e.target.value = '';
                        }
                      }}
                    />
                    <br />
                    <button 
                      style={{padding: '12px 24px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                      onClick={() => document.getElementById('bannerImageUpload').click()}
                      disabled={loading}
                    >
                      {loading ? '업로드 중...' : '📸 배너 이미지 업로드'}
                    </button>
                  </div>

                  {bannerImage && (
                    <div style={{border: '2px solid #e74c3c', borderRadius: '8px', padding: '15px', background: '#fff5f5'}}>
                      <h4 style={{color: '#e74c3c', margin: '0 0 10px 0'}}>현재 배너 이미지</h4>
                      <img 
                        src={`http://localhost:5001${bannerImage.path}`}
                        alt="Current Banner"
                        style={{width: '100%', maxWidth: '600px', height: '200px', objectFit: 'cover', borderRadius: '4px'}}
                      />
                      <p style={{margin: '10px 0 0 0', color: '#666', fontSize: '14px'}}>
                        파일명: {bannerImage.originalname || bannerImage.filename}
                      </p>
                    </div>
                  )}
                </div>

                {/* 일반 이미지 업로드 섹션 */}
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3 style={{color: '#17a2b8', marginBottom: '15px'}}>📁 일반 이미지 업로드</h3>
                  <p style={{color: '#666', marginBottom: '20px'}}>웹사이트에 사용할 일반 이미지를 업로드하고 관리할 수 있습니다.</p>
                  
                  <div style={{marginBottom: '20px'}}>
                    <input 
                      id="generalImageUpload"
                      type="file" 
                      accept="image/*"
                      style={{marginBottom: '15px'}}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          uploadImage(file, 'general');
                          e.target.value = '';
                        }
                      }}
                    />
                    <br />
                    <button 
                      style={{padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                      onClick={() => document.getElementById('generalImageUpload').click()}
                      disabled={loading}
                    >
                      {loading ? '업로드 중...' : '이미지 업로드'}
                    </button>
                  </div>
                </div>

                {/* 업로드된 이미지 갤러리 */}
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3 style={{marginBottom: '15px'}}>📷 업로드된 이미지</h3>
                  
                  {images.length > 0 ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
                      {images.map((image, index) => (
                        <div key={index} style={{
                          border: bannerImage && bannerImage.id === image.id ? '3px solid #e74c3c' : '1px solid #ddd',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: bannerImage && bannerImage.id === image.id ? '#fff5f5' : 'white'
                        }}>
                          <img 
                            src={`http://localhost:5001${image.path}`}
                            alt={image.originalname}
                            style={{width: '100%', height: '150px', objectFit: 'cover'}}
                          />
                          <div style={{padding: '10px'}}>
                            <p style={{margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: '#333'}}>
                              {image.originalname || image.filename}
                            </p>
                            <p style={{margin: '0 0 10px 0', fontSize: '12px', color: '#666'}}>
                              {new Date(image.uploadDate).toLocaleDateString()}
                            </p>
                            {bannerImage && bannerImage.id === image.id ? (
                              <span style={{
                                background: '#e74c3c', 
                                color: 'white', 
                                padding: '4px 8px', 
                                borderRadius: '12px', 
                                fontSize: '11px'
                              }}>
                                현재 배너
                              </span>
                            ) : (
                              <button
                                style={{
                                  padding: '6px 12px', 
                                  background: '#28a745', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setBannerImageById(image.id)}
                                disabled={loading}
                              >
                                배너로 설정
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', padding: '40px 0'}}>
                      업로드된 이미지가 없습니다.
                    </p>
                  )}
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

            {/* 회사 정보 관리 섹션들 */}
            {adminSection === 'about' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>회사소개 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('content', e.target.content.value);
                    const files = e.target.images.files;
                    for (let i = 0; i < files.length; i++) {
                      formData.append('images', files[i]);
                    }
                    updateCompanySection('about', formData);
                  }}>
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>회사 소개 내용</label>
                      <textarea 
                        name="content"
                        defaultValue={companyInfo.about?.content || ''}
                        rows="10"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        placeholder="회사 소개 내용을 입력하세요..."
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>이미지 추가 (선택사항)</label>
                      <input 
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      {loading ? '업데이트 중...' : '내용 업데이트'}
                    </button>
                  </form>
                  
                  {companyInfo.about?.images && companyInfo.about.images.length > 0 && (
                    <div style={{marginTop: '20px'}}>
                      <h4>현재 이미지</h4>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px'}}>
                        {companyInfo.about.images.map((image, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5001${image}`}
                            alt={`회사소개 이미지 ${index + 1}`}
                            style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'history' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>회사연혁 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3>새 연혁 추가</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('action', 'add');
                    formData.append('year', e.target.year.value);
                    formData.append('description', e.target.description.value);
                    if (e.target.image.files[0]) {
                      formData.append('image', e.target.image.files[0]);
                    }
                    updateCompanySection('history', formData);
                    e.target.reset();
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px'}}>
                      <div>
                        <input 
                          name="year"
                          type="text"
                          placeholder="년도"
                          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                          required
                        />
                      </div>
                      <div>
                        <input 
                          name="description"
                          type="text"
                          placeholder="연혁 내용"
                          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                          required
                        />
                      </div>
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="image"
                        type="file"
                        accept="image/*"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>
                    <button type="submit" style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                      연혁 추가
                    </button>
                  </form>
                </div>

                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>등록된 연혁</h3>
                  {companyInfo.history?.items && companyInfo.history.items.length > 0 ? (
                    companyInfo.history.items.map((item, index) => (
                      <div key={index} style={{borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{flex: 1}}>
                          <strong style={{color: '#333', fontSize: '18px'}}>{item.year}</strong>
                          <p style={{margin: '5px 0', color: '#666'}}>{item.description}</p>
                          {item.image && (
                            <img 
                              src={`http://localhost:5001${item.image}`} 
                              alt={item.description}
                              style={{width: '100px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', marginTop: '10px'}}
                            />
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            const formData = new FormData();
                            formData.append('action', 'delete');
                            formData.append('index', index.toString());
                            updateCompanySection('history', formData);
                          }}
                          style={{padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', margin: '20px 0'}}>등록된 연혁이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'business' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>사업분야 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3>새 사업분야 추가</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('action', 'add');
                    formData.append('name', e.target.name.value);
                    formData.append('description', e.target.description.value);
                    if (e.target.image.files[0]) {
                      formData.append('image', e.target.image.files[0]);
                    }
                    updateCompanySection('business', formData);
                    e.target.reset();
                  }}>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="name"
                        type="text"
                        placeholder="사업분야명"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <textarea 
                        name="description"
                        placeholder="사업분야 설명"
                        rows="3"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="image"
                        type="file"
                        accept="image/*"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>
                    <button type="submit" style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                      사업분야 추가
                    </button>
                  </form>
                </div>

                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>등록된 사업분야</h3>
                  {companyInfo.business?.items && companyInfo.business.items.length > 0 ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
                      {companyInfo.business.items.map((item, index) => (
                        <div key={index} style={{border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden'}}>
                          {item.image && (
                            <img 
                              src={`http://localhost:5001${item.image}`} 
                              alt={item.name}
                              style={{width: '100%', height: '150px', objectFit: 'cover'}}
                            />
                          )}
                          <div style={{padding: '15px'}}>
                            <h4 style={{margin: '0 0 10px 0', color: '#333'}}>{item.name}</h4>
                            <p style={{margin: '0 0 15px 0', color: '#666', fontSize: '14px'}}>{item.description}</p>
                            <button 
                              onClick={() => {
                                const formData = new FormData();
                                formData.append('action', 'delete');
                                formData.append('index', index.toString());
                                updateCompanySection('business', formData);
                              }}
                              style={{padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', margin: '20px 0'}}>등록된 사업분야가 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'achievements' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>주요실적 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px'}}>
                  <h3>새 실적 추가</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('action', 'add');
                    formData.append('project', e.target.project.value);
                    formData.append('client', e.target.client.value);
                    formData.append('year', e.target.year.value);
                    formData.append('description', e.target.description.value);
                    if (e.target.image.files[0]) {
                      formData.append('image', e.target.image.files[0]);
                    }
                    updateCompanySection('achievements', formData);
                    e.target.reset();
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                      <input 
                        name="project"
                        type="text"
                        placeholder="프로젝트명"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                      <input 
                        name="client"
                        type="text"
                        placeholder="고객사명"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px'}}>
                      <input 
                        name="year"
                        type="text"
                        placeholder="완료년도"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                      <textarea 
                        name="description"
                        placeholder="실적 상세 설명"
                        rows="3"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        required
                      />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <input 
                        name="image"
                        type="file"
                        accept="image/*"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>
                    <button type="submit" style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                      실적 추가
                    </button>
                  </form>
                </div>

                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <h3>등록된 주요실적</h3>
                  {companyInfo.achievements?.items && companyInfo.achievements.items.length > 0 ? (
                    companyInfo.achievements.items.map((item, index) => (
                      <div key={index} style={{borderBottom: '1px solid #eee', padding: '20px 0', display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
                        {item.image && (
                          <img 
                            src={`http://localhost:5001${item.image}`} 
                            alt={item.project}
                            style={{width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', flexShrink: 0}}
                          />
                        )}
                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div>
                              <h4 style={{margin: '0 0 5px 0', color: '#333'}}>{item.project}</h4>
                              <p style={{margin: '0 0 5px 0', color: '#666'}}>고객사: {item.client}</p>
                              <p style={{margin: '0 0 10px 0', color: '#888', fontSize: '14px'}}>완료년도: {item.year}</p>
                              <p style={{margin: '0', color: '#555', fontSize: '14px'}}>{item.description}</p>
                            </div>
                            <button 
                              onClick={() => {
                                const formData = new FormData();
                                formData.append('action', 'delete');
                                formData.append('index', index.toString());
                                updateCompanySection('achievements', formData);
                              }}
                              style={{padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666', textAlign: 'center', margin: '20px 0'}}>등록된 실적이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* 회사 정보 페이지들 */}
      {currentPage === 'about' && (
        <section style={{padding: '60px 0', background: '#f8f9fa', minHeight: '80vh'}}>
          <div className="container">
            <h1 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>회사소개</h1>
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              <div style={{background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '16px', lineHeight: '1.8', color: '#555', marginBottom: '30px'}}>
                  {companyInfo.about?.content ? (
                    companyInfo.about.content.split('\n').map((line, index) => (
                      <p key={index} style={{margin: '0 0 15px 0'}}>{line}</p>
                    ))
                  ) : (
                    <p>회사 소개 내용이 등록되지 않았습니다.</p>
                  )}
                </div>
                
                {companyInfo.about?.images && companyInfo.about.images.length > 0 && (
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                    {companyInfo.about.images.map((image, index) => (
                      <img 
                        key={index}
                        src={`http://localhost:5001${image}`}
                        alt={`회사소개 이미지 ${index + 1}`}
                        style={{width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === 'history' && (
        <section style={{padding: '60px 0', background: '#f8f9fa', minHeight: '80vh'}}>
          <div className="container">
            <h1 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>회사연혁</h1>
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              {companyInfo.history?.items && companyInfo.history.items.length > 0 ? (
                <div style={{position: 'relative', paddingLeft: '30px'}}>
                  <div style={{position: 'absolute', left: '15px', top: '0', bottom: '0', width: '2px', background: '#667eea'}}></div>
                  {companyInfo.history.items.map((item, index) => (
                    <div key={index} style={{position: 'relative', marginBottom: '40px'}}>
                      <div style={{position: 'absolute', left: '-23px', top: '10px', width: '16px', height: '16px', borderRadius: '50%', background: '#667eea', border: '3px solid white', boxShadow: '0 0 0 3px #667eea'}}></div>
                      <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginLeft: '20px'}}>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
                          <div style={{flex: 1}}>
                            <h3 style={{color: '#667eea', margin: '0 0 10px 0', fontSize: '20px'}}>{item.year}</h3>
                            <p style={{color: '#555', margin: '0', fontSize: '16px', lineHeight: '1.6'}}>{item.description}</p>
                          </div>
                          {item.image && (
                            <img 
                              src={`http://localhost:5001${item.image}`} 
                              alt={item.description}
                              style={{width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e0e0e0'}}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                  <p style={{color: '#666', fontSize: '16px'}}>등록된 연혁이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {currentPage === 'business' && (
        <section style={{padding: '60px 0', background: '#f8f9fa', minHeight: '80vh'}}>
          <div className="container">
            <h1 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>사업분야</h1>
            {companyInfo.business?.items && companyInfo.business.items.length > 0 ? (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px'}}>
                {companyInfo.business.items.map((item, index) => (
                  <div key={index} style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease'}}>
                    {item.image && (
                      <img 
                        src={`http://localhost:5001${item.image}`} 
                        alt={item.name}
                        style={{width: '100%', height: '200px', objectFit: 'cover'}}
                      />
                    )}
                    <div style={{padding: '25px'}}>
                      <h3 style={{color: '#333', margin: '0 0 15px 0', fontSize: '20px'}}>{item.name}</h3>
                      <p style={{color: '#666', margin: '0', fontSize: '15px', lineHeight: '1.6'}}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
                <p style={{color: '#666', fontSize: '16px'}}>등록된 사업분야가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {currentPage === 'achievements' && (
        <section style={{padding: '60px 0', background: '#f8f9fa', minHeight: '80vh'}}>
          <div className="container">
            <h1 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>주요실적</h1>
            <div style={{maxWidth: '1000px', margin: '0 auto'}}>
              {companyInfo.achievements?.items && companyInfo.achievements.items.length > 0 ? (
                companyInfo.achievements.items.map((item, index) => (
                  <div key={index} style={{background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
                    <div style={{display: 'flex', alignItems: 'flex-start', gap: '30px'}}>
                      {item.image && (
                        <img 
                          src={`http://localhost:5001${item.image}`} 
                          alt={item.project}
                          style={{width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e0e0e0', flexShrink: 0}}
                        />
                      )}
                      <div style={{flex: 1}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                          <h3 style={{color: '#333', margin: '0', fontSize: '22px'}}>{item.project}</h3>
                          <span style={{background: '#667eea', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold'}}>{item.year}</span>
                        </div>
                        <p style={{color: '#666', margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold'}}>고객사: {item.client}</p>
                        <p style={{color: '#555', margin: '0', fontSize: '15px', lineHeight: '1.6'}}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                  <p style={{color: '#666', fontSize: '16px'}}>등록된 주요실적이 없습니다.</p>
                </div>
              )}
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