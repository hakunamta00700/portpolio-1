import { MikroORM, EntityManager } from '@mikro-orm/core'
import config from './orm-config'

declare global {
  // eslint-disable-next-line no-var
  var _mikro_orm: MikroORM | undefined
}

async function getORM(): Promise<MikroORM> {
  if (!globalThis._mikro_orm) {
    globalThis._mikro_orm = await MikroORM.init(config)
  }
  return globalThis._mikro_orm
}

// 요청마다 독립된 EntityManager fork 반환
export async function getEM(): Promise<EntityManager> {
  const orm = await getORM()
  return orm.em.fork()
}
