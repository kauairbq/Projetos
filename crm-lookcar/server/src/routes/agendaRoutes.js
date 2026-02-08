import { Router } from 'express'
import { sendOk, sendCreated, sendError } from '../controllers/clientesController.js'
import { agendaService } from '../services/agendaService.js'
import { validateBody } from '../middleware/validate.js'
import { authOptional } from '../middleware/auth.js'

const router = Router()
router.use(authOptional)

router.get('/', async (_req, res) => {
  try {
    const rows = await agendaService.list()
    sendOk(res, rows)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.post('/', validateBody(['cliente_id', 'titulo', 'data_hora_inicio']), async (req, res) => {
  try {
    const created = await agendaService.create(req.body)
    sendCreated(res, created)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

export default router
