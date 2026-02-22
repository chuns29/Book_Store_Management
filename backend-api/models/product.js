const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId, author, isbn, genre, publisher, stock, reviews, rating, sold) {
    this.title = title;
    this.price = parseFloat(price);
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
    this.author = author || 'Unknown';
    this.isbn = isbn || '';
    this.genre = genre || 'General';
    this.publisher = publisher || '';
    this.stock = stock ? parseInt(stock) : 0;
    this.reviews = reviews || []; 
    this.rating = rating || 0;
    this.sold = sold ? parseInt(sold) : 0;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      const updateData = { ...this };
      delete updateData._id;
      dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: updateData });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp.then(result => console.log(result)).catch(err => console.log(err));
  }

  addReview(reviewData) {
      const db = getDb();
      const updatedReviews = [...this.reviews, reviewData];
      const totalStars = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = (totalStars / updatedReviews.length).toFixed(1); 

      this.reviews = updatedReviews;
      this.rating = parseFloat(averageRating);

      return db.collection('products').updateOne(
          { _id: this._id },
          { $set: { reviews: updatedReviews, rating: parseFloat(averageRating) } }
      );
  }

  static insertMany(products) {
    const db = getDb();
    return db.collection('products').insertMany(products);
  }

  // --- SỬA HÀM NÀY: Thêm tham số sortBy ---
  static fetchAll(searchKeyword, genre, sortBy) {
    const db = getDb();
    let filter = {};
    
    // 1. Lọc
    if (searchKeyword) {
        filter.$or = [
            { title: { $regex: searchKeyword, $options: 'i' } },
            { author: { $regex: searchKeyword, $options: 'i' } }
        ];
    }

    if (genre && genre !== 'All') {
        filter.genre = genre;
    }

    // 2. Sắp xếp
    let sortOption = { _id: -1 }; // Mặc định là mới nhất (ID giảm dần)

    if (sortBy === 'sold') {
        sortOption = { sold: -1 }; // Bán chạy nhất
    } else if (sortBy === 'rating') {
        sortOption = { rating: -1 }; // Đánh giá cao nhất
    } else if (sortBy === 'price_asc') {
        sortOption = { price: 1 }; // Giá thấp đến cao
    } else if (sortBy === 'price_desc') {
        sortOption = { price: -1 }; // Giá cao đến thấp
    }

    return db.collection('products')
        .find(filter)
        .sort(sortOption) // Áp dụng sắp xếp
        .toArray();
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) }).next();
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) });
  }
}

module.exports = Product;