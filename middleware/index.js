import jwt from 'jsonwebtoken';

const SECRET_KEY =  'secretkey'; // Use an environment variable for security

export const authMiddleware = (req, res, next) => {
    console.log(req.headers);  // Log all headers to debug
  
    const authHeader = req.headers['authorization'];  // Access 'authorization' in lowercase (Node.js converts header names to lowercase)
  
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).send({
        message: 'Token not provided or invalid',
        status: 401,
      });
    }
  
    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY); // Verify token
      req.user = decoded; // Attach the decoded payload to the request
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).send({
        message: 'Invalid or expired token',
        status: 401,
      });
    }
  };
  
