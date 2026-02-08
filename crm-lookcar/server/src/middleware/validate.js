export const validateBody = (requiredFields = []) => (req, res, next) => {
  const missing = requiredFields.filter((f) => req.body[f] === undefined || req.body[f] === null)
  if (missing.length) return res.status(400).json({ error: 'missing_fields', fields: missing })
  next()
}
