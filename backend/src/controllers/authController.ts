import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Użytkownik już istnieje' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
      [username, hashedPassword, email, first_name, last_name]
    );

    // Add user to default group if needed
    // This can be modified based on business logic
    
    res.status(201).json({
      message: 'Użytkownik został zarejestrowany pomyślnie',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT u.*, array_agg(g.name) as groups FROM users u LEFT JOIN user_groups ug ON u.id = ug.user_id LEFT JOIN groups g ON ug.group_id = g.id WHERE u.username = $1 GROUP BY u.id',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    const user = userResult.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        groups: user.groups
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        groups: user.groups
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User ID is available from auth middleware
    const userId = (req as any).user.id;

    const userResult = await pool.query(
      'SELECT u.id, u.username, u.email, u.first_name, u.last_name, array_agg(g.name) as groups FROM users u LEFT JOIN user_groups ug ON u.id = ug.user_id LEFT JOIN groups g ON ug.group_id = g.id WHERE u.id = $1 GROUP BY u.id',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.status(200).json({
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
