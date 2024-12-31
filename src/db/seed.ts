import 'dotenv/config';
import { db, queryClient } from './config';
import { users } from './schema';
import crypto from 'crypto';

// 辅助函数：生成盐值和密码哈希
function generatePassword(plainPassword: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

async function seed() {
  try {
    // 生成示例用户的密码
    const user1Credentials = generatePassword('password123');
    const user2Credentials = generatePassword('password456');

    // 示例用户数据
    await db.insert(users).values([
      {
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        salt: user1Credentials.salt,
        password: user1Credentials.hash,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'lisi',
        email: 'lisi@example.com',
        salt: user2Credentials.salt,
        password: user2Credentials.hash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ 示例数据添加成功');
  } catch (error) {
    console.error('❌ 添加示例数据失败:', error);
  } finally {
    await queryClient.end();
  }
}

seed();
