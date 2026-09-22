const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

// Khởi tạo file categories mặc định nếu chưa tồn tại
if (!fs.existsSync(CATEGORIES_FILE)) {
    const defaultCategories = [
        { id: 'main_gioithieu', name: 'Giới Thiệu Hướng Dẫn', isHidden: false },
        { id: 'Slot_nohu', name: 'Test Game - Chạy Cược', isHidden: false },
        { id: 'Bo_don', name: 'Hướng Dẫn Duyệt Đơn', isHidden: false },
        { id: 'Bo_main', name: 'Hướng Dẫn Sử Dụng Bo', isHidden: false },
        { id: 'main_casino', name: 'Casino Trực Tuyến', isHidden: false },
        { id: 'main_xoso', name: 'Xổ Số Online', isHidden: false },
        { id: 'main_thethao', name: 'Thể Thao', isHidden: false },
        { id: 'main_daga', name: 'Đá Gà', isHidden: false },
        { id: 'duyedon_main', name: 'Lưu Trình Duyệt Đơn', isHidden: false },
        { id: 'xulyld_main', name: 'Xử Lý Hội Viên Gian Lận', isHidden: false },
        { id: 'main', name: 'Liên Hệ Hỗ Trợ - Hướng Dẫn', isHidden: false }
    ];
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2), 'utf8');
}

function getCategories() {
    try {
        return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveCategories(data) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 1. Lấy danh sách danh mục
app.get('/api/categories', (req, res) => {
    res.json(getCategories());
});

// 2. Thêm danh mục mới
app.post('/api/categories', (req, res) => {
    const categories = getCategories();
    const newCat = req.body;
    categories.push(newCat);
    saveCategories(categories);
    res.json({ success: true, categories });
});

// 3. Sửa danh mục (Đồng bộ đổi tên cả Web Client & Backend)
app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let categories = getCategories();
    
    const cat = categories.find(c => c.id === id);
    if (cat) {
        cat.name = name;
        saveCategories(categories);
        return res.json({ success: true, categories });
    }
    res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
});

// 4. Ẩn / Hiện danh mục (Sẽ ẩn ngay trên Client người dùng)
app.patch('/api/categories/:id/toggle-hide', (req, res) => {
    const { id } = req.params;
    let categories = getCategories();
    
    const cat = categories.find(c => c.id === id);
    if (cat) {
        cat.isHidden = !cat.isHidden;
        saveCategories(categories);
        return res.json({ success: true, isHidden: cat.isHidden });
    }
    res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
});

// 5. Xóa danh mục (Xóa triệt để trên cả 2 trang Web)
app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    let categories = getCategories();
    categories = categories.filter(c => c.id !== id);
    saveCategories(categories);
    res.json({ success: true, categories });
});

app.listen(3000, () => console.log('Server đang chạy tại port 3000'));