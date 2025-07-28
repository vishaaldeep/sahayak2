const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { requireAuth, authorizeRoles }; 