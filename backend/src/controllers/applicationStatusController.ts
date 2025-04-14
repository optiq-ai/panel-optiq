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

// Get application status by ID
export const getApplicationStatusById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const statusResult = await pool.query(
      'SELECT * FROM application_status WHERE id = $1',
      [id]
    );

    if (statusResult.rows.length === 0) {
      return res.status(404).json({ message: 'Status aplikacji nie znaleziony' });
    }

    res.status(200).json({
      status: statusResult.rows[0]
    });
  } catch (error) {
    console.error('Error in getApplicationStatusById:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Create a new application status
export const createApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { application_name, status } = req.body;

    // Check if application status already exists
    const statusCheck = await pool.query(
      'SELECT * FROM application_status WHERE application_name = $1',
      [application_name]
    );

    if (statusCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Status aplikacji już istnieje' });
    }

    // Insert application status into database
    const newStatus = await pool.query(
      'INSERT INTO application_status (application_name, status) VALUES ($1, $2) RETURNING *',
      [application_name, status]
    );

    res.status(201).json({
      message: 'Status aplikacji został utworzony pomyślnie',
      status: newStatus.rows[0]
    });
  } catch (error) {
    console.error('Error in createApplicationStatus:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Update application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if application status exists
    const statusCheck = await pool.query(
      'SELECT * FROM application_status WHERE id = $1',
      [id]
    );

    if (statusCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Status aplikacji nie znaleziony' });
    }

    // Update application status
    const updatedStatus = await pool.query(
      'UPDATE application_status SET status = $1, last_check = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.status(200).json({
      message: 'Status aplikacji został zaktualizowany pomyślnie',
      status: updatedStatus.rows[0]
    });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Delete application status
export const deleteApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if application status exists
    const statusCheck = await pool.query(
      'SELECT * FROM application_status WHERE id = $1',
      [id]
    );

    if (statusCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Status aplikacji nie znaleziony' });
    }

    // Delete application status
    await pool.query('DELETE FROM application_status WHERE id = $1', [id]);

    res.status(200).json({
      message: 'Status aplikacji został usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error in deleteApplicationStatus:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
