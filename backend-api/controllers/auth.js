const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username; // Dùng username để đăng nhập

  // 1. Kiểm tra xem user đã tồn tại chưa
  User.findByName(username)
    .then(userDoc => {
      if (userDoc) {
        return res.status(409).json({ message: 'Username already exists!' });
      }
      
      // 2. Mã hóa mật khẩu
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          // 3. Tạo user mới (Mặc định role là 'user')
          const user = new User(username, email, hashedPassword, { items: [] }, null, 'user');
          return user.save();
        })
        .then(result => {
          res.status(201).json({ message: 'User created!' });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Signup failed.' });
    });
};

exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;

  User.findByName(username)
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
      loadedUser = user;
      // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
      return bcrypt.compare(password, user.password);
    })
    .then(doMatch => {
      if (!doMatch) {
        return res.status(401).json({ message: 'Wrong password!' });
      }
      
      // Tạo JWT Token (Chứa userId và role)
      const token = jwt.sign(
        { 
            userId: loadedUser._id.toString(), 
            role: loadedUser.role 
        },
        'somesupersecretsecret', // Secret key (trong thực tế nên để biến môi trường)
        { expiresIn: '1h' }
      );

      res.status(200).json({ 
          token: token, 
          userId: loadedUser._id.toString(),
          role: loadedUser.role,
          message: 'Login successful' 
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Login failed.' });
    });
};