module.exports = {
  table: 'agenda',
  fields: {
    id: 'uuid',
    cliente_id: 'uuid',
    titulo: 'string',
    descricao: 'text',
    data_hora_inicio: 'datetime',
    data_hora_fim: 'datetime',
    tipo: 'string', // chamada | reunião | visita | outro
    origem_agenda: 'string', // agenda1 | agenda2 | agenda3 | agenda4 | crm
    criado_por: 'string',
  },
}
