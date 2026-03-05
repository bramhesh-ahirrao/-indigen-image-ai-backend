-- MySQL Database Setup Script for Indigen AI SaaS
-- Run this script in your MySQL database to create the required tables

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS indigen_ai;
USE indigen_ai;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tokens_available INT DEFAULT 0,
    tokens_used INT DEFAULT 0,
    tokens_total_purchased INT DEFAULT 0,
    subscription_plan ENUM('free', 'basic', 'pro', 'enterprise') DEFAULT 'free',
    subscription_status ENUM('active', 'inactive', 'cancelled', 'expired') DEFAULT 'active',
    subscription_start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date DATETIME NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Token packages table
CREATE TABLE IF NOT EXISTS TokenPackages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    tokens INT NOT NULL,
    price_amount DECIMAL(10,2) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'INR',
    type ENUM('one_time', 'subscription', 'bonus') DEFAULT 'one_time',
    duration INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    features TEXT,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_package_id INT NOT NULL,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    tokens_purchased INT NOT NULL,
    cashfree_response TEXT,
    failure_reason VARCHAR(255),
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (token_package_id) REFERENCES TokenPackages(id) ON DELETE CASCADE
);

-- Token usage tracking table
CREATE TABLE IF NOT EXISTS TokenUsages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('image_generation', 'video_generation', 'text_generation') NOT NULL,
    tokens_used INT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Insert default token packages
INSERT INTO TokenPackages (name, description, tokens, price_amount, price_currency, type, features, sort_order) VALUES
('Starter Pack', 'Perfect for getting started with AI image generation', 50, 99.00, 'INR', 'one_time', '["50 AI tokens", "Image generation", "Basic support"]', 1),
('Creator Pack', 'Great for content creators and small businesses', 200, 349.00, 'INR', 'one_time', '["200 AI tokens", "Image & video generation", "Priority support"]', 2),
('Pro Pack', 'For professionals and agencies', 500, 799.00, 'INR', 'one_time', '["500 AI tokens", "All generation types", "Premium support"]', 3),
('Enterprise Pack', 'For large teams and enterprises', 2000, 2999.00, 'INR', 'one_time', '["2000 AI tokens", "All features", "Dedicated support"]', 4),
('Monthly Basic', 'Monthly subscription with 100 tokens', 100, 199.00, 'INR', 'subscription', '["100 tokens/month", "Auto-renewal", "Cancel anytime"]', 5),
('Monthly Pro', 'Monthly subscription with 500 tokens', 500, 699.00, 'INR', 'subscription', '["500 tokens/month", "All features", "Priority support"]', 6);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_payments_user_id ON Payments(user_id);
CREATE INDEX idx_payments_order_id ON Payments(order_id);
CREATE INDEX idx_payments_status ON Payments(status);
CREATE INDEX idx_token_usage_user_id ON TokenUsages(user_id);
CREATE INDEX idx_token_usage_created_at ON TokenUsages(created_at);

-- Display success message
SELECT 'Database setup completed successfully!' AS message;