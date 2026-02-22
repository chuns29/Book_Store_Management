const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, password, cart, id, role) {
    this.name = username;
    this.email = email;
    this.password = password;
    this.cart = cart || { items: [] };
    this._id = id ? new ObjectId(id) : null;
    this.role = role || 'user';
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  hasPurchasedProduct(prodId) {
    const db = getDb();
    return db.collection('orders')
      .findOne({
        'user._id': new ObjectId(this._id),
        'items.productId': new ObjectId(prodId)
      })
      .then(order => {
          return order !== null;
      });
  }

  static findByName(username) {
    const db = getDb();
    return db.collection('users').findOne({ name: username });
  }

  addToCart(product, quantity = 1) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    const addedQuantity = parseInt(quantity);
    let newQuantity = addedQuantity;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      const currentQuantity = parseInt(this.cart.items[cartProductIndex].quantity);
      newQuantity = currentQuantity + addedQuantity;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity
      });
    }
    const updatedCart = { items: updatedCartItems };
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  updateCartItemQuantity(productId, quantity) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString();
    });
    if (cartProductIndex < 0) return Promise.resolve();
    const updatedCartItems = [...this.cart.items];
    if (quantity <= 0) {
        updatedCartItems.splice(cartProductIndex, 1);
    } else {
        updatedCartItems[cartProductIndex].quantity = parseInt(quantity);
    }
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => i.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  deleteItemsFromCart(productIdsArray) {
    const updatedCartItems = this.cart.items.filter(item => {
      return !productIdsArray.includes(item.productId.toString());
    });
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder(selectedProductIds) {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const orderItems = products.filter(p => selectedProductIds.includes(p._id.toString()));
        if (orderItems.length === 0) return;

        const outOfStockItems = [];
        orderItems.forEach(item => {
            if (item.quantity > item.stock) {
                outOfStockItems.push(`${item.title} (Stock: ${item.stock})`);
            }
        });

        if (outOfStockItems.length > 0) {
            const error = new Error(`Insufficient stock for: ${outOfStockItems.join(', ')}`);
            error.statusCode = 409;
            throw error; 
        }

        const order = {
          items: orderItems,
          user: {
            _id: new ObjectId(this._id),
            name: this.name
          },
          date: new Date()
        };

        const bulkUpdateOps = orderItems.map(item => {
            return {
                updateOne: {
                    filter: { _id: new ObjectId(item._id) },
                    // TRỪ Stock và CỘNG Sold
                    update: { 
                        $inc: { 
                            stock: -item.quantity,
                            sold: item.quantity 
                        } 
                    }
                }
            };
        });

        return db.collection('products').bulkWrite(bulkUpdateOps)
            .then(() => {
                return db.collection('orders').insertOne(order);
            });
      })
      .then(result => {
        const remainingCartItems = this.cart.items.filter(item => {
            return !selectedProductIds.includes(item.productId.toString());
        });
        this.cart = { items: remainingCartItems };
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: remainingCartItems } } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .sort({ date: -1 })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then(user => {
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;