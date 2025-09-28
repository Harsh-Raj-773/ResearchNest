const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to protect routes by verifying JWT
exports.verifyToken = async (req, res, next) => {
  let token;

  // 1) Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'You are not logged in. Please log in to get access.' });
  }

  try {
    // 2) Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
    }

    // 4) Grant access to the protected route by attaching user to the request
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
  }
};

// Middleware to authorize based on user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};