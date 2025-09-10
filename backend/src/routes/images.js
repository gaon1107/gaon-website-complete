const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dataPath = path.join(__dirname, '../../data/images.json');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 초기 이미지 데이터 생성
if (!fs.existsSync(dataPath)) {
  const initialData = {
    bannerImage: null,
    bannerImages: [],
    images: []
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// 배너 이미지 조회 (단일)
router.get('/banner', (req, res) => {
  try {
    const data = readData();
    res.json({ bannerImage: data.bannerImage });
  } catch (error) {
    res.status(500).json({ error: '배너 이미지를 불러올 수 없습니다.' });
  }
});

// 모든 배너 이미지 조회
router.get('/banners', (req, res) => {
  try {
    const data = readData();
    if (!data.bannerImages) {
      data.bannerImages = [];
      writeData(data); // 필드가 없으면 추가하고 저장
    }
    res.json({ bannerImages: data.bannerImages });
  } catch (error) {
    res.status(500).json({ error: '배너 이미지들을 불러올 수 없습니다.' });
  }
});

// 이미지 업로드 (배너 설정 옵션 포함)
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const imageData = {
      id: Date.now(),
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      uploadDate: new Date().toISOString(),
      type: req.body.type || 'general' // 'banner' 또는 'general'
    };

    const data = readData();
    data.images.push(imageData);

    // 배너 이미지로 설정하는 경우
    if (req.body.type === 'banner') {
      data.bannerImage = imageData;
    }

    writeData(data);

    res.json({
      success: true,
      image: imageData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 배너 이미지 설정 (단일)
router.put('/banner/:imageId', (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    const data = readData();
    
    const image = data.images.find(img => img.id === imageId);
    if (!image) {
      return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }

    data.bannerImage = image;
    writeData(data);

    res.json({ success: true, bannerImage: image });
  } catch (error) {
    res.status(500).json({ error: '배너 이미지를 설정할 수 없습니다.' });
  }
});

// 배너 이미지 목록에 추가/제거 토글
router.put('/banner-toggle/:imageId', (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    const data = readData();
    
    if (!data.bannerImages) {
      data.bannerImages = [];
    }
    
    const image = data.images.find(img => img.id === imageId);
    if (!image) {
      return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }

    const existingIndex = data.bannerImages.findIndex(banner => banner.id === imageId);
    
    if (existingIndex > -1) {
      // 배너 목록에서 제거
      data.bannerImages.splice(existingIndex, 1);
    } else {
      // 배너 목록에 추가
      data.bannerImages.push(image);
    }

    writeData(data);

    res.json({ 
      success: true, 
      bannerImages: data.bannerImages,
      isInBanner: existingIndex === -1 
    });
  } catch (error) {
    res.status(500).json({ error: '배너 이미지를 토글할 수 없습니다.' });
  }
});

// 모든 이미지 조회
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.images);
  } catch (error) {
    res.status(500).json({ error: '이미지를 불러올 수 없습니다.' });
  }
});

module.exports = router;