import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 确保这些环境变量在 .env 文件中设置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 用于 drizzle 的 postgres 客户端
export const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient);

export { supabase };
