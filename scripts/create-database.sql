-- SQL script to create a proper database schema for production use
-- This would be used with SQLite, PostgreSQL, or MySQL

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bp_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date DATE NOT NULL,
    systolic INTEGER NOT NULL CHECK (systolic >= 70 AND systolic <= 250),
    diastolic INTEGER NOT NULL CHECK (diastolic >= 40 AND diastolic <= 150),
    heart_rate INTEGER CHECK (heart_rate >= 40 AND heart_rate <= 200),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date) -- Only one reading per user per day
);

-- Index for faster queries
CREATE INDEX idx_bp_readings_user_date ON bp_readings(user_id, date);

-- Sample data for testing
INSERT INTO users (email, name) VALUES ('demo@example.com', 'Demo User');

INSERT INTO bp_readings (user_id, date, systolic, diastolic, heart_rate, category) VALUES
(1, '2024-01-15', 118, 78, 72, 'Normal'),
(1, '2024-01-16', 122, 82, 75, 'Elevated'),
(1, '2024-01-17', 135, 85, 78, 'Hypertension Stage 1'),
(1, '2024-01-18', 128, 79, 74, 'Elevated'),
(1, '2024-01-19', 142, 92, 80, 'Hypertension Stage 2'),
(1, '2024-01-20', 138, 88, 76, 'Hypertension Stage 1'),
(1, '2024-01-21', 145, 95, 82, 'Hypertension Stage 2');
