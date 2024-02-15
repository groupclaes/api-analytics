import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
import Analytics from '../repositories/analytics.repository'
import sql from 'mssql'

declare module 'fastify' {
  export interface FastifyInstance {
    getSqlPool: (name?: string) => Promise<sql.ConnectionPool>
  }

  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
   * Get analytics dashboard from DB
   * @route GET /{APP_VERSION}/analytics/dashboard
   */
  fastify.get('', async function (request: FastifyRequest<{
    Querystring: {
      company: 'DIS' | 'BRA'
    }
  }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401, performance.now() - start)

    if (!request.hasPermission('read', 'GroupClaes.EMP/dashboard'))
      return reply.fail({ role: 'missing permission' }, 403, performance.now() - start)

    try {
      let dbName: string | undefined
      if (request.query.company.toLocaleUpperCase() === 'BRA')
        dbName = 'brabopak'
      const pool = await fastify.getSqlPool(dbName)
      const repo = new Analytics(request.log, pool)

      const result = await repo.listDashboard() // request.jwt.sub
      return reply.success(result, 200, performance.now() - start)
      // if (result.verified) {
      //   if (result.error) return reply.error(result.error, 500, performance.now() - start)

      //   return reply.success(result.result, 200, performance.now() - start)
      // }
      // return reply.error('Session has expired!', 401, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get analytics dashboard!')
      return reply.error('failed to get analytics dashboard!', 500, performance.now() - start)
    }
  })
}