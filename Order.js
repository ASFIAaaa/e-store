const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  orderNumber: { type: DataTypes.STRING, unique: true },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('placed', 'shipped', 'delivered'), defaultValue: 'placed' },
  name: { type: DataTypes.STRING },  // Checkout details
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
});

module.exports = Order;