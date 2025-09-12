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
  const [bannerImages, setBannerImages] = React.useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
  const [previousBannerIndex, setPreviousBannerIndex] = React.useState(null);
  const [isSliding, setIsSliding] = React.useState(false);
  const [companyInfo, setCompanyInfo] = React.useState({
    about: { title: "회사소개", content: "", images: [] },
    history: { title: "회사연혁", items: [] },
    business: { title: "사업분야", items: [] },
    achievements: { title: "주요실적", items: [] }
  });
  const [companyBasicInfo, setCompanyBasicInfo] = React.useState({
    companyName: "가온",
    ceoName: "박성헌",
    address: "경기 용인시 기흥구 강남로 3 (구갈동, 강남앤플러스) 5층 501-35호",
    businessNumber: "710-07-03011",
    tel: "031-281-3980",
    mobile: "010-6215-3980",
    email: "psh01@newgaon.co.kr"
  });
  const [contactForm, setContactForm] = React.useState({
    name: '',
    contact: '',
    content: '',
    file: null,
    isPublic: false
  });
  const [contactSubmitting, setContactSubmitting] = React.useState(false);
  const [contacts, setContacts] = React.useState([]);
  const fileInputRef = React.useRef(null);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = React.useState(false);
  const [selectedNotice, setSelectedNotice] = React.useState(null);
  const [isNoticeDetailOpen, setIsNoticeDetailOpen] = React.useState(false);
  const [pageHistory, setPageHistory] = React.useState(['home']);

  const showPage = (page) => {
    if (page === 'admin' && !isLoggedIn) {
      setCurrentPage('login');
      setPageHistory(prev => [...prev, 'login']);
      window.history.pushState({page: 'login'}, '', `/#login`);
    } else {
      setCurrentPage(page);
      setPageHistory(prev => [...prev, page]);
      window.history.pushState({page}, '', `/#${page}`);
    }
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // 현재 페이지 제거
      const previousPage = newHistory[newHistory.length - 1]; // 이전 페이지
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
      window.history.pushState({page: previousPage}, '', `/#${previousPage}`);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setCurrentPage('admin');
      setPageHistory(prev => [...prev, 'admin']);
      window.history.pushState({page: 'admin'}, '', '/#admin');
      alert('로그인 성공!');
    } else {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    setAdminSection('dashboard');
    setPageHistory(prev => [...prev, 'home']);
    window.history.pushState({page: 'home'}, '', '/#home');
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

  // 홈 화면에 표시할 제품을 선택하는 함수 (최신 순으로 정렬)
  const getRepresentativeProducts = (products) => {
    // 모든 제품을 최신 순으로 정렬 (id가 높은 순)
    const sortedProducts = products.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    // 최대 6개까지만 표시 (레이아웃 고려)
    return sortedProducts.slice(0, 6);
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/notices');
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('제품 로딩 실패:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
    }
  };

  const fetchBannerImage = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/images/banner');
      const data = await response.json();
      setBannerImage(data.bannerImage);
    } catch (error) {
      console.error('배너 이미지 로딩 실패:', error);
    }
  };

  const fetchBannerImages = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/images/banners');
      const data = await response.json();
      setBannerImages(data.bannerImages || []);
    } catch (error) {
      console.error('배너 이미지들 로딩 실패:', error);
    }
  };

  const uploadImage = async (file, type = 'general') => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('http://localhost:5003/api/images/upload', {
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
      const response = await fetch(`http://localhost:5003/api/images/banner/${imageId}`, {
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

  const toggleBannerImage = async (imageId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5003/api/images/banner-toggle/${imageId}`, {
        method: 'PUT'
      });

      const result = await response.json();
      if (result.success) {
        setBannerImages(result.bannerImages);
        fetchBannerImages(); // 최신 상태로 다시 로드
        alert(result.isInBanner ? '슬라이드쇼에 추가되었습니다.' : '슬라이드쇼에서 제거되었습니다.');
      }
    } catch (error) {
      console.error('배너 이미지 토글 실패:', error);
      alert('배너 이미지 토글에 실패했습니다.');
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

      const response = await fetch('http://localhost:5003/api/notices', {
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

      const response = await fetch('http://localhost:5003/api/products', {
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
      const response = await fetch('http://localhost:5004/api/company');
      const data = await response.json();
      setCompanyInfo(data);
      
      // 회사 기본정보가 있으면 설정
      if (data.companyInfo) {
        setCompanyBasicInfo(data.companyInfo);
      }
    } catch (error) {
      console.error('회사 정보 로딩 실패:', error);
    }
  };

  const updateCompanySection = async (section, formData) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5004/api/company/${section}`, {
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

  // 회사 기본정보 수정 함수
  const updateCompanyBasicInfo = async (updatedInfo) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5004/api/company/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedInfo)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setCompanyBasicInfo(updatedData);
        alert('회사 정보가 수정되었습니다.');
      } else {
        alert('정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('정보 수정 오류:', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의하기 관련 함수들
  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('문의하기 데이터 로딩 실패:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.contact || !contactForm.content) {
      alert('이름, 연락처, 내용은 필수 항목입니다.');
      return;
    }

    try {
      setContactSubmitting(true);
      const formData = new FormData();
      formData.append('name', contactForm.name);
      formData.append('contact', contactForm.contact);
      formData.append('content', contactForm.content);
      formData.append('isPublic', contactForm.isPublic);
      if (contactForm.file) {
        formData.append('file', contactForm.file);
      }

      const response = await fetch('http://localhost:5003/api/contacts', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('문의가 성공적으로 등록되었습니다.');
        setContactForm({
          name: '',
          contact: '',
          content: '',
          file: null,
          isPublic: false
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error('문의 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('문의 등록 오류:', error);
      alert('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      const response = await fetch(`http://localhost:5003/api/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert('상태가 업데이트되었습니다.');
        fetchContacts();
      } else {
        throw new Error('상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const deleteContact = async (contactId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:5003/api/contacts/${contactId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('문의가 삭제되었습니다.');
          fetchContacts();
        } else {
          throw new Error('삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 제품 상세보기 함수들 
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
    // 모달 열기를 히스토리에 추가
    window.history.pushState({modalType: 'product', modalData: product}, '', window.location.href);
  };

  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
    // 모달 닫을 때 히스토리에서 제거 (뒤로가기 한 번)
    if (window.history.state && window.history.state.modalType === 'product') {
      window.history.back();
    }
  };

  const openNoticeDetail = (notice) => {
    setSelectedNotice(notice);
    setIsNoticeDetailOpen(true);
    // 모달 열기를 히스토리에 추가
    window.history.pushState({modalType: 'notice', modalData: notice}, '', window.location.href);
  };

  const closeNoticeDetail = () => {
    setIsNoticeDetailOpen(false);
    setSelectedNotice(null);
    // 모달 닫을 때 히스토리에서 제거 (뒤로가기 한 번)
    if (window.history.state && window.history.state.modalType === 'notice') {
      window.history.back();
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
      fetchBannerImages();
    }
    if (isLoggedIn && (adminSection === 'about' || adminSection === 'history' || adminSection === 'business' || adminSection === 'achievements')) {
      fetchCompanyInfo();
    }
    if (isLoggedIn && adminSection === 'contacts') {
      fetchContacts();
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
      fetchBannerImages();
      fetchCompanyInfo();
    }
  }, [isLoggedIn, adminSection, currentPage]);

  React.useEffect(() => {
    // 브라우저의 뒤로가기/앞으로가기 버튼을 처리
    const handlePopState = (event) => {
      // 모달이 열려있는 상태에서 뒤로가기를 누른 경우
      if (isProductDetailOpen || isNoticeDetailOpen) {
        closeProductDetail();
        closeNoticeDetail();
        return;
      }

      if (event.state && event.state.modalType) {
        // 모달 상태 복원
        if (event.state.modalType === 'product') {
          setSelectedProduct(event.state.modalData);
          setIsProductDetailOpen(true);
        } else if (event.state.modalType === 'notice') {
          setSelectedNotice(event.state.modalData);
          setIsNoticeDetailOpen(true);
        }
      } else if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        // 페이지 히스토리를 업데이트하지 않고 단순히 페이지만 변경
      } else {
        // URL 해시에서 페이지 추출
        const hash = window.location.hash.substring(1);
        if (hash && hash !== currentPage) {
          setCurrentPage(hash);
        } else if (!hash) {
          setCurrentPage('home');
        }
      }
    };

    // 컴포넌트 마운트시 URL 해시 확인
    const hash = window.location.hash.substring(1);
    if (hash && hash !== currentPage) {
      setCurrentPage(hash);
      if (!pageHistory.includes(hash)) {
        setPageHistory(prev => [...prev, hash]);
      }
    } else if (!hash && currentPage !== 'home') {
      window.history.replaceState({page: 'home'}, '', '/#home');
    }

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPage, pageHistory, isProductDetailOpen, isNoticeDetailOpen]);

  // 배너 이미지 슬라이드쇼 효과 (5초 간격, 천천히 애니메이션)
  React.useEffect(() => {
    if (bannerImages.length > 1 && currentPage === 'home') {
      const interval = setInterval(() => {
        if (!isSliding) {
          setIsSliding(true);
          setPreviousBannerIndex(currentBannerIndex);
          
          setTimeout(() => {
            setCurrentBannerIndex(prevIndex => 
              prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
            );
            
            setTimeout(() => {
              setIsSliding(false);
              setPreviousBannerIndex(null);
            }, 1000); // 1초 애니메이션 지속
          }, 1500); // 1.5초 페이드아웃
        }
      }, 5000); // 5초 간격 (3초 대기 + 2초 애니메이션)

      return () => clearInterval(interval);
    }
  }, [bannerImages.length, currentPage, isSliding, currentBannerIndex]);

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <img 
            src={require('./assets/gaon-logo.png')} 
            alt="GAON" 
            onClick={() => showPage('home')}
            style={{
              height: '60px',
              cursor: 'pointer',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          />
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
          <section className="hero hero-slideshow">
            {/* 슬라이드 배경들 */}
            {bannerImages.length > 0 ? (
              <>
                {bannerImages.map((image, index) => (
                  <div
                    key={`slide-${image.id}-${index}`}
                    className={`hero-slide ${
                      index === currentBannerIndex ? 'active' : 
                      index === previousBannerIndex && isSliding ? 'exit' : ''
                    }`}
                    style={{
                      background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(http://localhost:5003${image.path}) center/cover`
                    }}
                  />
                ))}
              </>
            ) : bannerImage ? (
              <div
                className="hero-slide active"
                style={{
                  background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(http://localhost:5003${bannerImage.path}) center/cover`,
                  position: 'relative',
                  opacity: 1,
                  transform: 'translateX(0)'
                }}
              />
            ) : (
              <div
                className="hero-slide active"
                style={{
                  background: 'var(--gradient-dark)',
                  position: 'relative',
                  opacity: 1,
                  transform: 'translateX(0)'
                }}
              />
            )}
            
            <div className="hero-content" style={{position: 'relative', zIndex: 10}}>
              <h1 style={{color: 'white'}}>내일의 기술을 만듭니다</h1>
              <p style={{color: 'white'}}>공인받는 기술력과 아이디어로<br/>차별화된 서비스와 최상의 결과를 만들어드립니다.</p>
            </div>
            
            {/* 인디케이터를 섹션 바깥으로 이동 */}
            {bannerImages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                {bannerImages.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === currentBannerIndex 
                        ? 'rgba(255,255,255,0.9)' 
                        : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    onClick={() => {
                      if (!isSliding) {
                        setIsSliding(true);
                        setPreviousBannerIndex(currentBannerIndex);
                        
                        setTimeout(() => {
                          setCurrentBannerIndex(index);
                          setTimeout(() => {
                            setIsSliding(false);
                            setPreviousBannerIndex(null);
                          }, 50);
                        }, 400);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>
          
          <section className="features">
            <div className="container">
              <div className="feature-grid">
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => showPage('about')}>
                  <h3>회사소개</h3>
                  <p>다른 큰 경쟁으로 도약하겠습니다.</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => showPage('history')}>
                  <h3>회사연혁</h3>
                  <p>지금껏 걸어온 길을 살펴보세요.</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => showPage('business')}>
                  <h3>사업분야</h3>
                  <p>차별화된 서비스로 승부합니다.</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => showPage('achievements')}>
                  <h3>주요실적</h3>
                  <p>다양한 분야에서 위상을 높이고 있습니다.</p>
                </div>
              </div>
            </div>
          </section>


          {/* 주요 제품 소개 섹션 */}
          {products.length > 0 && (
            <section className="products-home-section">
              <div className="container">
                <h2 style={{textAlign: 'center', marginBottom: '40px', color: '#333'}}>주요 제품</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '30px'
                }}>
                  {getRepresentativeProducts(products).map((product, index) => (
                    <div 
                      key={index} 
                      style={{
                        cursor: 'pointer',
                        background: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        border: '1px solid #eee'
                      }} 
                      onClick={() => openProductDetail(product)}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-5px)';
                        e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                      }}
                    >
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

          {/* 공지사항 & 문의하기 섹션 - 강제 가로 모드 */}
          <section className="notice-contact-section" style={{
            padding: '50px 0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 70%, #cbd5e1 100%)',
            marginTop: '40px'
          }}>
            <div className="container" style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 30px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row', 
                gap: '40px',
                alignItems: 'stretch',
                justifyContent: 'center',
                width: '100%',
                flexWrap: 'nowrap'
              }}>
                
                {/* 공지사항 - 가로 배치용 */}
                <div className="notice-card" style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  flex: '1 1 45%',
                  minHeight: '450px',
                  maxWidth: '45%',
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '18px'}}>📢 최신 공지사항</h2>
                  {notices.length > 0 ? (
                    <div>
                      {notices.slice(0, 3).map((notice, index) => (
                        <div key={index} style={{
                          padding: '12px', 
                          marginBottom: '12px', 
                          borderRadius: '6px', 
                          border: '1px solid #e1e8ed',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }} 
                        onClick={() => openNoticeDetail(notice)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#667eea';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e1e8ed';
                        }}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div style={{flex: 1}}>
                              <div style={{marginBottom: '6px'}}>
                                <span style={{background: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', marginRight: '6px'}}>공지</span>
                                <strong style={{color: '#333', fontSize: '13px'}}>{notice.title}</strong>
                              </div>
                              {notice.content && (
                                <p style={{margin: '0', color: '#666', fontSize: '11px', lineHeight: '1.4'}}>
                                  {notice.content.length > 60 ? notice.content.substring(0, 60) + '...' : notice.content}
                                </p>
                              )}
                              <span style={{color: '#999', fontSize: '10px', display: 'block', marginTop: '6px'}}>{notice.date}</span>
                            </div>
                            {notice.image && (
                              <div style={{marginLeft: '8px'}}>
                                <img 
                                  src={`http://localhost:5003${notice.image}`} 
                                  alt={notice.title}
                                  style={{width: '50px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div style={{textAlign: 'center', marginTop: '20px'}}>
                        <button 
                          onClick={() => showPage('notices')}
                          style={{
                            padding: '10px 24px', 
                            background: '#667eea', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '20px', 
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#5a6fd8';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = '#667eea';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          더 많은 공지사항 보기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{textAlign: 'center', padding: '40px 15px', color: '#999'}}>
                      <div style={{fontSize: '36px', marginBottom: '12px', opacity: '0.5'}}>📢</div>
                      <p style={{fontSize: '14px', marginBottom: '8px', fontWeight: '600'}}>등록된 공지사항이 없습니다</p>
                      <p style={{fontSize: '12px', color: '#bbb'}}>새로운 소식이 있을 때 알려드리겠습니다</p>
                    </div>
                  )}
                </div>

                {/* 문의하기 - 가로 배치용 */}
                <div className="contact-card" style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  flex: '1 1 45%',
                  minHeight: '450px',
                  maxWidth: '45%',
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '18px'}}>💬 제품 문의 및 상담</h2>
                  <p style={{textAlign: 'center', marginBottom: '25px', color: '#666', fontSize: '14px', lineHeight: '1.5'}}>
                    궁금한 점이 있으시면 언제든지 문의해 주세요.<br />
                    전문 상담원이 신속하고 정확한 답변을 드리겠습니다.
                  </p>
                  <form onSubmit={handleContactSubmit}>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '12px'}}>이름 *</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e1e8ed',
                          borderRadius: '6px',
                          fontSize: '12px',
                          transition: 'border-color 0.3s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                        required
                      />
                    </div>
                    
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '12px'}}>연락처 *</label>
                      <input
                        type="text"
                        value={contactForm.contact}
                        onChange={(e) => setContactForm({...contactForm, contact: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e1e8ed',
                          borderRadius: '6px',
                          fontSize: '12px',
                          transition: 'border-color 0.3s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                        placeholder="전화번호, 이메일 등"
                        required
                      />
                    </div>

                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '12px'}}>문의내용 *</label>
                      <textarea
                        value={contactForm.content}
                        onChange={(e) => setContactForm({...contactForm, content: e.target.value})}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e1e8ed',
                          borderRadius: '6px',
                          fontSize: '12px',
                          transition: 'border-color 0.3s',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          minHeight: '80px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                        placeholder="문의하실 내용을 자세히 작성해 주세요."
                        required
                      />
                    </div>

                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '12px'}}>파일 첨부</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => setContactForm({...contactForm, file: e.target.files[0]})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #e1e8ed',
                          borderRadius: '6px',
                          fontSize: '11px',
                          boxSizing: 'border-box'
                        }}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <small style={{color: '#666', fontSize: '10px', display: 'block', marginTop: '3px'}}>
                        이미지, PDF, 문서 등 (최대 5MB)
                      </small>
                    </div>

                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                        <input
                          type="checkbox"
                          checked={contactForm.isPublic}
                          onChange={(e) => setContactForm({...contactForm, isPublic: e.target.checked})}
                          style={{marginRight: '6px', transform: 'scale(1.1)'}}
                        />
                        <span style={{color: '#333', fontSize: '12px'}}>공개 문의</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: contactSubmitting ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: contactSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => !contactSubmitting && (
                        e.target.style.background = '#5a6fd8',
                        e.target.style.transform = 'translateY(-1px)'
                      )}
                      onMouseOut={(e) => !contactSubmitting && (
                        e.target.style.background = '#667eea',
                        e.target.style.transform = 'translateY(0)'
                      )}
                    >
                      {contactSubmitting ? '전송 중...' : '📩 상담 신청하기'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* 제품 상세보기 모달 */}
          {isProductDetailOpen && selectedProduct && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={closeProductDetail}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                maxWidth: '800px',
                maxHeight: '90vh',
                width: '90%',
                overflow: 'auto',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
                
                {/* 닫기 버튼 */}
                <button 
                  onClick={closeProductDetail}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    zIndex: 1001
                  }}
                >
                  ✕
                </button>

                <div style={{padding: '40px'}}>
                  {/* 제품 이미지 */}
                  {selectedProduct.image && (
                    <div style={{textAlign: 'center', marginBottom: '30px'}}>
                      <img 
                        src={`http://localhost:5003${selectedProduct.image}`}
                        alt={selectedProduct.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain',
                          borderRadius: '10px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}

                  {/* 제품 정보 */}
                  <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <span style={{
                      background: '#e74c3c', 
                      color: 'white', 
                      padding: '6px 15px', 
                      borderRadius: '20px', 
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {selectedProduct.category}
                    </span>
                  </div>

                  <h1 style={{
                    textAlign: 'center', 
                    color: '#333', 
                    marginBottom: '30px',
                    fontSize: '32px'
                  }}>
                    {selectedProduct.name}
                  </h1>

                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '30px',
                    borderRadius: '10px',
                    marginBottom: '30px'
                  }}>
                    <h3 style={{color: '#333', marginBottom: '15px', fontSize: '20px'}}>📝 제품 설명</h3>
                    <p style={{
                      color: '#555',
                      lineHeight: '1.8',
                      fontSize: '16px',
                      margin: 0
                    }}>
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* 추가 정보가 있다면 표시 */}
                  {selectedProduct.features && (
                    <div style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e1e8ed',
                      padding: '25px',
                      borderRadius: '10px',
                      marginBottom: '30px'
                    }}>
                      <h3 style={{color: '#333', marginBottom: '15px', fontSize: '18px'}}>✨ 주요 특징</h3>
                      <ul style={{color: '#555', lineHeight: '1.6', paddingLeft: '20px'}}>
                        {(Array.isArray(selectedProduct.features) 
                          ? selectedProduct.features 
                          : selectedProduct.features?.split('\n') || []
                        ).map((feature, index) => (
                          feature && feature.trim() && <li key={index} style={{marginBottom: '5px'}}>{feature.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 문의하기 버튼 */}
                  <div style={{textAlign: 'center'}}>
                    <button
                      onClick={() => {
                        closeProductDetail();
                        // 문의하기 섹션으로 스크롤
                        setTimeout(() => {
                          const contactSection = document.querySelector('[style*="공지사항 & 문의하기"]')?.closest('section');
                          if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '15px 40px',
                        borderRadius: '30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#5a6fd8'}
                      onMouseOut={(e) => e.target.style.background = '#667eea'}
                    >
                      📞 이 제품 문의하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 공지사항 상세보기 모달 */}
          {isNoticeDetailOpen && selectedNotice && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={closeNoticeDetail}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                maxWidth: '700px',
                maxHeight: '80vh',
                width: '90%',
                overflow: 'auto',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
                
                {/* 닫기 버튼 */}
                <button 
                  onClick={closeNoticeDetail}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    zIndex: 1001
                  }}
                >
                  ×
                </button>
                
                <div style={{padding: '40px'}}>
                  {/* 공지사항 헤더 */}
                  <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <span style={{
                      background: '#e74c3c', 
                      color: 'white', 
                      padding: '8px 20px', 
                      borderRadius: '20px', 
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      📢 공지사항
                    </span>
                  </div>

                  {/* 공지사항 제목 */}
                  <h1 style={{
                    textAlign: 'center',
                    color: '#333',
                    marginBottom: '20px',
                    fontSize: '28px'
                  }}>
                    {selectedNotice.title}
                  </h1>

                  {/* 작성일 */}
                  <div style={{
                    textAlign: 'center',
                    color: '#999',
                    marginBottom: '30px',
                    fontSize: '14px'
                  }}>
                    작성일: {selectedNotice.date}
                  </div>

                  {/* 공지사항 내용 */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '30px',
                    borderRadius: '10px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      color: '#333',
                      lineHeight: '1.8',
                      fontSize: '16px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedNotice.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 회사정보 Footer */}
          <section className="company-footer" style={{
            background: '#2c3e50',
            color: 'white',
            padding: '40px 0',
            marginTop: '60px',
            borderTop: '1px solid #34495e'
          }}>
            <div className="container">
              <div style={{
                textAlign: 'center',
                lineHeight: '1.8',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ fontSize: '16px' }}>{companyBasicInfo.companyName}</strong> | 
                  대표자 : {companyBasicInfo.ceoName} | 
                  소재지 : {companyBasicInfo.address} | 
                  사업자등록번호 : {companyBasicInfo.businessNumber}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  TEL : {companyBasicInfo.tel} | 
                  HP : {companyBasicInfo.mobile} | 
                  E-mail : {companyBasicInfo.email}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#bdc3c7',
                  borderTop: '1px solid #34495e',
                  paddingTop: '15px'
                }}>
                  {companyBasicInfo.companyName} All Rights Reserved.
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
                                        src={`http://localhost:5003${product.image}`} 
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
                  <div 
                    key={index} 
                    style={{
                      borderBottom: index < notices.length - 1 ? '1px solid #eee' : 'none', 
                      padding: '15px 0',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onClick={() => openNoticeDetail(notice)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
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
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('companyInfo')}>
                  <h3>🏢 회사정보 관리</h3>
                  <p>회사 기본정보를 관리합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('statistics')}>
                  <h3>📊 통계 분석</h3>
                  <p>방문자 통계를 확인합니다</p>
                </div>
                <div className="feature" style={{cursor: 'pointer'}} onClick={() => setAdminSection('contacts')}>
                  <h3>📞 문의하기 관리</h3>
                  <p>고객 문의를 관리합니다</p>
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
                              src={`http://localhost:5003${notice.image}`} 
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
                                src={`http://localhost:5003${product.image}`} 
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

                  <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                    {bannerImage && (
                      <div style={{flex: 1, border: '2px solid #e74c3c', borderRadius: '8px', padding: '15px', background: '#fff5f5'}}>
                        <h4 style={{color: '#e74c3c', margin: '0 0 10px 0'}}>현재 배너 이미지</h4>
                        <img 
                          src={`http://localhost:5003${bannerImage.path}`}
                          alt="Current Banner"
                          style={{width: '100%', maxWidth: '300px', height: '150px', objectFit: 'cover', borderRadius: '4px'}}
                        />
                        <p style={{margin: '10px 0 0 0', color: '#666', fontSize: '14px'}}>
                          파일명: {bannerImage.originalname || bannerImage.filename}
                        </p>
                      </div>
                    )}
                    
                    <div style={{flex: 1, border: '2px solid #007bff', borderRadius: '8px', padding: '15px', background: '#f0f8ff'}}>
                      <h4 style={{color: '#007bff', margin: '0 0 10px 0'}}>
                        슬라이드쇼 배너 ({bannerImages.length}개)
                      </h4>
                      {bannerImages.length > 0 ? (
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px'}}>
                          {bannerImages.slice(0, 4).map((img, idx) => (
                            <img 
                              key={idx}
                              src={`http://localhost:5003${img.path}`}
                              alt={`Slideshow ${idx + 1}`}
                              style={{width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}
                            />
                          ))}
                          {bannerImages.length > 4 && (
                            <div style={{
                              width: '80px', 
                              height: '60px', 
                              background: 'rgba(0,123,255,0.1)', 
                              borderRadius: '4px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#007bff'
                            }}>
                              +{bannerImages.length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{color: '#666', fontSize: '14px', margin: 0}}>
                          슬라이드쇼용 이미지가 없습니다.<br/>
                          아래에서 이미지를 "슬라이드 추가"로 추가하세요.
                        </p>
                      )}
                      
                      {bannerImages.length > 1 && (
                        <p style={{margin: '10px 0 0 0', color: '#666', fontSize: '12px'}}>
                          🔄 홈 배너에서 2초마다 자동 전환됩니다.
                        </p>
                      )}
                    </div>
                  </div>
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
                            src={`http://localhost:5003${image.path}`}
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
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                              {bannerImage && bannerImage.id === image.id && (
                                <span style={{
                                  background: '#e74c3c', 
                                  color: 'white', 
                                  padding: '4px 8px', 
                                  borderRadius: '12px', 
                                  fontSize: '11px',
                                  textAlign: 'center'
                                }}>
                                  현재 배너
                                </span>
                              )}
                              
                              {bannerImages.some(banner => banner.id === image.id) && (
                                <span style={{
                                  background: '#007bff', 
                                  color: 'white', 
                                  padding: '4px 8px', 
                                  borderRadius: '12px', 
                                  fontSize: '11px',
                                  textAlign: 'center'
                                }}>
                                  슬라이드쇼
                                </span>
                              )}
                              
                              <div style={{display: 'flex', gap: '5px'}}>
                                {!(bannerImage && bannerImage.id === image.id) && (
                                  <button
                                    style={{
                                      flex: 1,
                                      padding: '6px 8px', 
                                      background: '#28a745', 
                                      color: 'white', 
                                      border: 'none', 
                                      borderRadius: '4px', 
                                      fontSize: '11px',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => setBannerImageById(image.id)}
                                    disabled={loading}
                                  >
                                    배너설정
                                  </button>
                                )}
                                
                                <button
                                  style={{
                                    flex: 1,
                                    padding: '6px 8px', 
                                    background: bannerImages.some(banner => banner.id === image.id) ? '#dc3545' : '#007bff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => toggleBannerImage(image.id)}
                                  disabled={loading}
                                >
                                  {bannerImages.some(banner => banner.id === image.id) ? '슬라이드 제거' : '슬라이드 추가'}
                                </button>
                              </div>
                            </div>
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
                            src={`http://localhost:5003${image}`}
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
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('content', e.target.content.value);
                    const files = e.target.images.files;
                    for (let i = 0; i < files.length; i++) {
                      formData.append('images', files[i]);
                    }
                    updateCompanySection('history', formData);
                  }}>
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>회사 연혁 내용</label>
                      <textarea 
                        name="content"
                        defaultValue={companyInfo.history?.content || ''}
                        rows="10"
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                        placeholder="회사 연혁을 입력하세요... 
예시:
2023년 12월 - 가온 설립
2024년 3월 - AI 얼굴인식 솔루션 개발 시작
2024년 6월 - 첫 번째 제품 출시"
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
                  
                  {companyInfo.history?.images && companyInfo.history.images.length > 0 && (
                    <div style={{marginTop: '20px'}}>
                      <h4>현재 이미지</h4>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px'}}>
                        {companyInfo.history.images.map((image, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5003${image}`}
                            alt={`회사연혁 이미지 ${index + 1}`}
                            style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                          />
                        ))}
                      </div>
                    </div>
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
                              src={`http://localhost:5003${item.image}`} 
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
                            src={`http://localhost:5003${item.image}`} 
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

            {adminSection === 'contacts' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>문의하기 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  {contacts.length > 0 ? (
                    <div>
                      {contacts.map(contact => (
                        <div key={contact.id} style={{
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          background: contact.status === 'completed' ? '#f8f9fa' : 'white'
                        }}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                            <div>
                              <h3 style={{margin: '0 0 5px 0', color: '#333'}}>{contact.name}</h3>
                              <p style={{margin: '0', color: '#666', fontSize: '14px'}}>
                                연락처: {contact.contact} | 등록일: {new Date(contact.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                              <div style={{marginTop: '5px'}}>
                                <span style={{
                                  background: contact.isPublic ? '#28a745' : '#6c757d',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  marginRight: '8px'
                                }}>
                                  {contact.isPublic ? '공개' : '비공개'}
                                </span>
                                <span style={{
                                  background: contact.status === 'pending' ? '#ffc107' : 
                                           contact.status === 'processing' ? '#17a2b8' : '#28a745',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px'
                                }}>
                                  {contact.status === 'pending' ? '대기중' : 
                                   contact.status === 'processing' ? '처리중' : '완료'}
                                </span>
                              </div>
                            </div>
                            <div style={{display: 'flex', gap: '8px'}}>
                              <select
                                value={contact.status}
                                onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                                style={{padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px'}}
                              >
                                <option value="pending">대기중</option>
                                <option value="processing">처리중</option>
                                <option value="completed">완료</option>
                              </select>
                              <button
                                onClick={() => deleteContact(contact.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                          
                          <div style={{marginBottom: '15px'}}>
                            <p style={{margin: '0', color: '#333', lineHeight: '1.5'}}>{contact.content}</p>
                          </div>
                          
                          {contact.file && (
                            <div style={{marginTop: '10px'}}>
                              <strong style={{color: '#333', fontSize: '14px'}}>첨부파일: </strong>
                              <a 
                                href={`http://localhost:5003${contact.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: '#667eea', textDecoration: 'none'}}
                              >
                                {contact.fileName || '파일 다운로드'}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{textAlign: 'center', color: '#666', margin: '40px 0'}}>
                      {loading ? '문의사항을 불러오는 중...' : '등록된 문의사항이 없습니다.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {adminSection === 'companyInfo' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h2>회사정보 관리</h2>
                  <button 
                    onClick={() => setAdminSection('dashboard')}
                    style={{padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    대시보드로 돌아가기
                  </button>
                </div>
                
                <div style={{background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const updatedInfo = {
                      companyName: formData.get('companyName'),
                      ceoName: formData.get('ceoName'),
                      address: formData.get('address'),
                      businessNumber: formData.get('businessNumber'),
                      tel: formData.get('tel'),
                      mobile: formData.get('mobile'),
                      email: formData.get('email')
                    };
                    updateCompanyBasicInfo(updatedInfo);
                  }}>
                    <div style={{display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          회사명
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          defaultValue={companyBasicInfo.companyName}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          대표자명
                        </label>
                        <input
                          type="text"
                          name="ceoName"
                          defaultValue={companyBasicInfo.ceoName}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div style={{gridColumn: '1 / -1'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          주소
                        </label>
                        <input
                          type="text"
                          name="address"
                          defaultValue={companyBasicInfo.address}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          사업자등록번호
                        </label>
                        <input
                          type="text"
                          name="businessNumber"
                          defaultValue={companyBasicInfo.businessNumber}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          전화번호
                        </label>
                        <input
                          type="text"
                          name="tel"
                          defaultValue={companyBasicInfo.tel}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          휴대전화
                        </label>
                        <input
                          type="text"
                          name="mobile"
                          defaultValue={companyBasicInfo.mobile}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
                          이메일
                        </label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={companyBasicInfo.email}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{textAlign: 'center', marginTop: '30px'}}>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '12px 30px',
                          background: loading ? '#ccc' : '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.background = '#5a67d8';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading) {
                            e.target.style.background = '#667eea';
                          }
                        }}
                      >
                        {loading ? '저장 중...' : '정보 수정'}
                      </button>
                    </div>
                  </form>
                  
                  <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{margin: '0 0 15px 0', color: '#333'}}>현재 홈페이지에 표시되는 정보</h4>
                    <div style={{fontSize: '14px', lineHeight: '1.8', color: '#666'}}>
                      <div><strong>{companyBasicInfo.companyName}</strong> | 대표자 : {companyBasicInfo.ceoName} | 소재지 : {companyBasicInfo.address} | 사업자등록번호 : {companyBasicInfo.businessNumber}</div>
                      <div>TEL : {companyBasicInfo.tel} | HP : {companyBasicInfo.mobile} | E-mail : {companyBasicInfo.email}</div>
                      <div style={{marginTop: '10px', fontSize: '12px'}}>{companyBasicInfo.companyName} All Rights Reserved.</div>
                    </div>
                  </div>
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
                        src={`http://localhost:5003${image}`}
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
              <div style={{background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '16px', lineHeight: '1.8', color: '#555', marginBottom: '30px'}}>
                  {companyInfo.history?.content ? (
                    companyInfo.history.content.split('\n').map((line, index) => (
                      <p key={index} style={{margin: '0 0 15px 0'}}>{line}</p>
                    ))
                  ) : (
                    <p>회사 연혁이 등록되지 않았습니다.</p>
                  )}
                </div>
                
                {companyInfo.history?.images && companyInfo.history.images.length > 0 && (
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                    {companyInfo.history.images.map((image, index) => (
                      <img 
                        key={index}
                        src={`http://localhost:5003${image}`}
                        alt={`회사연혁 이미지 ${index + 1}`}
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
                        src={`http://localhost:5003${item.image}`} 
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
                          src={`http://localhost:5003${item.image}`} 
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
    </div>
  );
}

export default App;