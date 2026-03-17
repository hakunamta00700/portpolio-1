import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// 현재는 SQLite만 지원 (개발환경)
// 운영환경(Supabase PostgreSQL) 전환 시 drizzle-orm/postgres-js 로 교체
function createDb() {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'
  const filePath = url.replace('file:', '')
  const sqlite = new Database(filePath)

  // WAL 모드: 읽기/쓰기 동시성 향상
  sqlite.pragma('journal_mode = WAL')

  return drizzleSQLite(sqlite, { schema })
}

// 싱글톤 (Next.js dev 핫 리로드 시 중복 연결 방지)
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof createDb> | undefined
}

export const db = globalThis._db ?? createDb()
if (process.env.NODE_ENV !== 'production') globalThis._db = db
