require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Admin, SystemSettings, ApiKey } = require('./models');

async function setupAdmin() {
  try {
    console.log('🎯 Setting up admin dashboard...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminExists = await Admin.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        email: 'admin@indigenai.com',
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log('✅ Default admin created: username: admin, password: admin123');
    } else {
      await adminExists.update({ password: hashedPassword });
      console.log('ℹ️  Admin user already exists - Password reset to admin123');
    }

    // Create default system settings
    const defaultSettings = [
      { setting_key: 'site_name', setting_value: 'Indigen Image AI', description: 'Website name' },
      { setting_key: 'site_description', setting_value: 'AI-powered image generation platform', description: 'Site description' },
      { setting_key: 'contact_email', setting_value: 'support@indigenai.com', description: 'Contact email address' },
      { setting_key: 'max_tokens_per_day', setting_value: '1000', description: 'Maximum tokens per user per day' },
      { setting_key: 'enable_registration', setting_value: 'true', description: 'Allow new user registrations' },
      { setting_key: 'enable_payments', setting_value: 'true', description: 'Enable payment processing' },
      { setting_key: 'maintenance_mode', setting_value: 'false', description: 'Enable maintenance mode' },
      { setting_key: 'google_analytics_id', setting_value: '', description: 'Google Analytics tracking ID' },
      { setting_key: 'facebook_pixel_id', setting_value: '', description: 'Facebook Pixel ID' },
      { setting_key: 'cashfree_app_id', setting_value: '', description: 'Cashfree App ID' },
      { setting_key: 'cashfree_secret_key', setting_value: '', description: 'Cashfree Secret Key' },
      { setting_key: 'cashfree_environment', setting_value: 'sandbox', description: 'Cashfree environment: sandbox or production' },
      { setting_key: 'gemini_api_key', setting_value: '', description: 'Google Gemini API key' },
      { setting_key: 'smtp_host', setting_value: '', description: 'SMTP server host' },
      { setting_key: 'smtp_port', setting_value: '587', description: 'SMTP server port' },
      { setting_key: 'smtp_user', setting_value: '', description: 'SMTP username' },
      { setting_key: 'smtp_password', setting_value: '', description: 'SMTP password' },
      { setting_key: 'smtp_from_email', setting_value: 'noreply@indigenai.com', description: 'SMTP from email address' },
      { setting_key: 'rate_limit_window_ms', setting_value: '900000', description: 'Rate limit window in milliseconds' },
      { setting_key: 'rate_limit_max_requests', setting_value: '100', description: 'Maximum requests per rate limit window' },
      { setting_key: 'jwt_secret', setting_value: 'your-super-secret-jwt-key-change-this', description: 'JWT secret key' },
      { setting_key: 'jwt_expire', setting_value: '7d', description: 'JWT token expiration time' },
      { setting_key: 'admin_jwt_secret', setting_value: 'your-admin-super-secret-jwt-key-change-this', description: 'Admin JWT secret key' },
      { setting_key: 'admin_jwt_expire', setting_value: '24h', description: 'Admin JWT token expiration time' }
    ];

    for (const setting of defaultSettings) {
      await SystemSettings.findOrCreate({
        where: { setting_key: setting.setting_key },
        defaults: setting
      });
    }
    console.log('✅ System settings initialized');

    // Create default API keys placeholders
    const defaultApiKeys = [
      { service_name: 'google', key_name: 'gemini_api_key', key_value: '', description: 'Google Gemini API key for AI generation' },
      { service_name: 'cashfree', key_name: 'app_id', key_value: '', description: 'Cashfree payment gateway App ID' },
      { service_name: 'cashfree', key_name: 'secret_key', key_value: '', description: 'Cashfree payment gateway Secret Key' },
      { service_name: 'cashfree', key_name: 'webhook_secret', key_value: '', description: 'Cashfree webhook secret for verification' },
      { service_name: 'email', key_name: 'smtp_password', key_value: '', description: 'SMTP password for email notifications' },
      { service_name: 'analytics', key_name: 'google_analytics_id', key_value: '', description: 'Google Analytics tracking ID' },
      { service_name: 'analytics', key_name: 'facebook_pixel_id', key_value: '', description: 'Facebook Pixel tracking ID' }
    ];

    for (const apiKey of defaultApiKeys) {
      await ApiKey.findOrCreate({
        where: { service_name: apiKey.service_name, key_name: apiKey.key_name },
        defaults: apiKey
      });
    }
    console.log('✅ API keys placeholders created');

    console.log('🎉 Admin dashboard setup complete!');
    console.log('📋 Next steps:');
    console.log('1. Access admin panel at: /admin');
    console.log('2. Login with: admin / admin123');
    console.log('3. Configure your API keys and settings');
    console.log('4. Update default passwords and secrets');

  } catch (error) {
    console.error('❌ Error setting up admin dashboard:', error);
  }
}

if (require.main === module) {
  setupAdmin();
}

module.exports = setupAdmin;