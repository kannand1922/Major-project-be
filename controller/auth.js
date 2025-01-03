import bcrypt from 'bcryptjs';
import dbConnect from '../config/db.js';
import { checkUserByEmail, insertUser } from '../queries/auth.js';

import jwt from 'jsonwebtoken';

const SECRET_KEY = 'secretkey'; 

export async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    const connection = await dbConnect();

    // Check if email is already in use
    const [existingUser] = await connection.execute(checkUserByEmail(email));
    if (existingUser.length > 0) {
      return res.status(400).send({
        message: 'Email already in use',
        status: 400,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await connection.execute(
      insertUser(name, email, hashedPassword, '1')
    );

    const userId = result.insertId; // Get the inserted ID

    // Generate a token
    const token = jwt.sign(
      { id: userId, email, role: '1' }, // Payload
      SECRET_KEY, // Secret key
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Send response
    res.status(201).send({
      message: 'User registered successfully',
      status: 201,
      user: {
        id: userId,
        name: name,
        email: email,
        role: '1',
      },
      token, // Include token in response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      message: 'Internal server error',
      status: 500,
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const connection = await dbConnect();

    // Find user by email
    const [user] = await connection.execute(checkUserByEmail(email));
    if (user.length === 0) {
      return res.status(400).send({
        message: 'Invalid email or password',
        status: 400,
      });
    }

    const userData = user[0];

    // Compare the password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).send({
        message: 'Invalid email or password',
        status: 400,
      });
    }

    // Send response
    res.status(200).send({
      message: 'Login successful',
      status: 200,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      message: 'Internal server error',
      status: 500,
    });
  }
}
