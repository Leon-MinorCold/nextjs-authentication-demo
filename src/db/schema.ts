import { pgEnum, pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

// 创建角色枚举
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  salt: text('salt').notNull(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 为 TypeScript 创建类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
