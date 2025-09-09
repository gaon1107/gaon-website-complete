const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/products.json');

// 초기 데이터
if (!fs.existsSync(dataPath)) {
  const initialData = {
    products: [
      {
        id: 1,
        code: "GF-KIDS",
        name: "어린이 안전 솔루션",
        category: "안전관리",
        description: "어린이집, 유치원을 위한 얼굴인식 출입 관리 시스템",
        features: ["실시간 출입 알림", "학부모 앱 연동", "안전 구역 설정"],
        status: "active"
      },
      {
        id: 2,
        code: "GF-KIOSK",
        name: "무인 키오스크",
        category: "무인시스템",
        description: "얼굴인식 기반 무인 주문 및 결제 시스템",
        features: ["비접촉 주문", "회원 자동 인식", "맞춤 메뉴 추천"],
        status: "active"
      }
    ],
    nextId: 3
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: '제품을 불러올 수 없습니다.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    if (!name || !category || !description) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const data = readData();
    const newProduct = {
      id: data.nextId,
      name,
      category,
      description,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    data.products.push(newProduct);
    data.nextId++;
    
    writeData(data);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('제품 추가 오류:', error);
    res.status(500).json({ error: '제품을 추가할 수 없습니다.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const data = readData();
    
    const productIndex = data.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
    }

    data.products.splice(productIndex, 1);
    writeData(data);
    
    res.json({ message: '제품이 삭제되었습니다.' });
  } catch (error) {
    console.error('제품 삭제 오류:', error);
    res.status(500).json({ error: '제품을 삭제할 수 없습니다.' });
  }
});

module.exports = router;