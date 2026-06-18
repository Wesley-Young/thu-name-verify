/** biome-ignore-all lint/style/noNonNullAssertion: We know that the env variable exists in our .env file. */
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import * as oauth from 'thugit-oauth';
import z from 'zod';

import { db } from '../db';
import { usersTable } from '../db/schema';
import { reqIdStorage, uinTokenStorage as uinStorage } from '../storage';

import { randomUUID } from 'node:crypto';

const oauthAppId = process.env.GIT_OAUTH_APP_ID!;
const oauthAppSecret = process.env.GIT_OAUTH_APP_SECRET!;
const oauthRedirectUri = process.env.GIT_OAUTH_APP_REDIRECT_URI || 'http://localhost:5173/api/register/callback';

const register = new Hono();

register.get('/fire', (c) => {
  return c.redirect(
    `https://git.tsinghua.edu.cn/oauth/authorize?client_id=${
      process.env.GIT_OAUTH_APP_ID
    }&redirect_uri=${encodeURIComponent(oauthRedirectUri)}&response_type=code&state=STATE&scope=read_user`,
  );
});

register.get('/callback', async (c) => {
  const callbackCode = c.req.query('code');
  if (!callbackCode) {
    return c.text('Missing code parameter', 400);
  }
  const accessToken = await oauth.getOauthAccessToken(oauthAppId, oauthAppSecret, callbackCode, oauthRedirectUri);
  const info = await oauth.getUserInfo(accessToken);
  const reqId = randomUUID();
  const base64Payload = Buffer.from(JSON.stringify(info)).toString('base64');
  reqIdStorage.set(reqId, info);
  return c.redirect(`/register?${new URLSearchParams({ requestId: reqId, base64Payload }).toString()}`);
});

export const verifyRoute = register.post(
  '/verify',
  zValidator(
    'json',
    z.object({
      reqId: z.string(),
      uin: z.number().min(10001),
    }),
  ),
  async (c) => {
    const data = c.req.valid('json');
    const info = reqIdStorage.get(data.reqId);
    if (!info) {
      return c.text('Invalid request ID', 400);
    }
    reqIdStorage.delete(data.reqId);
    if (uinStorage.has(data.uin)) {
      if (Date.now() - uinStorage.get(data.uin)!.addedAt <= 5 * 60 * 1000) {
        return c.json({
          success: false,
          message: 'QQ 号已在绑定过程中',
        });
      } // else proceed to bind again
    }
    if (await db.select().from(usersTable).where(eq(usersTable.uin, data.uin)).get()) {
      return c.json({
        success: false,
        message: 'QQ 号已被绑定',
      });
    }
    uinStorage.set(data.uin, { addedAt: Date.now(), reqId: data.reqId, userInfo: info });
    return c.json({
      success: true,
      reqId: data.reqId,
    });
  },
);

export default register;
