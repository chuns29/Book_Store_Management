const Product = require('../models/product');
const xlsx = require('xlsx');
// --- QUAN TRỌNG: Thêm dòng này để kết nối DB cho hàm thống kê ---
const getDb = require('../util/database').getDb;

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const author = req.body.author;
  const isbn = req.body.isbn;
  const genre = req.body.genre;
  const publisher = req.body.publisher;
  const stock = req.body.stock;

  const product = new Product(title, price, description, imageUrl, null, req.user._id, author, isbn, genre, publisher, stock, [], 0, 0);
  
  product.save()
    .then(result => {
      res.status(201).json({ message: 'Book created successfully!', product: result });
    })
    .catch(err => res.status(500).json({ message: 'Creating product failed.' }));
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      res.status(200).json({ product: product });
    })
    .catch(err => res.status(500).json({ message: 'Fetching product failed.' }));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  
  Product.findById(prodId)
    .then(oldProduct => {
        if (!oldProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const updatedTitle = req.body.title;
        const updatedPrice = req.body.price;
        const updatedImageUrl = req.body.imageUrl;
        const updatedDesc = req.body.description;
        const updatedAuthor = req.body.author;
        const updatedIsbn = req.body.isbn;
        const updatedGenre = req.body.genre;
        const updatedPublisher = req.body.publisher;
        const updatedStock = req.body.stock;

        const product = new Product(
            updatedTitle, updatedPrice, updatedDesc, updatedImageUrl, prodId, req.user._id,
            updatedAuthor, updatedIsbn, updatedGenre, updatedPublisher, updatedStock,
            oldProduct.reviews, oldProduct.rating, oldProduct.sold
        );
        
        return product.save();
    })
    .then(result => res.status(200).json({ message: 'Product updated successfully!' }))
    .catch(err => res.status(500).json({ message: 'Updating product failed.' }));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => res.status(200).json({ products: products }))
    .catch(err => res.status(500).json({ message: 'Fetching admin products failed.' }));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
    .then(() => res.status(200).json({ message: 'Product deleted successfully!' }))
    .catch(err => res.status(500).json({ message: 'Deleting product failed.' }));
};

exports.postImportProducts = (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet);

        if (rawData.length === 0) return res.status(400).json({ message: 'Excel file is empty.' });

        const products = rawData.map(item => {
            return {
                title: item['Title'] || 'No Title',
                price: parseFloat(item['Price']) || 0,
                description: item['Description'] || '',
                imageUrl: item['Image URL'] || 'https://via.placeholder.com/300x400?text=No+Cover',
                userId: req.user._id,
                author: item['Author'] || 'Unknown',
                isbn: item['ISBN'] ? item['ISBN'].toString() : '',
                genre: item['Genre'] || 'General',
                publisher: item['Publisher'] || '',
                stock: parseInt(item['Stock']) || 0,
                sold: 0, reviews: [], rating: 0
            };
        });

        Product.insertMany(products)
            .then(result => {
                res.status(201).json({ message: `Successfully imported ${result.insertedCount} products!`, count: result.insertedCount });
            })
            .catch(err => res.status(500).json({ message: 'Database insertion failed.' }));

    } catch (error) {
        res.status(500).json({ message: 'File processing failed.' });
    }
};

exports.getStats = async (req, res, next) => {
    const db = getDb(); 
    try {
        const orders = await db.collection('orders').find().sort({ date: -1 }).toArray();

        const topCustomers = await db.collection('orders').aggregate([
            {
                $project: {
                    user: 1,
                    totalOrderValue: {
                        $sum: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: { 
                                    $multiply: [
                                        { $toDouble: "$$item.price" }, // <--- ÉP KIỂU Ở ĐÂY
                                        { $toDouble: "$$item.quantity" } // <--- VÀ Ở ĐÂY CHO CHẮC
                                    ] 
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$user._id",
                    name: { $first: "$user.name" },
                    totalSpent: { $sum: "$totalOrderValue" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 }
        ]).toArray();

        res.status(200).json({ orders: orders, topCustomers: topCustomers });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Fetching stats failed.' });
    }
};