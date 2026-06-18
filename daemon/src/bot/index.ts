import { Context, filter, param } from '@fraqjs/fraq';
import 'dotenv/config';

import { createColoredLogHandler } from '@fraqjs/color-log';

import { db } from '../db';
import { usersTable } from '../db/schema';
import { uinTokenStorage } from '../storage';

const enabledGroups = process.env.ENABLED_GROUPS?.split(',').map((group) => Number(group.trim())) || [];
const milkyBackendUrl = process.env.MILKY_BACKEND_URL || 'http://localhost:30001';

const fraqCtx = Context.fromUrl(milkyBackendUrl, {
  logHandler: createColoredLogHandler({
    minLevel: 'info',
  }),
});
const groups = fraqCtx.fork('verify-groups', filter.group(...enabledGroups));

groups.router
  .command('verify')
  .arg('token', param.str())
  .execute(async (session, { token }) => {
    const result = uinTokenStorage.get(session.raw.sender_id);
    if (!result) {
      await session.reply('未找到绑定请求，请先在网页端进行绑定。', {
        withQuote: true,
      });
      return;
    }
    const { addedAt, reqId, userInfo } = result;
    if (reqId !== token) {
      await session.reply('绑定请求不匹配，请重新在网页端进行绑定。', {
        withQuote: true,
      });
      return;
    }
    if (Date.now() - addedAt > 5 * 60 * 1000) {
      uinTokenStorage.delete(session.raw.sender_id);
      await session.reply('绑定请求已过期，请重新在网页端进行绑定。', {
        withQuote: true,
      });
      return;
    }
    const joinYear = Number(userInfo.studentId.substring(0, 4));
    await db
      .insert(usersTable)
      .values({
        uin: session.raw.sender_id,
        name: userInfo.realName,
        studentId: userInfo.studentId,
        joinYear: joinYear,
      })
      .run();
    uinTokenStorage.delete(session.raw.sender_id);
    await session.reply(`入学年份为 ${joinYear} 的 ${userInfo.realName} 同学，绑定成功！`, {
      withQuote: true,
    });
  });

export default fraqCtx;
