import { Context, filter, msg, param, seg } from '@fraqjs/fraq';
import 'dotenv/config';
import { createColoredLogHandler } from '@fraqjs/color-log';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { exemptedUsersTable, usersTable } from '../db/schema';
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
    console.log(`入学年份 ${joinYear} 的 ${userInfo.realName} 同学绑定了 QQ 号 ${session.raw.sender_id}`);
    await session.reply(`入学年份为【${joinYear}】的【${userInfo.realName}】同学，绑定成功！`, {
      withQuote: true,
    });
  });

groups.router
  .filter((session) => session.raw.message_scene === 'group' && session.raw.group_member.role !== 'member')
  .command('exempt')
  .arg('user', param.segment('mention'))
  .arg('reason', param.str())
  .execute(async (session, { user, reason }) => {
    const targetUin = user.data.user_id;
    await db.insert(exemptedUsersTable).values({
      uin: targetUin,
      reason: reason,
      addedAt: Date.now(),
      addedBy: session.raw.sender_id,
    });
    await session.reply(`已将 QQ 号 ${targetUin} 添加到免验证名单，理由：${reason}`, {
      withQuote: true,
    });
  });

const notifiedUsersAndInstants = new Map<number, number>();

// notify unverified users
groups.on('message_receive', async ({ data }) => {
  const senderUin = data.sender_id;
  if (await db.select().from(usersTable).where(eq(usersTable.uin, senderUin)).get()) {
    return; // user is already verified
  }
  if (await db.select().from(exemptedUsersTable).where(eq(exemptedUsersTable.uin, senderUin)).get()) {
    return; // user is exempted
  }

  const lastNotifiedInstant = notifiedUsersAndInstants.get(senderUin);
  if (lastNotifiedInstant && Date.now() - lastNotifiedInstant < 10 * 60 * 1000) {
    return; // user has been notified within the last 10 minutes
  }

  await groups.client.send_group_message({
    group_id: data.peer_id,
    message: msg`${seg.mention(senderUin)} 您尚未绑定身份，请在网页端进行绑定。`,
  });
  notifiedUsersAndInstants.set(senderUin, Date.now());
});

export default fraqCtx;
