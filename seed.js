const sequelize = require('./config/db');
const Product = require('./models/Product');

const seed = async () => {
  await sequelize.sync({ force: true });  // Warning: Drops tables! Use only once.
  const categories = ['jewellery', 'clothes', 'shoes', 'makeup'];
  for (let cat of categories) {
    for (let i = 1; i <= 10; i++) {
      await Product.create({
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Item ${i}`,
        description: `Description for ${cat} item ${i}`,
        price: Math.floor(Math.random() * 1000) + 100,
        stock: 10,
        imageUrl: 'https://via.placeholder.com/300',
        category: cat,
      });
    }
  }
  console.log('Seeded 40 products');
  process.exit();
};

seed();