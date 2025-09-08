const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/notices.json');

// 초기 데이터가 없으면 생성
if (!fs.existsSync(dataPath)) {
  const initialData = {
    notices: [
      {
        id: 1,
        title: "GAON 홈페이지 오픈",
        content: "안녕하세요. GAON 홈페이지가 새롭게 오픈했습니다.",
        author: "관리자",
        date: new Date().toISOString(),
        views: 0,
        category: "공지"
      }
    ],
    nextId: 2
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

// 데이터 읽기/쓰기
const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// 모든 공지사항 조회
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.notices.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ error: '공지사항을 불러올 수 없습니다.' });
  }
});

// 공지사항 생성
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newNotice = {
      id: data.nextId,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || '관리자',
      date: new Date().toISOString(),
      views: 0,
      category: req.body.category || '일반'
    };
    
    data.notices.push(newNotice);
    data.nextId += 1;
    writeData(data);
    
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(500).json({ error: '공지사항을 생성할 수 없습니다.' });
  }
});

module.exports = router;