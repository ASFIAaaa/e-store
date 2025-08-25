const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const Message = require('./models/Message');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',  // Frontend URL
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));  // Serve uploaded images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO for chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChat', (userId) => {
    socket.join(userId);  // Join room based on userId
  });

  socket.on('sendMessage', async ({ senderId, receiverId, body }) => {
    try {
      const message = await Message.create({ senderId, receiverId, body });
      io.to(receiverId).emit('receiveMessage', message);

      // Auto-reply if receiver is admin and message from buyer
      const receiver = await User.findByPk(receiverId);
      if (receiver.role === 'admin' && senderId !== receiverId) {
        const autoReply = 'Please wait a moment, we will reach out to you soon.';
        const replyMessage = await Message.create({ senderId: receiverId, receiverId: senderId, body: autoReply });
        io.to(senderId).emit('receiveMessage', replyMessage);
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Sync DB and start server
sequelize.sync({ alter: true }).then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch(err => console.error('DB Sync Error:', err));