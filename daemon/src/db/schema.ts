import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
  uin: int('uin').primaryKey(),
  name: text('name'),
  studentId: text('student_id'),
  joinYear: int('join_year'), // studentId.substring(0, 4)
});

export const exemptedUsersTable = sqliteTable('exempted_users_table', {
  uin: int('uin').primaryKey(),
  reason: text('reason'),
  addedAt: int('added_at'),
  addedBy: int('added_by'),
});
