import { Request, Response } from 'express';
import pool from '../config/database';

// Get all application statuses
export const getAllApplicationStatuses = async (req: Request, res: Response) => {
  try {
    const statusesResult = await pool.query(
      'SELECT * FROM application_status ORDER BY application_name'
    );

    res.status(200).json({
      statuses: statusesResult.rows
    });
  } catch (error) {
    console.error('Error in getAllApplicationStatuses:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Check status of all applications
export const checkAllApplicationStatuses = async (req: Request, res: Response) => {
  try {
    // Get all panels
    const panelsResult = await pool.query(
      'SELECT id, name, url FROM panels WHERE is_active = true'
    );
    
    const panels = panelsResult.rows;
    const statusUpdates = [];

    // For each panel, check if it's available and update status
    for (const panel of panels) {
      try {
        // In a real implementation, this would make an actual HTTP request to check status
        // For this demo, we'll simulate with random status
        const isOnline = Math.random() > 0.2; // 80% chance of being online
        const status = isOnline ? 'online' : 'offline';
        
        // Check if status already exists for this application
        const statusCheck = await pool.query(
          'SELECT * FROM application_status WHERE application_name = $1',
          [panel.name]
        );
        
        if (statusCheck.rows.length === 0) {
          // Create new status
          const newStatus = await pool.query(
            'INSERT INTO application_status (application_name, status, last_check) VALUES ($1, $2, NOW()) RETURNING *',
            [panel.name, status]
          );
          statusUpdates.push(newStatus.rows[0]);
        } else {
          // Update existing status
          const updatedStatus = await pool.query(
            'UPDATE application_status SET status = $1, last_check = NOW(), updated_at = NOW() WHERE application_name = $2 RETURNING *',
            [status, panel.name]
          );
          statusUpdates.push(updatedStatus.rows[0]);
        }
      } catch (err) {
        console.error(`Error checking status for ${panel.name}:`, err);
        // Continue with next panel
      }
    }

    res.status(200).json({
      message: 'Statusy aplikacji zostały zaktualizowane pomyślnie',
      statusUpdates
    });
  } catch (error) {
    console.error('Error in checkAllApplicationStatuses:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get dashboard statistics for admin
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get counts of users, groups, panels, and online/offline applications
    const [usersCount, groupsCount, panelsCount, onlineCount, offlineCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM groups'),
      pool.query('SELECT COUNT(*) FROM panels'),
      pool.query('SELECT COUNT(*) FROM application_status WHERE status = $1', ['online']),
      pool.query('SELECT COUNT(*) FROM application_status WHERE status = $1', ['offline'])
    ]);

    // Get most recent user registrations
    const recentUsers = await pool.query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Get most recent panel additions
    const recentPanels = await pool.query(
      'SELECT id, name, created_at FROM panels ORDER BY created_at DESC LIMIT 5'
    );

    res.status(200).json({
      stats: {
        users: parseInt(usersCount.rows[0].count),
        groups: parseInt(groupsCount.rows[0].count),
        panels: parseInt(panelsCount.rows[0].count),
        online_apps: parseInt(onlineCount.rows[0].count),
        offline_apps: parseInt(offlineCount.rows[0].count)
      },
      recent_users: recentUsers.rows,
      recent_panels: recentPanels.rows
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Get system settings
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch actual system settings from database
    // For this demo, we'll return some default settings
    
    res.status(200).json({
      settings: {
        site_name: 'Firmowy Dashboard',
        theme_color: '#3f51b5',
        session_timeout: 60, // minutes
        default_group: 'instalatorzy',
        maintenance_mode: false,
        allow_registration: false
      }
    });
  } catch (error) {
    console.error('Error in getSystemSettings:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update system settings
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    // In a real implementation, this would update actual system settings in database
    // For this demo, we'll just return success
    
    res.status(200).json({
      message: 'Ustawienia systemu zostały zaktualizowane pomyślnie',
      settings
    });
  } catch (error) {
    console.error('Error in updateSystemSettings:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
