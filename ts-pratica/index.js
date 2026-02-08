// Compilado manualmente a partir de index.ts (para facilitar a correção sem build)
function soma(a, b) { return a + b; }
function multiplicar(a, b) { return a * b; }
function criarPessoa(nome, idade) { return { nome, idade }; }
const carro = { marca: "Toyota", modelo: "Corolla", ano: 2020 };
function descreverCarro(c) { return `Este carro é um ${c.marca} ${c.modelo} de ${c.ano}.`; }
class Funcionario {
  constructor(nome, salario) { this.nome = nome; this.salario = salario; }
  descrever() { return `Funcionário: ${this.nome}, Salário: ${this.salario.toFixed(2)} €`; }
  apresentar() { return `Olá, o meu nome é ${this.nome}.`; }
  atualizarSalario(novoSalario) { this.salario = novoSalario; }
}
class Gerente extends Funcionario {
  constructor(nome, salario, departamento) { super(nome, salario); this.departamento = departamento; }
  descrever() { return `Gerente: ${this.nome}, Departamento: ${this.departamento}, Salário: ${this.salario.toFixed(2)} €`; }
  apresentar() { return `Sou o gerente ${this.nome}, do departamento de ${this.departamento}.`; }
  obterDepartamento() { return this.departamento; }
}
class Diretor extends Gerente {
  constructor(nome, salario, departamento, bonus) { super(nome, salario, departamento); this.bonus = bonus; }
  descrever() { return `Diretor: ${this.nome}, Salário: ${this.salario.toFixed(2)} €, Bónus: ${this.bonus.toFixed(2)} €`; }
  apresentar() { return `Sou o diretor ${this.nome}, recebo um bónus de ${this.bonus.toFixed(2)} €.`; }
  calcularBonus() { return this.salario * 0.1 + this.bonus; }
}
console.log("soma(2, 3) =", soma(2, 3));
console.log("multiplicar(4, 5) =", multiplicar(4, 5));
console.log("criarPessoa('Kauai Rocha', 38) =", criarPessoa("Kauai Rocha", 38));
console.log("descreverCarro(carro) =", descreverCarro(carro));
const funcionario = new Funcionario("Kauai Rocha", 1500);
console.log(funcionario.descrever());
console.log(funcionario.apresentar());
const gerente = new Gerente("Kauai Rocha", 2500, "Marketing");
console.log(gerente.descrever());
console.log(gerente.apresentar());
const diretor = new Diretor("Kauai Rocha", 4000, "Tecnologia", 1000);
console.log(diretor.descrever());
console.log(diretor.apresentar());
console.log(`Bónus total calculado: ${diretor.calcularBonus().toFixed(2)} €`);
