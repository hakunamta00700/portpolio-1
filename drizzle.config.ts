import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Next.js 환경변수(.env.local) 로드
loadEnvConfig(process.cwd())

const isSQLite = (process.env.DATABASE_URL ?? 'file:./dev.db').startsWith('file:')

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: isSQLite ? 'sqlite' : 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
} satisfies Config
