import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  MONGODB_URI: z.string(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string(),
  ADMIN_USERNAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
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
