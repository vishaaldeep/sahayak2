const jwt = require('jsonwebtoken');
const User = require('../Model/User');

// Middleware to verify JWT token and extract user info
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is an employer
const requireEmployer = (req, res, next) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Access denied. Employer role required.' });
  }
  next();
};

// Middleware to check if user is a seeker
const requireSeeker = (req, res, next) => {
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ message: 'Access denied. Seeker role required.' });
  }
  next();
};

// Middleware to check if user owns the resource (for employers)
const requireResourceOwnership = (paramName = 'employerId') => {
  return (req, res, next) => {
    const resourceOwnerId = req.params[paramName];
    
    if (req.user.role === 'provider' && req.user._id.toString() !== resourceOwnerId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.',
        requested: resourceOwnerId,
        authenticated: req.user._id.toString()
      });
    }
    
    next();
  };
};

// Middleware to validate employer access to job applications
const validateEmployerJobAccess = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    
    // Check if the authenticated user is the employer requesting the data
    if (req.user._id.toString() !== employerId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view applications for your own jobs.',
        requestedEmployer: employerId,
        authenticatedUser: req.user._id.toString()
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error validating access', error: error.message });
  }
};

module.exports = {
  authenticateToken,
  requireEmployer,
  requireSeeker,
  requireResourceOwnership,
  validateEmployerJobAccess
};