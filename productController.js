const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const getProducts = async (req, res) => {
  const { category } = req.query;
  const where = category ? { category } : {};
  const products = await Product.findAll({ where });
  res.json(products);
};

const addProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const product = await Product.create({ name, description, price, stock, imageUrl, category });
  res.json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
  await Product.update({ name, description, price, stock, imageUrl, category }, { where: { id } });
  res.json({ msg: 'Product updated' });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.destroy({ where: { id } });
  res.json({ msg: 'Product deleted' });
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct, upload };