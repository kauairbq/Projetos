<?php
// Configurações do banco de dados
$host = "localhost";
$user = "root";          // Usuário padrão do WAMP
$pass = "";              // Senha padrão do WAMP (normalmente vazia)

try {
    // Conectar ao MySQL sem especificar o banco de dados para criar o DB
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Criar o banco de dados
    $pdo->exec("CREATE DATABASE IF NOT EXISTS xkairos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;");
    echo "Banco de dados 'xkairos_db' criado com sucesso!<br>";

    // Usar o banco de dados
    $pdo->exec("USE xkairos_db;");

    // Criar tabela clientes
    $sql_clientes = "CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";
    $pdo->exec($sql_clientes);
    echo "Tabela 'clientes' criada com sucesso!<br>";

    // Criar tabela solicitacoes
    $sql_solicitacoes = "CREATE TABLE IF NOT EXISTS solicitacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        cliente_nome VARCHAR(100) NOT NULL,
        cpu VARCHAR(50),
        gpu VARCHAR(50),
        ram VARCHAR(50),
        ssd VARCHAR(50),
        placa_mae VARCHAR(50),
        cooler VARCHAR(50),
        cpu_preco DECIMAL(10,2) DEFAULT 0,
        gpu_preco DECIMAL(10,2) DEFAULT 0,
        ram_preco DECIMAL(10,2) DEFAULT 0,
        ssd_preco DECIMAL(10,2) DEFAULT 0,
        placa_mae_preco DECIMAL(10,2) DEFAULT 0,
        cooler_preco DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendente',
        data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($sql_solicitacoes);
    echo "Tabela 'solicitacoes' criada com sucesso!<br>";

    // Criar tabela pagamentos
    $sql_pagamentos = "CREATE TABLE IF NOT EXISTS pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        metodo VARCHAR(50) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($sql_pagamentos);
    echo "Tabela 'pagamentos' criada com sucesso!<br>";

    // Criar tabela logs
    $sql_logs = "CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT,
        acao VARCHAR(255),
        data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";
    $pdo->exec($sql_logs);
    echo "Tabela 'logs' criada com sucesso!<br>";

    // Criar tabela pecas
    $sql_pecas = "CREATE TABLE IF NOT EXISTS pecas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        estoque INT DEFAULT 0,
        imagem VARCHAR(255),
        categoria VARCHAR(50),
        descricao TEXT,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";
    $pdo->exec($sql_pecas);
    echo "Tabela 'pecas' criada com sucesso!<br>";

    echo "Todas as tabelas foram criadas com sucesso no banco 'xkairos_db'!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
