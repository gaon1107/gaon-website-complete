const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

const dataPath = path.join(__dirname, '../../data/company.json');

// 초기 회사 데이터
if (!fs.existsSync(dataPath)) {
  const initialData = {
    about: {
      title: "회사소개",
      content: "GAON은 얼굴인식 기술을 활용한 혁신적인 솔루션을 제공하는 기업입니다.",
      images: []
    },
    history: {
      title: "회사연혁",
      content: "2023년 12월 - GAON 설립\n2024년 3월 - AI 얼굴인식 솔루션 개발 시작\n2024년 6월 - 첫 번째 제품 출시",
      images: []
    },
    business: {
      title: "사업분야",
      items: [
        {
          name: "얼굴인식 기술",
          description: "AI 기반 얼굴인식 솔루션 개발",
          image: null
        }
      ]
    },
    achievements: {
      title: "주요실적",
      items: [
        {
          project: "AI 얼굴인식 시스템 구축",
          client: "고객사명",
          year: "2023",
          description: "주요 실적 설명",
          image: null
        }
      ]
    }
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// 모든 회사 정보 조회
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '회사 정보를 불러올 수 없습니다.' });
  }
});

// 특정 섹션 조회
router.get('/:section', (req, res) => {
  try {
    const data = readData();
    const section = req.params.section;
    
    if (!data[section]) {
      return res.status(404).json({ error: '해당 섹션을 찾을 수 없습니다.' });
    }
    
    res.json(data[section]);
  } catch (error) {
    res.status(500).json({ error: '정보를 불러올 수 없습니다.' });
  }
});

// 회사소개 업데이트
router.put('/about', upload.array('images', 5), (req, res) => {
  try {
    const data = readData();
    data.about.content = req.body.content || data.about.content;
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      data.about.images = [...(data.about.images || []), ...newImages];
    }
    
    writeData(data);
    res.json(data.about);
  } catch (error) {
    res.status(500).json({ error: '회사소개를 업데이트할 수 없습니다.' });
  }
});

// 회사연혁 업데이트
router.put('/history', upload.array('images', 5), (req, res) => {
  try {
    const data = readData();
    data.history.content = req.body.content || data.history.content;
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      data.history.images = [...(data.history.images || []), ...newImages];
    }
    
    writeData(data);
    res.json(data.history);
  } catch (error) {
    res.status(500).json({ error: '회사연혁을 업데이트할 수 없습니다.' });
  }
});

// 사업분야 업데이트
router.put('/business', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    const { action, name, description, index } = req.body;
    
    if (action === 'add') {
      const newItem = {
        name,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : null
      };
      data.business.items.push(newItem);
    } else if (action === 'edit' && index !== undefined) {
      const idx = parseInt(index);
      if (data.business.items[idx]) {
        data.business.items[idx].name = name || data.business.items[idx].name;
        data.business.items[idx].description = description || data.business.items[idx].description;
        if (req.file) {
          data.business.items[idx].image = `/uploads/${req.file.filename}`;
        }
      }
    } else if (action === 'delete' && index !== undefined) {
      const idx = parseInt(index);
      data.business.items.splice(idx, 1);
    }
    
    writeData(data);
    res.json(data.business);
  } catch (error) {
    res.status(500).json({ error: '사업분야를 업데이트할 수 없습니다.' });
  }
});

// 주요실적 업데이트
router.put('/achievements', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    const { action, project, client, year, description, index } = req.body;
    
    if (action === 'add') {
      const newItem = {
        project,
        client,
        year,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : null
      };
      data.achievements.items.push(newItem);
    } else if (action === 'edit' && index !== undefined) {
      const idx = parseInt(index);
      if (data.achievements.items[idx]) {
        data.achievements.items[idx].project = project || data.achievements.items[idx].project;
        data.achievements.items[idx].client = client || data.achievements.items[idx].client;
        data.achievements.items[idx].year = year || data.achievements.items[idx].year;
        data.achievements.items[idx].description = description || data.achievements.items[idx].description;
        if (req.file) {
          data.achievements.items[idx].image = `/uploads/${req.file.filename}`;
        }
      }
    } else if (action === 'delete' && index !== undefined) {
      const idx = parseInt(index);
      data.achievements.items.splice(idx, 1);
    }
    
    writeData(data);
    res.json(data.achievements);
  } catch (error) {
    res.status(500).json({ error: '주요실적을 업데이트할 수 없습니다.' });
  }
});

module.exports = router;