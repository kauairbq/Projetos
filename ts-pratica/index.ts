// Prática 1: Tipagem de funções e objetos
function soma(a: number, b: number): number {
  return a + b;
}

function multiplicar(a: number, b: number): number {
  return a * b;
}

function criarPessoa(nome: string, idade: number): { nome: string; idade: number } {
  return { nome, idade };
}

const carro = {
  marca: "Toyota",
  modelo: "Corolla",
  ano: 2020,
};

interface Carro {
  marca: string;
  modelo: string;
  ano: number;
}

const carroTipado: Carro = {
  marca: "Toyota",
  modelo: "Corolla",
  ano: 2020,
};

function descreverCarro(c: Carro): string {
  return `Este carro é um ${c.marca} ${c.modelo} de ${c.ano}.`;
}

// Prática 2: Herança, interfaces e encapsulamento
interface Pessoa {
  nome: string;
  apresentar(): string;
}

class Funcionario implements Pessoa {
  public nome: string;
  protected salario: number;

  constructor(nome: string, salario: number) {
    this.nome = nome;
    this.salario = salario;
  }

  public descrever(): string {
    return `Funcionário: ${this.nome}, Salário: ${this.salario.toFixed(2)} €`;
  }

  public apresentar(): string {
    return `Olá, o meu nome é ${this.nome}.`;
  }

  public atualizarSalario(novoSalario: number): void {
    this.salario = novoSalario;
  }
}

class Gerente extends Funcionario {
  private departamento: string;

  constructor(nome: string, salario: number, departamento: string) {
    super(nome, salario);
    this.departamento = departamento;
  }

  public descrever(): string {
    return `Gerente: ${this.nome}, Departamento: ${this.departamento}, Salário: ${this.salario.toFixed(2)} €`;
  }

  public apresentar(): string {
    return `Sou o gerente ${this.nome}, do departamento de ${this.departamento}.`;
  }

  public obterDepartamento(): string {
    return this.departamento;
  }
}

class Diretor extends Gerente {
  private bonus: number;

  constructor(nome: string, salario: number, departamento: string, bonus: number) {
    super(nome, salario, departamento);
    this.bonus = bonus;
  }

  public descrever(): string {
    return `Diretor: ${this.nome}, Salário: ${this.salario.toFixed(2)} €, Bónus: ${this.bonus.toFixed(2)} €`;
  }

  public apresentar(): string {
    return `Sou o diretor ${this.nome}, recebo um bónus de ${this.bonus.toFixed(2)} €.`;
  }

  public calcularBonus(): number {
    return this.salario * 0.1 + this.bonus;
  }
}

// Execução / testes
console.log("soma(2, 3) =", soma(2, 3));
console.log("multiplicar(4, 5) =", multiplicar(4, 5));
console.log("criarPessoa('Kauai Rocha', 38) =", criarPessoa("Kauai Rocha", 38));
console.log("descreverCarro(carroTipado) =", descreverCarro(carroTipado));

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
