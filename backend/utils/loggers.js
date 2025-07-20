const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

exports.logNotification = async (userId, message, type = 'info') => {
  await Notification.create({ user: userId, message, type });
};

// exports.logTransaction = async (userId, type, description, amount, balanceAfter) => {
//   await Transaction.create({ user: userId, type, description, amount, balanceAfter });
// };
exports.logTransaction = async (userId, type, referenceId, amount, balanceAfter, description = '') => {
  await Transaction.create({
    user: userId,
    type,
    referenceId,
    amount,
    balanceAfter,
    description
  });
};