const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const search = req.query.search;
  const genre = req.query.genre;
  const sortBy = req.query.sort; // Lấy tham số sort từ URL (ví dụ: ?sort=price_asc)

  Product.fetchAll(search, genre, sortBy) // Truyền thêm sortBy
    .then(products => {
      res.status(200).json({ products: products });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Fetching products failed' });
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
         return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ product: product });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Fetching product detail failed' });
    });
};

exports.getIndex = (req, res, next) => {
  // Trang chủ cũng có thể áp dụng sort nếu muốn
  const search = req.query.search;
  const genre = req.query.genre;
  const sortBy = req.query.sort;

  Product.fetchAll(search, genre, sortBy)
    .then(products => {
      res.status(200).json({ products: products });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Fetching shop index failed' });
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
      res.status(200).json({ products: products });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Fetching cart failed' });
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let quantity = req.body.quantity;
  if (!quantity) {
      quantity = 1;
  } else {
      quantity = parseInt(quantity);
  }

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product, quantity);
    })
    .then(result => {
      res.status(200).json({ message: 'Added to cart successfully', result: result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Adding to cart failed' });
    });
};

exports.postCartUpdateQuantity = (req, res, next) => {
    const prodId = req.body.productId;
    const quantity = parseInt(req.body.quantity);

    req.user.updateCartItemQuantity(prodId, quantity)
        .then(result => {
            res.status(200).json({ message: 'Cart quantity updated' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Update failed' });
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.status(200).json({ message: 'Deleted from cart successfully' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Deleting from cart failed' });
    });
};

exports.postCartDeleteItems = (req, res, next) => {
  const productIds = req.body.productIds; 
  if (!productIds || productIds.length === 0) {
      return res.status(400).json({ message: 'No products selected to delete' });
  }
  req.user
    .deleteItemsFromCart(productIds)
    .then(result => {
      res.status(200).json({ message: 'Selected items deleted successfully' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Deleting items failed' });
    });
};

exports.postOrder = (req, res, next) => {
  const productIds = req.body.productIds; 
  if (!productIds || productIds.length === 0) {
      return res.status(400).json({ message: 'No products selected' });
  }
  req.user
    .addOrder(productIds)
    .then(result => {
      res.status(201).json({ message: 'Order placed successfully' });
    })
    .catch(err => {
      console.log('Order Error:', err.message);
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ message: err.message || 'Ordering failed' });
    });
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();
    for (let order of orders) {
        for (let item of order.items) {
            const product = await Product.findById(item._id);
            let hasReviewed = false;
            if (product && product.reviews) {
                hasReviewed = product.reviews.some(r => r.userId.toString() === req.user._id.toString());
            }
            item.hasReviewed = hasReviewed;
        }
    }
    res.status(200).json({ orders: orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Fetching orders failed' });
  }
};

exports.postAddReview = (req, res, next) => {
    const prodId = req.body.productId;
    const rating = parseInt(req.body.rating);
    const comment = req.body.comment;
    
    Product.findById(prodId)
        .then(productData => {
            if (!productData) {
                return res.status(404).json({ message: 'Product not found.' });
            }

            const existingReview = productData.reviews && productData.reviews.find(
                r => r.userId.toString() === req.user._id.toString()
            );

            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this product.' });
            }

            const product = new Product(
                productData.title,
                productData.price,
                productData.description,
                productData.imageUrl,
                productData._id,
                productData.userId,
                productData.author,
                productData.isbn,
                productData.genre,
                productData.publisher,
                productData.stock,
                productData.reviews, 
                productData.rating,
                productData.sold
            );

            const reviewData = {
                userId: req.user._id,
                username: req.user.name,
                rating: rating,
                comment: comment,
                date: new Date()
            };

            return product.addReview(reviewData);
        })
        .then(result => {
            res.status(201).json({ message: 'Review added successfully!' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Adding review failed.' });
        });
};