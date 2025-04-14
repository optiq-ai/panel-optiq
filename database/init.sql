# PostgreSQL Database Setup

-- Create database
CREATE DATABASE dashboard;

-- Connect to database
\c dashboard

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_groups table
CREATE TABLE user_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

-- Create panels table
CREATE TABLE panels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create group_panels table
CREATE TABLE group_panels (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    panel_id INTEGER REFERENCES panels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, panel_id)
);

-- Create panel_settings table
CREATE TABLE panel_settings (
    id SERIAL PRIMARY KEY,
    panel_id INTEGER REFERENCES panels(id) ON DELETE CASCADE,
    settings_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_settings table
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    settings_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create application_status table
CREATE TABLE application_status (
    id SERIAL PRIMARY KEY,
    application_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default groups
INSERT INTO groups (name, description) VALUES 
('prezes', 'Grupa administratorów z pełnym dostępem'),
('dyspozytorki', 'Grupa z dostępem do grafiku'),
('instalatorzy', 'Grupa instalatorów'),
('kadry', 'Grupa kadr');

-- Insert default panels
INSERT INTO panels (name, description, icon, url) VALUES 
('Panel Finansowy', 'Panel do zarządzania finansami', '/icons/finance.svg', '/finance'),
('Panel Budowy', 'Panel do zarządzania budowami', '/icons/construction.svg', '/construction'),
('Panel Grafik', 'Panel do zarządzania grafikiem', '/icons/schedule.svg', '/schedule'),
('Panel Odzież i Sprzęt', 'Panel do zarządzania odzieżą i sprzętem', '/icons/equipment.svg', '/equipment'),
('Panel Samochody', 'Panel do zarządzania samochodami', '/icons/cars.svg', '/cars');

-- Grant all panels to prezes group
INSERT INTO group_panels (group_id, panel_id)
SELECT (SELECT id FROM groups WHERE name = 'prezes'), id FROM panels;

-- Grant Panel Grafik to dyspozytorki group
INSERT INTO group_panels (group_id, panel_id)
SELECT 
    (SELECT id FROM groups WHERE name = 'dyspozytorki'),
    (SELECT id FROM panels WHERE name = 'Panel Grafik');
