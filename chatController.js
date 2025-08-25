const Message = require('../models/Message');

const getMessages = async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.findAll({
    where: {
      [sequelize.Op.or]: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    },
    order: [['createdAt', 'ASC']],
  });
  res.json(messages);
};

module.exports = { getMessages };