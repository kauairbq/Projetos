import { Router } from 'express'
import { sendOk } from '../controllers/clientesController.js'
import { authOptional } from '../middleware/auth.js'

const router = Router()
router.use(authOptional)

router.post('/', (_req, res) => sendOk(res, { imported: true }))

export default router
