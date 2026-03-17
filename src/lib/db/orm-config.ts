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
    : (() => {
        const u = new URL(url)
        return {
          dbName:   u.pathname.replace(/^\//, ''),
          driverOptions: {
            connection: {
              host:     u.hostname,
              port:     Number(u.port) || 5432,
              user:     decodeURIComponent(u.username),
              password: decodeURIComponent(u.password),
              database: u.pathname.replace(/^\//, ''),
              ssl:      { rejectUnauthorized: false },
              options:  '-c search_path=public',
            },
          },
        }
      })()
  ),
  entities,
  schema: 'public',
  migrations: {
    path: './src/lib/db/migrations',
  },
})
