-- Admin Dashboard Setup SQL
-- Add admin-related tables to existing database

-- Admins table for admin users
CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Settings table for global configurations
CREATE TABLE IF NOT EXISTS SystemSettings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- API Keys table for storing sensitive API credentials
CREATE TABLE IF NOT EXISTS ApiKeys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    key_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_service_key (service_name, key_name)
);

-- Admin Activity Logs
CREATE TABLE IF NOT EXISTS AdminActivityLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Admins(id) ON DELETE SET NULL
);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO Admins (username, email, password, role) VALUES 
('admin', 'admin@indigenai.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin')
ON DUPLICATE KEY UPDATE email = 'admin@indigenai.com';

-- Insert default system settings
INSERT INTO SystemSettings (setting_key, setting_value, description) VALUES
('site_name', 'Indigen Image AI', 'Website name'),
('site_description', 'AI-powered image generation platform', 'Site description'),
('contact_email', 'support@indigenai.com', 'Contact email address'),
('max_tokens_per_day', '1000', 'Maximum tokens per user per day'),
('enable_registration', 'true', 'Allow new user registrations'),
('enable_payments', 'true', 'Enable payment processing'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('google_analytics_id', '', 'Google Analytics tracking ID'),
('facebook_pixel_id', '', 'Facebook Pixel ID'),
('stripe_publishable_key', '', 'Stripe publishable key (if using Stripe)'),
('cashfree_app_id', '', 'Cashfree App ID'),
('cashfree_secret_key', '', 'Cashfree Secret Key'),
('cashfree_environment', 'sandbox', 'Cashfree environment: sandbox or production'),
('gemini_api_key', '', 'Google Gemini API key'),
('smtp_host', '', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_user', '', 'SMTP username'),
('smtp_password', '', 'SMTP password'),
('smtp_from_email', 'noreply@indigenai.com', 'SMTP from email address'),
('rate_limit_window_ms', '900000', 'Rate limit window in milliseconds (15 minutes)'),
('rate_limit_max_requests', '100', 'Maximum requests per rate limit window'),
('jwt_secret', 'your-super-secret-jwt-key-change-this', 'JWT secret key'),
('jwt_expire', '7d', 'JWT token expiration time'),
('admin_jwt_secret', 'your-admin-super-secret-jwt-key-change-this', 'Admin JWT secret key'),
('admin_jwt_expire', '24h', 'Admin JWT token expiration time')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Insert default API keys (empty values to be configured by admin)
INSERT INTO ApiKeys (service_name, key_name, key_value, description) VALUES
('google', 'gemini_api_key', '', 'Google Gemini API key for AI generation'),
('cashfree', 'app_id', '', 'Cashfree payment gateway App ID'),
('cashfree', 'secret_key', '', 'Cashfree payment gateway Secret Key'),
('cashfree', 'webhook_secret', '', 'Cashfree webhook secret for verification'),
('email', 'smtp_password', '', 'SMTP password for email notifications'),
('analytics', 'google_analytics_id', '', 'Google Analytics tracking ID'),
('analytics', 'facebook_pixel_id', '', 'Facebook Pixel tracking ID')
ON DUPLICATE KEY UPDATE key_value = VALUES(key_value);