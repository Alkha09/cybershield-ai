-- CyberShield AI - MySQL Initial Schema
CREATE DATABASE IF NOT EXISTS cybershield CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cybershield;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  total_scans INT DEFAULT 0,
  threats_detected INT DEFAULT 0,
  INDEX idx_email (email)
);

-- Scan results table
CREATE TABLE IF NOT EXISTS scan_results (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('URL','EMAIL','SMS','WHATSAPP','TEXT','SCREENSHOT') NOT NULL,
  input TEXT,
  result ENUM('SAFE','SUSPICIOUS','PHISHING','MALICIOUS') NOT NULL,
  confidence DOUBLE NOT NULL,
  threats JSON,
  details JSON,
  ml_model VARCHAR(255),
  model_version VARCHAR(50),
  processing_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_result (result)
);

-- Insert demo user
-- password: demo123 (BCrypt)
INSERT INTO users (id, name, email, password, role, total_scans, threats_detected)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Alex Morgan',
  'demo@cybershield.ai',
  '$2a$10$7Q8ZJ3Q5Q5Q5Q5Q5Q5Q5QeXAMPLEHASHDEMO123456789',
  'ADMIN',
  847,
  156
) ON DUPLICATE KEY UPDATE email=email;

-- Model metadata
CREATE TABLE IF NOT EXISTS ml_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  algorithm VARCHAR(255),
  dataset VARCHAR(500),
  accuracy DECIMAL(5,4),
  version VARCHAR(50),
  features INT,
  last_trained DATE,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO ml_models (name, algorithm, dataset, accuracy, version, features, last_trained) VALUES
('URL Phishing Detector', 'Random Forest + XGBoost Ensemble', 'phisingdata.xlsx', 0.9730, 'v2.3.1', 48, '2024-12-15'),
('Email Phishing Detector', 'BERT + SVM Classifier', 'phishing_email.xlsx, Enron.xlsx, Nazario.xlsx, CEAS_08.xlsx, SpamAssassin.xlsx', 0.9810, 'v1.8.0', 156, '2024-12-10'),
('SMS/WhatsApp Detector', 'LSTM + Attention Model', 'spam.xlsx', 0.9580, 'v1.5.2', 89, '2024-12-08'),
('Scam Message Detector', 'BERT Fine-tuned', 'Nigerian_Fraud.xlsx', 0.9450, 'v1.2.0', 64, '2024-11-28');

SELECT 'CyberShield AI database initialized successfully!' AS status;
