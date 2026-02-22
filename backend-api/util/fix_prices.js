const mongoConnect = require('./database').mongoConnect;
const getDb = require('./database').getDb;

mongoConnect(async () => {
  const db = getDb();
  console.log('Fixing price types...');

  const products = await db.collection('products').find().toArray();
  
  for (const prod of products) {
      // Nếu giá đang là string, chuyển sang float
      if (typeof prod.price === 'string') {
          await db.collection('products').updateOne(
              { _id: prod._id },
              { $set: { price: parseFloat(prod.price) } }
          );
          console.log(`Updated product ${prod.title}: ${prod.price} -> Number`);
      }
  }
  
  console.log('Done!');
  process.exit();
});
