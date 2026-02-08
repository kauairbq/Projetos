import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const authOptional = (req, _res, next) => {
  const token = extractToken(req)
  if (token && env.jwtSecret) {
    try {
      req.user = jwt.verify(token, env.jwtSecret)
    } catch (err) {
      // ignore invalid optional tokens
    }
  }
  next()
}

export const authRequired = (req, res, next) => {
  const token = extractToken(req)
  if (!token || !env.jwtSecret) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    req.user = jwt.verify(token, env.jwtSecret)
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

const extractToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}
