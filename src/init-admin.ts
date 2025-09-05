import { AdminService } from './services/admin-service';

// Initialize admin account
export async function initializeAdmin(kv: any): Promise<void> {
  const adminService = new AdminService(kv, {});
  
  // Check if admin already exists
  const existingAdmin = await adminService.authenticateAdmin('admin', 'admin123');
  if (existingAdmin) {
    console.log('Admin account already exists');
    return;
  }

  // Create default admin account
  try {
    const admin = await adminService.createAdmin({
      username: 'admin',
      password: 'admin123', // Change this in production!
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
