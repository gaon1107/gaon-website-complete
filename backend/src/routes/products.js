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

router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: '제품을 불러올 수 없습니다.' });
  }
});

module.exports = router;