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
  return err.issues.map((e) => ({
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
