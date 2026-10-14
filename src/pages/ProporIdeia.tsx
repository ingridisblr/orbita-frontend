import { useState } from 'react';
import './ProporIdeia.css';

interface IdeiaFormState {
  desafioId: string;
  titulo: string;
  resumo: string;
  impactoEsperado: string;
  custoEstimado: string;
}
export function ProporIdeia() {
  const [formData, setFormData] = useState<IdeiaFormState>({
    desafioId: '1',
    titulo: '',
    resumo: '',
    impactoEsperado: '',
    custoEstimado: '',
  });

  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tipagem inline direta para evitar conflitos de módulos do TypeScript
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);

    setTimeout(() => {
      alert(`Ideia "${formData.titulo}" submetida com sucesso! A aguardar triagem da IA.`);
      setEnviando(false);
      setFormData({
        desafioId: '1',
        titulo: '',
        resumo: '',
        impactoEsperado: '',
        custoEstimado: '',
      });
    }, 800);
  };

  return (
    <div className="propor-ideia-container">
      <header className="propor-ideia-header">
        <h1>Propor Nova Ideia</h1>
        <p>Apresente a sua solução inovadora para o desafio selecionado. A proposta passará por uma análise de compatibilidade semântica assistida por IA, sob rigorosa governança humana.</p>
      </header>

      <form className="propor-ideia-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="desafioId">Desafio Relacionado</label>
          <select
            id="desafioId"
            name="desafioId"
            className="form-control-select"
            value={formData.desafioId}
            onChange={handleChange}
          >
            <option value="1">Otimização do Fluxo de Atendimento ao Cliente no Balcão</option>
            <option value="2">Automação na Gestão de Resíduos do Hub de Inovação</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título da Proposta</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            className="form-control-input"
            placeholder="Ex: Implementação de totem digital de triagem rápida"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="resumo">Descrição Detalhada da Ideia</label>
          <textarea
            id="resumo"
            name="resumo"
            className="form-control-textarea"
            placeholder="Descreva como a sua solução resolve o gargalo operacional apontado no desafio..."
            value={formData.resumo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="impactoEsperado">Impacto Operacional Esperado</label>
          <input
            type="text"
            id="impactoEsperado"
            name="impactoEsperado"
            className="form-control-input"
            placeholder="Ex: Redução estimada de 30% no tempo de espera do cliente"
            value={formData.impactoEsperado}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="custoEstimado">Estimativa de Investimento / Esforço</label>
          <input
            type="text"
            id="custoEstimado"
            name="custoEstimado"
            className="form-control-input"
            placeholder="Ex: Baixo custo / Implementação em até 2 semanas"
            value={formData.custoEstimado}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancelar" onClick={() => window.history.back()}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={enviando}>
            {enviando ? 'A submeter...' : 'Submeter Proposta'}
          </button>
        </div>
      </form>
    </div>
  );
}