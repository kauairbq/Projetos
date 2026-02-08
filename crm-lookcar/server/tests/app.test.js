import { createApp } from '../src/app.js'
import request from 'supertest'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/services/clientesService.js', () => ({
  clientesService: {
    list: jest.fn().mockResolvedValue([{ id: 'c1', nome: 'Teste' }]),
    create: jest.fn().mockImplementation(async (body) => ({ id: 'new', ...body })),
    update: jest.fn().mockImplementation(async (_id, body) => ({ id: 'c1', ...body })),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  },
}))

jest.unstable_mockModule('../src/services/origensService.js', () => ({
  origensService: {
    list: jest.fn().mockResolvedValue([{ id: 'o1', nome: 'Instagram' }]),
  },
}))

jest.unstable_mockModule('../src/services/regioesService.js', () => ({
  regioesService: {
    list: jest.fn().mockResolvedValue([{ id: 'r1', nome: 'Lisboa' }]),
  },
}))

jest.unstable_mockModule('../src/services/negociosService.js', () => ({
  negociosService: {
    list: jest.fn().mockResolvedValue([{ id: 'n1', cliente_id: 'c1', valor_negocio_previsto: 10000 }]),
    create: jest.fn().mockImplementation(async (body) => ({ id: 'n2', ...body })),
  },
}))

jest.unstable_mockModule('../src/services/agendaService.js', () => ({
  agendaService: {
    list: jest.fn().mockResolvedValue([{ id: 'e1', cliente_id: 'c1', titulo: 'Evento', data_hora_inicio: '2025-01-01T10:00:00Z' }]),
    create: jest.fn().mockImplementation(async (body) => ({ id: 'e2', ...body })),
  },
}))

const { default: app } = await import('../src/app.js')

describe('API smoke tests', () => {
  it('health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('clientes CRUD', async () => {
    const list = await request(app).get('/clientes')
    expect(list.status).toBe(200)
    expect(Array.isArray(list.body.data)).toBe(true)

    const created = await request(app).post('/clientes').send({ nome: 'Novo' })
    expect(created.status).toBe(201)
    expect(created.body.data.id).toBeTruthy()

    const updated = await request(app).put('/clientes/c1').send({ nome: 'Editado' })
    expect(updated.status).toBe(200)
    expect(updated.body.data.nome).toBe('Editado')

    const removed = await request(app).delete('/clientes/c1')
    expect(removed.status).toBe(200)
    expect(removed.body.data.deleted).toBe(true)
  })

  it('origens e regioes listam', async () => {
    const o = await request(app).get('/origens')
    expect(o.status).toBe(200)
    expect(o.body.data[0].nome).toBe('Instagram')

    const r = await request(app).get('/regioes')
    expect(r.status).toBe(200)
    expect(r.body.data[0].nome).toBe('Lisboa')
  })

  it('negocios e agenda', async () => {
    const nList = await request(app).get('/negocios')
    expect(nList.status).toBe(200)
    expect(nList.body.data[0].id).toBe('n1')

    const nCreate = await request(app).post('/negocios').send({ cliente_id: 'c1', valor_negocio_previsto: 5000 })
    expect(nCreate.status).toBe(201)
    expect(nCreate.body.data.id).toBe('n2')

    const aList = await request(app).get('/agenda')
    expect(aList.status).toBe(200)
    expect(aList.body.data[0].id).toBe('e1')

    const aCreate = await request(app).post('/agenda').send({ cliente_id: 'c1', titulo: 'Novo', data_hora_inicio: '2025-01-01T12:00:00Z' })
    expect(aCreate.status).toBe(201)
    expect(aCreate.body.data.id).toBe('e2')
  })
})
