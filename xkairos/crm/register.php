<?php
include '../includes/config.php';
session_start();
if($_SERVER['REQUEST_METHOD']==='POST'){
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO clientes (nome,email,senha) VALUES (?,?,?)');
    try {
        $stmt->execute([$nome,$email,$senha]);
        $_SESSION['cliente_id'] = $pdo->lastInsertId();
        $_SESSION['cliente_nome'] = $nome;
        header('Location: dashboard.php');
    } catch(PDOException $e){
        $erro = 'Erro: email já cadastrado!';
    }
}
?>
<form method='POST'>
<input type='text' name='nome' placeholder='Nome' required><br>
<input type='email' name='email' placeholder='Email' required><br>
<input type='password' name='senha' placeholder='Senha' required><br>
<button type='submit'>Cadastrar</button>
</form>
<?php if(isset($erro)) echo "<p>$erro</p>"; ?>
