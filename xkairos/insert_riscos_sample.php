<?php
include "includes/config.php";

try {
    $stmt = $pdo->prepare("INSERT INTO riscos (projeto_id, descricao, categoria, probabilidade, impacto) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([1, 'Variação de preços de peças', 'Financeiro', 'Media', 'Alta']);
    $stmt->execute([1, 'Falta de estoque / atraso do fornecedor', 'Operacional', 'Media', 'Media']);
    $stmt->execute([1, 'Erro na montagem / incompatibilidade', 'Técnico', 'Baixa', 'Alta']);
    $stmt->execute([1, 'Insatisfação do cliente', 'Qualidade', 'Baixa', 'Media']);
    $stmt->execute([1, 'Problemas na geração de PDF', 'Sistema', 'Baixa', 'Media']);
    $stmt->execute([1, 'Problemas de pagamento MBWay', 'Financeiro', 'Baixa', 'Alta']);

    $stmt2 = $pdo->prepare("INSERT INTO mitigacoes (risco_id, acao) VALUES (?, ?)");
    $stmt2->execute([1, 'Atualizar orçamentos automaticamente e avisar o cliente de alterações.']);
    $stmt2->execute([2, 'Ter fornecedores alternativos e notificação automática de atraso.']);
    $stmt2->execute([3, 'Checklist completo e validação de compatibilidade antes de gerar orçamento.']);
    $stmt2->execute([4, 'Feedback pós-projeto e suporte online via WhatsApp / chat do CRM.']);
    $stmt2->execute([5, 'Log de erros + fallback para envio de PDF por e-mail.']);
    $stmt2->execute([6, 'Teste sandbox MBWay + notificação de falha e alternativas de pagamento.']);

    echo "Dados de exemplo inseridos nas tabelas riscos e mitigacoes!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
