import { Router } from 'express'
import { sendOk, sendError, sendCreated } from '../controllers/clientesController.js'
import { origensService } from '../services/origensService.js'
import { authOptional } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()
router.use(authOptional)

router.get('/', async (_req, res) => {
  try {
    const rows = await origensService.list()
    sendOk(res, rows)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.post('/', validateBody(['nome']), async (req, res) => {
  try {
    const created = await origensService.create(req.body.nome, req.body.ativo ?? true)
    sendCreated(res, created)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

export default router
