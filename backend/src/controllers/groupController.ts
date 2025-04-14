import { Request, Response } from 'express';
import pool from '../config/database';

// Get all groups
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groupsResult = await pool.query(
      'SELECT * FROM groups ORDER BY name'
    );

    res.status(200).json({
      groups: groupsResult.rows
    });
  } catch (error) {
    console.error('Error in getAllGroups:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get group by ID
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE id = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Grupa nie znaleziona' });
    }

    // Get users in this group
    const usersResult = await pool.query(
      'SELECT u.id, u.username, u.email, u.first_name, u.last_name ' +
      'FROM users u ' +
      'JOIN user_groups ug ON u.id = ug.user_id ' +
      'WHERE ug.group_id = $1',
      [id]
    );

    // Get panels assigned to this group
    const panelsResult = await pool.query(
      'SELECT p.id, p.name, p.description, p.icon, p.url, p.is_active ' +
      'FROM panels p ' +
      'JOIN group_panels gp ON p.id = gp.panel_id ' +
      'WHERE gp.group_id = $1',
      [id]
    );

    res.status(200).json({
      group: groupResult.rows[0],
      users: usersResult.rows,
      panels: panelsResult.rows
    });
  } catch (error) {
    console.error('Error in getGroupById:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Create a new group
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if group already exists
    const groupCheck = await pool.query(
      'SELECT * FROM groups WHERE name = $1',
      [name]
    );

    if (groupCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Grupa o tej nazwie już istnieje' });
    }

    // Insert group into database
    const newGroup = await pool.query(
      'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json({
      message: 'Grupa została utworzona pomyślnie',
      group: newGroup.rows[0]
    });
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update group
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if group exists
    const groupCheck = await pool.query(
      'SELECT * FROM groups WHERE id = $1',
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Grupa nie znaleziona' });
    }

    // If name is being changed, check if new name already exists
    if (name && name !== groupCheck.rows[0].name) {
      const nameCheck = await pool.query(
        'SELECT * FROM groups WHERE name = $1 AND id != $2',
        [name, id]
      );

      if (nameCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Grupa o tej nazwie już istnieje' });
      }
    }

    // Update group
    const updatedGroup = await pool.query(
      'UPDATE groups SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );

    res.status(200).json({
      message: 'Grupa została zaktualizowana pomyślnie',
      group: updatedGroup.rows[0]
    });
  } catch (error) {
    console.error('Error in updateGroup:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Delete group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const groupCheck = await pool.query(
      'SELECT * FROM groups WHERE id = $1',
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Grupa nie znaleziona' });
    }

    // Check if it's a default group that shouldn't be deleted
    const groupName = groupCheck.rows[0].name;
    if (['prezes', 'dyspozytorki', 'instalatorzy', 'kadry'].includes(groupName)) {
      return res.status(400).json({ message: 'Nie można usunąć domyślnej grupy systemowej' });
    }

    // Delete group (cascade will handle related records)
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);

    res.status(200).json({
      message: 'Grupa została usunięta pomyślnie'
    });
  } catch (error) {
    console.error('Error in deleteGroup:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Add user to group
export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { userId, groupId } = req.body;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    // Check if group exists
    const groupCheck = await pool.query(
      'SELECT * FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Grupa nie znaleziona' });
    }

    // Check if user is already in group
    const relationCheck = await pool.query(
      'SELECT * FROM user_groups WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );

    if (relationCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Użytkownik jest już w tej grupie' });
    }

    // Add user to group
    await pool.query(
      'INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)',
      [userId, groupId]
    );

    res.status(200).json({
      message: 'Użytkownik został dodany do grupy pomyślnie'
    });
  } catch (error) {
    console.error('Error in addUserToGroup:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Remove user from group
export const removeUserFromGroup = async (req: Request, res: Response) => {
  try {
    const { userId, groupId } = req.params;

    // Check if relation exists
    const relationCheck = await pool.query(
      'SELECT * FROM user_groups WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie jest w tej grupie' });
    }

    // Remove user from group
    await pool.query(
      'DELETE FROM user_groups WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );

    res.status(200).json({
      message: 'Użytkownik został usunięty z grupy pomyślnie'
    });
  } catch (error) {
    console.error('Error in removeUserFromGroup:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
