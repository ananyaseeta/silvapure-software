/**
 * Auth Validators — Express middleware wrappers around Zod schemas
 *
 * Each validator parses req.body against its Zod schema.
 * On failure it responds immediately with a structured 422 containing
 * all field-level errors. On success it calls next().
 *
 * These are separate from the controller so the route layer can compose them
 * independently of handler logic.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { loginSchema } from '../dto/login.dto';
import { changePasswordSchema } from '../dto/changePassword.dto';
import { forgotPasswordSchema } from '../dto/forgotPassword.dto';
import { resetPasswordSchema } from '../dto/resetPassword.dto';

interface FieldError {
  field: string;
  message: string;
}

function formatZodErrors(err: ZodError): FieldError[] {
  return err.errors.map((e) => ({
    field:   e.path.join('.') || 'body',
    message: e.message,
  }));
}

function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Request validation failed',
          fields:  formatZodErrors(result.error),
        },
      });
      return;
    }
    req.body = result.data as unknown;
    next();
  };
}

export const validateLogin          = validate(loginSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword  = validate(resetPasswordSchema);
