import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  MONGODB_URI: z.string(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string(),
  ADMIN_USERNAME: z.string(),
  ADMIN_PASSWORD: z.string(),
});

export const config = envSchema.parse(process.env);

// Simple admin credentials validation
export const validateAdminCredentials = (
  username?: string,
  password?: string
): boolean => {
  if (!username || !password) return false;
  return (
    username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD
  );
};
