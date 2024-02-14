import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import { env } from 'process'

import dashboardController from './controllers/dashboard.controller'

const LOGLEVEL = 'debug'

export default async function (config: any): Promise<FastifyInstance | undefined> {
  if (!config || !config.wrapper) return
  if (!config.wrapper.mssql && config.mssql) config.wrapper.mssql = config.mssql

  // add jwt configuration object to config since we want to force JWT
  const fastify = await Fastify({ ...config.wrapper, jwt: {} })
  const version_prefix = env.APP_VERSION ? '/' + env.APP_VERSION : ''
  await fastify.register(dashboardController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/dashboard`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })

  return fastify
}