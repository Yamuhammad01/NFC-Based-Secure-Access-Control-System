const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Access denied. User not authenticated." });
    }
    
    const hasRole = allowedRoles.includes(req.user.role.toLowerCase());
    if (!hasRole) {
      return res.status(403).json({ message: "Access denied. You do not have permission to perform this action." });
    }
    
    next();
  };
};

module.exports = authorize;
