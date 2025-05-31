import bcrypt from 'bcryptjs'

// In a real application, this would come from a database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'adminpassword', 10)

export const validateAdminCredentials = (username?: string, password?: string): boolean => {
  if (!username || !password) return false
  if (username !== ADMIN_USERNAME) return false
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
} 