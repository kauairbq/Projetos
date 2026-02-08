import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import clientesRoutes from './routes/clientesRoutes.js'
import origensRoutes from './routes/origensRoutes.js'
import regioesRoutes from './routes/regioesRoutes.js'
import distritosRoutes from './routes/distritosRoutes.js'
import negociosRoutes from './routes/negociosRoutes.js'
import agendaRoutes from './routes/agendaRoutes.js'
import importarRoutes from './routes/importarRoutes.js'

export const createApp = () => {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.nodeEnv }))

  app.use('/clientes', clientesRoutes)
  app.use('/origens', origensRoutes)
  app.use('/regioes', regioesRoutes)
  app.use('/distritos', distritosRoutes)
  app.use('/negocios', negociosRoutes)
  app.use('/agenda', agendaRoutes)
  app.use('/importar', importarRoutes)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'internal_error' })
  })

  return app
}

const app = createApp()
export default app
