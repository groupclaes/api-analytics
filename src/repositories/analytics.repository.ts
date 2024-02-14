import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

export default class Analytics {
  schema: string = 'analytics.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async listDashboard(): Promise<any | undefined> {
    const r = new sql.Request(this._pool)
    const result = await r.execute(this.schema + 'p_listDashboard')

    if (result.recordsets.length == 8) {
      return {
        uniqueVisitors: {
          data: result.recordsets[0]
        },
        activeUsers: {
          data: result.recordsets[1],
          card: result.recordsets[2]
        },
        impressions: {
          data: result.recordsets[3],
          card: result.recordsets[4]
        },
        registrations: {
          data: result.recordsets[5],
          card: result.recordsets[6]
        },
        visitorProductViews: {
          data: result.recordsets[7]
        }
      }
    }
    return undefined
  }
}