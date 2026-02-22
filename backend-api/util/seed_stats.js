const mongoConnect = require('./database').mongoConnect;
const getDb = require('./database').getDb;

console.log('Connecting to MongoDB...');

mongoConnect(async () => {
  const db = getDb();
  console.log('Connected! Starting to seed stats...');

  try {
    // 1. Lấy tất cả sản phẩm
    const products = await db.collection('products').find().toArray();
    
    if (products.length === 0) {
        console.log('No products found to update.');
        process.exit();
    }

    let count = 0;
    
    // 2. Duyệt qua từng sản phẩm và update
    for (const prod of products) {
        // Random số lượng bán từ 20 đến 300
        const randomSold = Math.floor(Math.random() * 280) + 20;
        
        // Random số sao từ 3.8 đến 5.0 (làm tròn 1 số thập phân)
        const randomRating = (Math.random() * (5 - 3.8) + 3.8).toFixed(1);

        // Lưu ý: Ta chỉ update sold và rating để hiển thị cho đẹp. 
        // Reviews thực tế (mảng comments) vẫn giữ nguyên hoặc rỗng.
        await db.collection('products').updateOne(
            { _id: prod._id },
            { 
                $set: { 
                    sold: randomSold, 
                    rating: parseFloat(randomRating) 
                } 
            }
        );
        
        count++;
        // In ra tiến độ cho vui mắt
        // console.log(`Updated: ${prod.title} -> Sold: ${randomSold}, Rating: ${randomRating}`);
    }

    console.log(`✅ SUCCESS: Updated stats for ${count} products!`);
    
  } catch (err) {
      console.log('❌ Error:', err);
  }
  
  // Tắt script sau khi xong
  console.log('Done. Exiting...');
  process.exit();
});