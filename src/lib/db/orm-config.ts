import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { defineConfig } from '@mikro-orm/core'
import { SqliteDriver } from '@mikro-orm/sqlite'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { entities } from './entities'

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const isSQLite = url.startsWith('file:')

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  driver: (isSQLite ? SqliteDriver : PostgreSqlDriver) as any,
  ...(isSQLite
    ? { dbName: url.replace('file:', '') }
    : { clientUrl: url }
  ),
  entities,
  migrations: {
    path: './src/lib/db/migrations',
  },
})
