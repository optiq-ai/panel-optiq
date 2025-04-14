import { Request, Response } from 'express';
import pool from '../config/database';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const usersResult = await pool.query(
      'SELECT u.id, u.username, u.email, u.first_name, u.last_name, array_agg(g.name) as groups ' +
      'FROM users u ' +
      'LEFT JOIN user_groups ug ON u.id = ug.user_id ' +
      'LEFT JOIN groups g ON ug.group_id = g.id ' +
      'GROUP BY u.id'
    );

    res.status(200).json({
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      'SELECT u.id, u.username, u.email, u.first_name, u.last_name, array_agg(g.name) as groups ' +
      'FROM users u ' +
      'LEFT JOIN user_groups ug ON u.id = ug.user_id ' +
      'LEFT JOIN groups g ON ug.group_id = g.id ' +
      'WHERE u.id = $1 ' +
      'GROUP BY u.id',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.status(200).json({
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name, groups } = req.body;

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Użytkownik już istnieje' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Begin transaction
    await pool.query('BEGIN');

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
      [username, hashedPassword, email, first_name, last_name]
    );

    const userId = newUser.rows[0].id;

    // Add user to groups if provided
    if (groups && groups.length > 0) {
      for (const groupName of groups) {
        // Get group ID
        const groupResult = await pool.query(
          'SELECT id FROM groups WHERE name = $1',
          [groupName]
        );

        if (groupResult.rows.length > 0) {
          const groupId = groupResult.rows[0].id;
          
          // Add user to group
          await pool.query(
            'INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)',
            [userId, groupId]
          );
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Użytkownik został utworzony pomyślnie',
      user: newUser.rows[0]
    });
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error in createUser:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, password, groups } = req.body;

    // Begin transaction
    await pool.query('BEGIN');

    // Update user basic info
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let valueIndex = 1;

    if (username) {
      updateQuery += `username = $${valueIndex}, `;
      updateValues.push(username);
      valueIndex++;
    }

    if (email) {
      updateQuery += `email = $${valueIndex}, `;
      updateValues.push(email);
      valueIndex++;
    }

    if (first_name) {
      updateQuery += `first_name = $${valueIndex}, `;
      updateValues.push(first_name);
      valueIndex++;
    }

    if (last_name) {
      updateQuery += `last_name = $${valueIndex}, `;
      updateValues.push(last_name);
      valueIndex++;
    }

    if (password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += `password_hash = $${valueIndex}, `;
      updateValues.push(hashedPassword);
      valueIndex++;
    }

    // Add updated_at timestamp
    updateQuery += `updated_at = NOW() WHERE id = $${valueIndex} RETURNING id, username, email, first_name, last_name`;
    updateValues.push(id);

    const updatedUser = await pool.query(updateQuery, updateValues);

    if (updatedUser.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    // Update user groups if provided
    if (groups && groups.length > 0) {
      // Remove existing group associations
      await pool.query('DELETE FROM user_groups WHERE user_id = $1', [id]);

      // Add new group associations
      for (const groupName of groups) {
        // Get group ID
        const groupResult = await pool.query(
          'SELECT id FROM groups WHERE name = $1',
          [groupName]
        );

        if (groupResult.rows.length > 0) {
          const groupId = groupResult.rows[0].id;
          
          // Add user to group
          await pool.query(
            'INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)',
            [id, groupId]
          );
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({
      message: 'Użytkownik został zaktualizowany pomyślnie',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({
      message: 'Użytkownik został usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
