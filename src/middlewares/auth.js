import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  /^\/api\/public\/.*/, // regex for prefix-based skipping
  '/username-available', 
];

const isPublicRoute = (url) => {
  return publicRoutes.some((route) =>
    typeof route === 'string' ? url.includes(route) : route.test(url)
  );
};

const auth = async (req, res, next) => {
  if (isPublicRoute(req.path)) return next(); // Skip auth for public routes

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.sendError("You're not authorized to access this resource.", 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    req.userId = decoded.id;

    next();
  } catch (err) {
    res.sendError("Token is not valid", 401);
  }
};

export default auth;
