const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// CORS 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 데이터 폴더 생성
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 임시 관리자 계정
const ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// 로그인 API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN.username && password === ADMIN.password) {
    res.json({
      success: true,
      token: 'fake-jwt-token',
      user: { username: ADMIN.username }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 잘못되었습니다.'
    });
  }
});

// 라우트 파일들
try {
  const noticeRoutes = require('./routes/notices');
  const productRoutes = require('./routes/products');
  const imageRoutes = require('./routes/images');
  app.use('/api/notices', noticeRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/images', imageRoutes);
} catch(e) {
  console.log('라우트 파일 로딩 중 오류 (정상)');
}

// 기본 라우트
app.get('/api', (req, res) => {
  res.json({ 
    message: 'GAON API Server',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});