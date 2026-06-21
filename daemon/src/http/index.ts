import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono/quick';

import register from './register';

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

export default app;
