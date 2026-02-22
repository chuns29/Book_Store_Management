const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  // Lấy token từ header "Authorization: Bearer <token>"
  const authHeader = req.get('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  
  const token = authHeader.split(' ')[1]; // Lấy phần token sau chữ 'Bearer '
  let decodedToken;
  
  try {
    // Giải mã token (Key phải khớp với key lúc tạo trong auth controller)
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    return res.status(500).json({ message: 'Token verification failed.' });
  }
  
  if (!decodedToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  
  // Tìm User trong DB dựa trên ID trong token
  User.findById(decodedToken.userId)
    .then(user => {
        if(!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // QUAN TRỌNG: Tạo instance User để có các hàm addToCart, addOrder...
        req.user = new User(user.name, user.email, user.password, user.cart, user._id, user.role);
        next();
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Server error accessing user.' });
    });
};