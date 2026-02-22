const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  // Thay thế chuỗi kết nối bên dưới bằng chuỗi kết nối MongoDB Atlas hoặc Local của bạn
  // Ví dụ: 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/shop?retryWrites=true&w=majority'
  // Hoặc local: 'mongodb://localhost:27017/shop'
  
  MongoClient.connect(
    'mongodb://localhost:27017/shop', 
    { 
      useUnifiedTopology: true, // <--- THÊM DÒNG NÀY ĐỂ SỬA CẢNH BÁO
      useNewUrlParser: true     // Thường đi kèm dòng này để xử lý chuỗi kết nối mới
    }
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;