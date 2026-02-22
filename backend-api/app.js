const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Cần để tạo admin mặc định

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// KHÔNG CÒN DÙNG MIDDLEWARE GIẢ LẬP USER NỮA
// Thay vào đó, API sẽ tự xác thực qua Token ở mỗi request (sẽ làm ở bước sau nếu cần bảo mật chặt chẽ hơn)
// Hiện tại ta tạm thời bỏ qua middleware auth để test luồng login trước.

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth'); // Route mới

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); // Đăng ký route auth

app.use(errorController.get404);

// --- HÀM TẠO ADMIN MẶC ĐỊNH ---
const createDefaultAdmin = () => {
    User.findByName('admin')
        .then(user => {
            if (!user) {
                console.log('Creating default admin account...');
                bcrypt.hash('123456', 12).then(hashedPassword => {
                    const admin = new User(
                        'admin', 
                        'admin@shop.com', 
                        hashedPassword, 
                        { items: [] }, 
                        null, 
                        'admin' // Role admin
                    );
                    admin.save();
                    console.log('Default admin created: admin / 123456');
                });
            }
        })
        .catch(err => console.log(err));
};

mongoConnect(() => {
  console.log('Server is running on port 5000');
  createDefaultAdmin(); // Chạy hàm tạo admin khi server start
  app.listen(5000);
});