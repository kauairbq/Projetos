import { Router } from 'express'
import { sendOk, sendError, sendCreated } from '../controllers/clientesController.js'
import { distritosService } from '../services/distritosService.js'
import { authOptional } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()
router.use(authOptional)

router.get('/', async (_req, res) => {
  try {
    const rows = await distritosService.list()
    sendOk(res, rows)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.post('/', validateBody(['nome', 'regiao_id']), async (req, res) => {
  try {
    const created = await distritosService.create(req.body)
    sendCreated(res, created)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

export default router
