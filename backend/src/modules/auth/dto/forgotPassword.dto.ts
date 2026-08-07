import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
