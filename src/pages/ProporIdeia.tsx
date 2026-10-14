import { useState } from 'react';
import './ProporIdeia.css';

export function ProporIdeia() {
  const [titulo, setTitulo] = useState('');
  const [desafioId, setDesafioId] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      setTitulo('');
      setDescricao('');
      setBeneficios('');
    }, 4000);
  };

  return (
    <div className="propor-container">
      <header className="propor-header">
        <h1>Propor Nova Ideia</h1>
        <p>Apresente a sua solução inovadora para otimizar os processos e gerar valor para a organização.</p>
      </header>

      {sucesso && (
        <div className="propor-alert-sucesso">
          <strong>Sucesso!</strong> A sua ideia foi submetida e enviada para triagem da equipe de inovação.
        </div>
      )}

      <form onSubmit={handleSubmit} className="propor-form">
        <div className="form-group">
          <label htmlFor="desafio">Desafio Relacionado *</label>
          <select
            id="desafio"
            value={desafioId}
            onChange={(e) => setDesafioId(e.target.value)}
            className="form-control"
          >
            <option value="1">Otimização do Fluxo de Atendimento ao Cliente no Balcão</option>
            <option value="2">Automação na Gestão de Resíduos do Hub de Inovação</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título da Proposta *</label>
          <input
            id="titulo"
            type="text"
            placeholder="Ex: Implementação de triagem digital via tótem"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição Detalhada da Solução *</label>
          <textarea
            id="descricao"
            rows={4}
            placeholder="Explique como a sua ideia resolve o problema apontado..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="beneficios">Benefícios Esperados / Impacto</label>
          <textarea
            id="beneficios"
            rows={3}
            placeholder="Ex: Redução estimada de 30% no tempo de espera..."
            value={beneficios}
            onChange={(e) => setBeneficios(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-enviar-ideia">
            Submeter Proposta
          </button>
        </div>
      </form>
    </div>
  );
}