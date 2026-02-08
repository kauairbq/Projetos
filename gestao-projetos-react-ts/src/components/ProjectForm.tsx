import { useState } from "react";

type Props = {
  onSubmit: (nome: string, descricao: string) => void;
};

export function ProjectForm({ onSubmit }: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim()) {
      setErro("Nome e descrição são obrigatórios.");
      return;
    }
    setErro("");
    onSubmit(nome.trim(), descricao.trim());
    setNome("");
    setDescricao("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid">
      <div>
        <label className="muted">Nome do projeto</label>
        <input
          className="input"
          placeholder="Ex.: Plataforma interna"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
      <div>
        <label className="muted">Descrição</label>
        <input
          className="input"
          placeholder="Ex.: Gestão de tarefas e progresso"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      <div style={{ alignSelf: "end" }}>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Criar projeto
        </button>
      </div>
      {erro && <div className="error">{erro}</div>}
    </form>
  );
}
