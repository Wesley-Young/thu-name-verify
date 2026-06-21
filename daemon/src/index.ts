import { serve } from '@hono/node-server';

import fraqCtx from './bot';
import app from './http';

const server = serve({
  fetch: app.fetch,
  port: 8000,
});
fraqCtx.start();

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await fraqCtx.stop();
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
  process.exit(0);
});
