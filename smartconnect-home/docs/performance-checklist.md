# Checklist de desempenho

## Aplicacao

- [ ] Tempo de abertura da app < 2s no primeiro arranque
- [ ] Tempo de resposta de comandos < 1s
- [ ] Scroll sem quedas perceptiveis
- [ ] Sem quedas de frame em listas > 100 itens
- [ ] Cache de imagens (quando aplicavel)

## Rede e sincronizacao

- [ ] Operacoes de leitura usam paginacao quando necessario
- [ ] Escritas evitam duplicacao de chamadas
- [ ] Tratamento de falhas e retry basico

## Dispositivos

- [ ] Scan Wi-Fi termina em ate 6s
- [ ] Scan Bluetooth termina em ate 6s
- [ ] Consumo de bateria aceitavel durante scans

## Observabilidade

- [ ] Logs de auditoria registados para acoes criticas
- [ ] Erros de rede reportados de forma clara ao utilizador
