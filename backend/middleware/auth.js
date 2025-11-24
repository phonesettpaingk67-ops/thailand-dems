// Simple authentication middleware for protecting admin routes
// In production, this should verify JWT tokens or session cookies

const requireAdmin = (req, res, next) => {
  // Check for admin authorization
  // For now, we'll accept requests from localhost frontend
  // In production, implement proper JWT verification
  
  const authHeader = req.headers.authorization;
  
  // Skip auth check for development - trust the frontend
  // In production, verify JWT: const token = authHeader?.split(' ')[1];
  // Then verify token and check role === 'admin'
  
  if (process.env.NODE_ENV === 'production') {
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - Admin access required' });
    }
    
    // TODO: Implement JWT verification in production
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (decoded.role !== 'admin') {
    //   return res.status(403).json({ error: 'Forbidden - Admin access required' });
    // }
  }
  
  next();
};

const requireAuth = (req, res, next) => {
  // Check for any authenticated user
  // In production, verify JWT token exists and is valid
  
  const authHeader = req.headers.authorization;
  
  if (process.env.NODE_ENV === 'production') {
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - Login required' });
    }
    
    // TODO: Implement JWT verification in production
    // const token = authHeader?.split(' ')[1];
    // jwt.verify(token, process.env.JWT_SECRET);
  }
  
  next();
};

module.exports = {
  requireAdmin,
  requireAuth
};
