const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 문의하기 데이터 파일 경로
const contactsFile = path.join(__dirname, '../../data/contacts.json');

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../../uploads/contacts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: function (req, file, cb) {
    // 파일 형식 제한 (이미지, 문서)
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('지원하지 않는 파일 형식입니다.');
    }
  }
});

// 문의하기 데이터 읽기
function readContacts() {
  try {
    if (fs.existsSync(contactsFile)) {
      const data = fs.readFileSync(contactsFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('문의하기 데이터 읽기 오류:', error);
    return [];
  }
}

// 문의하기 데이터 저장
function saveContacts(contacts) {
  try {
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('문의하기 데이터 저장 오류:', error);
    return false;
  }
}

// 모든 문의하기 조회 (관리자용)
router.get('/', (req, res) => {
  try {
    const contacts = readContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: '문의하기 데이터를 불러올 수 없습니다.' });
  }
});

// 문의하기 제출
router.post('/', upload.single('file'), (req, res) => {
  try {
    const { name, contact, content, isPublic } = req.body;
    
    if (!name || !contact || !content) {
      return res.status(400).json({ error: '이름, 연락처, 내용은 필수 항목입니다.' });
    }

    const contacts = readContacts();
    
    const newContact = {
      id: Date.now(),
      name,
      contact,
      content,
      isPublic: isPublic === 'true',
      file: req.file ? `/uploads/contacts/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, processing, completed
    };

    contacts.push(newContact);
    
    if (saveContacts(contacts)) {
      res.json({ 
        success: true, 
        message: '문의가 성공적으로 등록되었습니다.',
        contact: newContact 
      });
    } else {
      res.status(500).json({ error: '문의 등록 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('문의하기 등록 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 문의하기 상태 업데이트 (관리자용)
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const contacts = readContacts();
    const contactIndex = contacts.findIndex(contact => contact.id == id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    contacts[contactIndex].status = status;
    
    if (saveContacts(contacts)) {
      res.json({ 
        success: true, 
        message: '상태가 업데이트되었습니다.',
        contact: contacts[contactIndex]
      });
    } else {
      res.status(500).json({ error: '상태 업데이트 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('문의하기 상태 업데이트 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 문의하기 삭제 (관리자용)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const contacts = readContacts();
    const contactIndex = contacts.findIndex(contact => contact.id == id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    // 첨부파일 삭제
    const contact = contacts[contactIndex];
    if (contact.file) {
      const filePath = path.join(__dirname, '../../', contact.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    contacts.splice(contactIndex, 1);
    
    if (saveContacts(contacts)) {
      res.json({ success: true, message: '문의가 삭제되었습니다.' });
    } else {
      res.status(500).json({ error: '문의 삭제 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('문의하기 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;