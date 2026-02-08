import { Router } from 'express'
import { sendOk, sendCreated, sendError } from '../controllers/clientesController.js'
import { clientesService } from '../services/clientesService.js'
import { validateBody } from '../middleware/validate.js'
import { authOptional } from '../middleware/auth.js'

const router = Router()
router.use(authOptional)

router.get('/', async (_req, res) => {
  try {
    const rows = await clientesService.list()
    sendOk(res, rows)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.post('/', validateBody(['nome']), async (req, res) => {
  try {
    const created = await clientesService.create(req.body)
    sendCreated(res, created)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.put('/:id', validateBody(['nome']), async (req, res) => {
  try {
    const updated = await clientesService.update(req.params.id, req.body)
    sendOk(res, updated)
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await clientesService.remove(req.params.id)
    sendOk(res, { deleted: true })
  } catch (err) {
    console.error(err)
    sendError(res, 'db_error', 500)
  }
})

export default router
