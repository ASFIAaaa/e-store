const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');

const createOrder = async (req, res) => {
  const { items, total, name, phone, address } = req.body;
  const orderNumber = 'ORD-' + Date.now();
  const order = await Order.create({ userId: req.user.id, orderNumber, total, name, phone, address });

  for (let item of items) {
    await OrderItem.create({ orderId: order.id, productId: item.id, quantity: item.quantity, price: item.price });
    await Product.update({ stock: sequelize.literal(`stock - ${item.quantity}`) }, { where: { id: item.id } });
  }

  // Generate PDF
  const doc = new pdfkit();
  const pdfPath = path.join(__dirname, '../uploads', `${orderNumber}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(25).text('E-Store Receipt');
  doc.text(`Order Number: ${orderNumber}`);
  doc.text(`Total: ${total} Tk.`);
  doc.end();

  res.json({ order, pdfUrl: `/uploads/${orderNumber}.pdf` });
};

const getOrders = async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.user.id }, include: [OrderItem] });
  res.json(orders);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.findAll({ include: [{ model: User }, { model: OrderItem, include: Product }] });
  res.json(orders);
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Order.update({ status }, { where: { id } });
  res.json({ msg: 'Status updated' });
};

const trackOrder = async (req, res) => {
  const { orderNumber } = req.params;
  const order = await Order.findOne({ where: { orderNumber }, include: [OrderItem] });
  if (!order) return res.status(404).json({ msg: 'Order not found' });
  res.json(order);
};

module.exports = { createOrder, getOrders, getAllOrders, updateStatus, trackOrder };