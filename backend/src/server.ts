/**
 * HTTP Server Entry Point
 *
 * Creates the Express app and binds it to a TCP port.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app    = createApp();
const server = app.listen(env.PORT, () => {
  console.log(
    `[Server] SILVAPURE API running on port ${env.PORT} (${env.NODE_ENV})`,
  );
  if (env.NODE_ENV !== 'production') {
    console.log(`[Server] Swagger UI  → http://localhost:${env.PORT}/api/docs`);
  }
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);

  server.close(async () => {
    console.log('[Server] HTTP server closed');
    await prisma.$disconnect();
    console.log('[Server] Database connection closed');
    process.exit(0);
  });

  // Force exit after 10 s if connections are not draining
  setTimeout(() => {
    console.error('[Server] Forced exit after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT',  () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
  process.exit(1);
});
