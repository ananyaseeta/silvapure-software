import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { authRouter, AuthServiceError, AuthTokenError } from './modules/auth';
import { AuthorizationError } from './modules/authorization';
import { organizationRouter, OrganizationError } from './modules/organization';
import { userRouter, UserError } from './modules/user';
import { ZodError } from 'zod';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'SILVAPURE API',
      version:     '1.0.0',
      description: 'Enterprise Wastewater Management Platform — REST API',
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id:             { type: 'string', format: 'uuid' },
                    email:          { type: 'string', format: 'email' },
                    firstName:      { type: 'string' },
                    lastName:       { type: 'string', nullable: true },
                    organizationId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
        },
        RefreshResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: { accessToken: { type: 'string' } },
            },
          },
        },
        MeResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id:             { type: 'string', format: 'uuid' },
                    email:          { type: 'string', format: 'email' },
                    organizationId: { type: 'string', format: 'uuid' },
                    status:         { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
                  },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required or token invalid',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        BadRequest: {
          description: 'Bad request',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Permission or role requirement not satisfied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                missingPermission: {
                  summary: 'Missing permission',
                  value: { success: false, error: { code: 'AUTHZ_MISSING_PERMISSION', message: 'Permission required: plant.delete' } },
                },
                missingRole: {
                  summary: 'Missing role',
                  value: { success: false, error: { code: 'AUTHZ_MISSING_ROLE', message: 'Role required: ADMIN' } },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ErrorResponse' },
                  {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'object',
                        properties: {
                          fields: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                field:   { type: 'string' },
                                message: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/routes/*.ts'],
});

const authMutationLimiter = rateLimit({
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

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin:      env.CORS_ORIGIN,
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  if (env.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api/docs.json', (_req, res) => { res.json(swaggerSpec); });
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth',          authMutationLimiter, authRouter);
  app.use('/api/organizations', organizationRouter);
  app.use('/api/users',         userRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(422).json({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Request validation failed',
          fields:  err.issues.map((e) => ({ field: e.path.join('.') || 'body', message: e.message })),
        },
      });
      return;
    }

    if (err instanceof AuthServiceError) {
      res.status(err.statusHint).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }

    if (err instanceof AuthTokenError) {
      res.status(401).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }

    if (err instanceof AuthorizationError) {
      res.status(err.statusHint).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }

    if (err instanceof OrganizationError) {
      res.status(err.statusHint).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }

    if (err instanceof UserError) {
      res.status(err.statusHint).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }

    const isDev    = env.NODE_ENV === 'development';
    const message  = isDev && err instanceof Error ? err.message : 'Internal server error';

    if (env.NODE_ENV !== 'test') console.error('[Error]', err);

    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  });

  return app;
}
