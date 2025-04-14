import { Request, Response } from 'express';
import pool from '../config/database';

// Get all panels
export const getAllPanels = async (req: Request, res: Response) => {
  try {
    const panelsResult = await pool.query(
      'SELECT * FROM panels ORDER BY name'
    );

    res.status(200).json({
      panels: panelsResult.rows
    });
  } catch (error) {
    console.error('Error in getAllPanels:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get panel by ID
export const getPanelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const panelResult = await pool.query(
      'SELECT * FROM panels WHERE id = $1',
      [id]
    );

    if (panelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Panel nie znaleziony' });
    }

    // Get groups that have access to this panel
    const groupsResult = await pool.query(
      'SELECT g.id, g.name, g.description ' +
      'FROM groups g ' +
      'JOIN group_panels gp ON g.id = gp.group_id ' +
      'WHERE gp.panel_id = $1',
      [id]
    );

    // Get panel settings if any
    const settingsResult = await pool.query(
      'SELECT settings_json FROM panel_settings WHERE panel_id = $1',
      [id]
    );

    const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0].settings_json : null;

    res.status(200).json({
      panel: panelResult.rows[0],
      groups: groupsResult.rows,
      settings
    });
  } catch (error) {
    console.error('Error in getPanelById:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get panels for current user
export const getPanelsForUser = async (req: Request, res: Response) => {
  try {
    // User ID is available from auth middleware
    const userId = (req as any).user.id;

    // Get panels based on user's groups
    const panelsResult = await pool.query(
      'SELECT DISTINCT p.* ' +
      'FROM panels p ' +
      'JOIN group_panels gp ON p.id = gp.panel_id ' +
      'JOIN user_groups ug ON gp.group_id = ug.group_id ' +
      'WHERE ug.user_id = $1 AND p.is_active = true ' +
      'ORDER BY p.name',
      [userId]
    );

    res.status(200).json({
      panels: panelsResult.rows
    });
  } catch (error) {
    console.error('Error in getPanelsForUser:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Create a new panel
export const createPanel = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, url, is_active, groups } = req.body;

    // Begin transaction
    await pool.query('BEGIN');

    // Insert panel into database
    const newPanel = await pool.query(
      'INSERT INTO panels (name, description, icon, url, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, icon, url, is_active]
    );

    const panelId = newPanel.rows[0].id;

    // Add panel to groups if provided
    if (groups && groups.length > 0) {
      for (const groupId of groups) {
        await pool.query(
          'INSERT INTO group_panels (group_id, panel_id) VALUES ($1, $2)',
          [groupId, panelId]
        );
      }
    } else {
      // If no groups specified, add to prezes group by default
      const prezesGroup = await pool.query('SELECT id FROM groups WHERE name = $1', ['prezes']);
      if (prezesGroup.rows.length > 0) {
        await pool.query(
          'INSERT INTO group_panels (group_id, panel_id) VALUES ($1, $2)',
          [prezesGroup.rows[0].id, panelId]
        );
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Panel został utworzony pomyślnie',
      panel: newPanel.rows[0]
    });
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error in createPanel:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update panel
export const updatePanel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, url, is_active, groups } = req.body;

    // Begin transaction
    await pool.query('BEGIN');

    // Update panel
    const updatedPanel = await pool.query(
      'UPDATE panels SET name = $1, description = $2, icon = $3, url = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, description, icon, url, is_active, id]
    );

    if (updatedPanel.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Panel nie znaleziony' });
    }

    // Update panel groups if provided
    if (groups) {
      // Remove existing group associations
      await pool.query('DELETE FROM group_panels WHERE panel_id = $1', [id]);

      // Add new group associations
      for (const groupId of groups) {
        await pool.query(
          'INSERT INTO group_panels (group_id, panel_id) VALUES ($1, $2)',
          [groupId, id]
        );
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({
      message: 'Panel został zaktualizowany pomyślnie',
      panel: updatedPanel.rows[0]
    });
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error in updatePanel:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Delete panel
export const deletePanel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if panel exists
    const panelCheck = await pool.query(
      'SELECT * FROM panels WHERE id = $1',
      [id]
    );

    if (panelCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Panel nie znaleziony' });
    }

    // Delete panel (cascade will handle related records)
    await pool.query('DELETE FROM panels WHERE id = $1', [id]);

    res.status(200).json({
      message: 'Panel został usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error in deletePanel:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get groups for a panel
export const getPanelGroups = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if panel exists
    const panelCheck = await pool.query(
      'SELECT * FROM panels WHERE id = $1',
      [id]
    );

    if (panelCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Panel nie znaleziony' });
    }

    // Get groups that have access to this panel
    const groupsResult = await pool.query(
      'SELECT g.id, g.name, g.description ' +
      'FROM groups g ' +
      'JOIN group_panels gp ON g.id = gp.group_id ' +
      'WHERE gp.panel_id = $1',
      [id]
    );

    res.status(200).json({
      groups: groupsResult.rows
    });
  } catch (error) {
    console.error('Error in getPanelGroups:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update panel settings
export const updatePanelSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { settings } = req.body;

    // Check if panel exists
    const panelCheck = await pool.query(
      'SELECT * FROM panels WHERE id = $1',
      [id]
    );

    if (panelCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Panel nie znaleziony' });
    }

    // Check if settings already exist for this panel
    const settingsCheck = await pool.query(
      'SELECT * FROM panel_settings WHERE panel_id = $1',
      [id]
    );

    if (settingsCheck.rows.length === 0) {
      // Insert new settings
      await pool.query(
        'INSERT INTO panel_settings (panel_id, settings_json) VALUES ($1, $2)',
        [id, settings]
      );
    } else {
      // Update existing settings
      await pool.query(
        'UPDATE panel_settings SET settings_json = $1, updated_at = NOW() WHERE panel_id = $2',
        [settings, id]
      );
    }

    res.status(200).json({
      message: 'Ustawienia panelu zostały zaktualizowane pomyślnie'
    });
  } catch (error) {
    console.error('Error in updatePanelSettings:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
