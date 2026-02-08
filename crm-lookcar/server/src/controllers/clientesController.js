export const sendOk = (res, data) => res.json({ data })
export const sendCreated = (res, data) => res.status(201).json({ data })
export const sendError = (res, code = 'bad_request', status = 400) => res.status(status).json({ error: code })
