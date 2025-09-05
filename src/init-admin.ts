import { AdminService } from './services/admin-service';

// Initialize admin account
export async function initializeAdmin(kv: any, env: any): Promise<void> {
  const adminService = new AdminService(kv, env);
  
  // Get admin password from environment
  const adminPassword = env.ADMIN_PASSWORD || 'temp_admin_123';
  
  // Check if admin already exists
  const existingAdmin = await adminService.authenticateAdmin('admin', adminPassword);
  if (existingAdmin) {
    console.log('Admin account already exists');
    return;
  }

  // Create default admin account
  try {
    const admin = await adminService.createAdmin({
      username: 'admin',
      password: adminPassword,
      email: 'admin@leitnerbot.com',
      fullName: 'System Administrator',
      role: 'super_admin',
      isActive: true
    });
    
    console.log('Default admin account created:', {
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error('Failed to create admin account:', error);
  }
}
