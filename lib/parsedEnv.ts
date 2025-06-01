import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  MONGODB_URI: z.string(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string(),
  ADMIN_USERNAME: z.string(),
  ADMIN_PASSWORD: z.string(),
});

export const parsedEnv = envSchema.parse(process.env);
