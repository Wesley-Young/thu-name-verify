import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import fraqCtx from './bot';
import register from './route/register';

const app = new Hono();

app.route('/api/register', register);

// Serve static files from the "dist" directory
app.use(
  '*',
  serveStatic({
    root: '../web/dist',
  }),
);

// SPA fallback
app.get(
  '*',
  serveStatic({
    path: './index.html',
    root: '../web/dist',
  }),
);

serve({
  fetch: app.fetch,
  port: 8000,
});

fraqCtx.start();
