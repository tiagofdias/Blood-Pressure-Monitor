-- Updated SQL script with proper datetime handling
-- This replaces the previous create-database.sql

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bp_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    reading_date DATE NOT NULL,
    reading_time TIME NOT NULL,
    reading_datetime TIMESTAMP NOT NULL,
    systolic INTEGER NOT NULL CHECK (systolic >= 70 AND systolic <= 250),
    diastolic INTEGER NOT NULL CHECK (diastolic >= 40 AND diastolic <= 150),
    heart_rate INTEGER CHECK (heart_rate >= 40 AND heart_rate <= 200),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, reading_datetime) -- Only one reading per user per exact datetime
);

-- Index for faster queries
CREATE INDEX idx_bp_readings_user_datetime ON bp_readings(user_id, reading_datetime);
CREATE INDEX idx_bp_readings_user_date ON bp_readings(user_id, reading_date);

-- Sample data for testing with specific dates and times
INSERT INTO users (email, name) VALUES ('demo@example.com', 'Demo User');

INSERT INTO bp_readings (user_id, reading_date, reading_time, reading_datetime, systolic, diastolic, heart_rate, category) VALUES
(1, '2024-01-15', '08:30:00', '2024-01-15 08:30:00', 118, 78, 72, 'Normal'),
(1, '2024-01-15', '20:15:00', '2024-01-15 20:15:00', 122, 82, 75, 'Elevated'),
(1, '2024-01-16', '09:00:00', '2024-01-16 09:00:00', 135, 85, 78, 'Hypertension Stage 1'),
(1, '2024-01-16', '21:30:00', '2024-01-16 21:30:00', 128, 79, 74, 'Elevated'),
(1, '2024-01-17', '07:45:00', '2024-01-17 07:45:00', 142, 92, 80, 'Hypertension Stage 2'),
(1, '2024-01-17', '19:20:00', '2024-01-17 19:20:00', 138, 88, 76, 'Hypertension Stage 1'),
(1, '2024-01-18', '08:15:00', '2024-01-18 08:15:00', 145, 95, 82, 'Hypertension Stage 2');

-- Query examples for retrieving data
-- Get all readings for a user ordered by datetime
-- SELECT * FROM bp_readings WHERE user_id = 1 ORDER BY reading_datetime DESC;

-- Get readings for a specific date range
-- SELECT * FROM bp_readings WHERE user_id = 1 AND reading_date BETWEEN '2024-01-15' AND '2024-01-18' ORDER BY reading_datetime;

-- Get average BP for the last 7 days
-- SELECT AVG(systolic) as avg_systolic, AVG(diastolic) as avg_diastolic 
-- FROM bp_readings 
-- WHERE user_id = 1 AND reading_date >= DATE('now', '-7 days');
