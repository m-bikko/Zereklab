import bcrypt from 'bcryptjs';

import { parsedEnv } from './parsedEnv';

// In a real application, this would come from a database
const ADMIN_USERNAME = parsedEnv.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(parsedEnv.ADMIN_PASSWORD, 10);

export const validateAdminCredentials = (
  username?: string,
  password?: string
): boolean => {
  if (!username || !password) return false;
  if (username !== ADMIN_USERNAME) return false;
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
};
