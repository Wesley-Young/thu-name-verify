import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import fraqCtx from './bot';
import register from './route/register';

const app = new Hono();

app.route('/api/register', register);

serve({
  fetch: app.fetch,
  port: 6000,
});

fraqCtx.start();
