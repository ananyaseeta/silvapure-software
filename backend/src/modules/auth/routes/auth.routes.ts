/**
 * Auth Routes
 *
 * All routes are prefixed /api/auth by the app-level router mount.
 *
 * Public routes  (no authentication required):
 *   POST /login
 *   POST /refresh
 *   POST /logout
 *   POST /forgot-password
 *   POST /reset-password
 *
 * Protected routes (authenticate middleware required):
 *   POST /change-password
 *   GET  /me
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.middleware';
import {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/auth.validator';
import {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
} from '../controllers/auth.controller';

export const authRouter = Router();

/** Tighter limiter specifically for token refresh (higher request volume, lower risk). */
const refreshLimiter = rateLimit({
  windowMs:        5 * 60 * 1000,
  max:             60,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' },
  },
  skip: (req) => req.app.get('env') === 'test',
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and obtain tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: operator@silvapure.io
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Str0ng!Pass"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: silvapure_refresh httpOnly cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
authRouter.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Issue a new access token using the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
authRouter.post('/refresh', refreshLimiter, refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Invalidate the current session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post('/logout', logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Always returns 200 regardless of whether the email exists.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset instructions sent (if account exists)
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
authRouter.post('/forgot-password', validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword, confirmPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
authRouter.post('/reset-password', validateResetPassword, resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
authRouter.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  changePassword,
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated user identity
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user identity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
authRouter.get('/me', authenticate, me);
