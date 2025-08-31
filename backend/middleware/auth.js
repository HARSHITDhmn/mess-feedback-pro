const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if(!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.admin = decoded.admin;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token invalid' });
  }
};
