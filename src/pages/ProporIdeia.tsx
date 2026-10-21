
import      { useState } from 'react';
import type { Ideia }    from '../types/ideia';
import                        './ProporIdeia.css';

interface ProporIdeiaProps {
  onSubmit: (
    ideia: Omit<Ideia, 'id' | 'status' | 'data' | 'usuarioId'>
  ) => void;
}

interface IdeiaFormState {
  desafioId: string;
  titulo: string;
  resumo: string;
  areaOrigem: string;
  categoria: string;
  beneficioEsperado: string;
}

const formInicial: IdeiaFormState = {
  desafioId: '',
  titulo: '',
  resumo: '',
  areaOrigem: '',
  categoria: '',
  beneficioEsperado: '',
};

const desafios: Record<string, string> = {
  '1': 'Otimização do Fluxo de Atendimento ao Cliente no Balcão',
  '2': 'Automação na Gestão de Resíduos do Hub de Inovação',
};

export function ProporIdeia({ onSubmit }: ProporIdeiaProps) {
  const [formData, setFormData] =
    useState<IdeiaFormState>(formInicial);

  const [enviando, setEnviando] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !formData.desafioId ||
      !formData.titulo.trim() ||
      !formData.resumo.trim()
    ) {
      alert('Preencha o desafio, o título e a descrição.');
      return;
    }

    setEnviando(true);

    try {
      onSubmit({
        titulo: formData.titulo.trim(),
        descricao: formData.resumo.trim(),
        desafioId: formData.desafioId,
        desafio: desafios[formData.desafioId],
        areaOrigem: formData.areaOrigem,
        categoria: formData.categoria,
        beneficioEsperado: formData.beneficioEsperado.trim(),
      });

      setFormData({ ...formInicial });
    } catch (error) {
      console.error('Erro ao cadastrar ideia:', error);
      alert('Não foi possível cadastrar a ideia.');
      setEnviando(false);
    }
  }

  function handleApoioIA() {
    if (!formData.resumo.trim()) {
      alert('Escreva uma descrição antes de solicitar o apoio da IA.');
      return;
    }

    alert(
      'O apoio de IA ainda precisa ser conectado ao serviço responsável.'
    );
  }

  return (
    <main className="propor-page">
      <button
        type="button"
        className="propor-voltar"
        onClick={() => window.history.back()}
      >
        ← Desafios Abertos
      </button>

      <header className="propor-page-header">
        <h1>Propor Nova Ideia</h1>
        <p>Descreva sua proposta de solução para um desafio aberto</p>
      </header>

      <div className="propor-layout">
        <form className="propor-form-card" onSubmit={handleSubmit}>
          <div className="propor-campo">
            <label htmlFor="desafioId">Desafio relacionado *</label>
            <select
              id="desafioId"
              name="desafioId"
              value={formData.desafioId}
              onChange={handleChange}
              required
            >
              <option value="">Selecionar...</option>
              {Object.entries(desafios).map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="propor-campo">
            <label htmlFor="titulo">Título da ideia *</label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              placeholder="Nome claro e objetivo para a sua proposta"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="propor-campo">
            <div className="propor-label-linha">
              <label htmlFor="resumo">Descrição *</label>
              <button
                type="button"
                className="propor-ia-button"
                onClick={handleApoioIA}
              >
                ✦ Apoio da IA para refinamento
              </button>
            </div>

            <textarea
              id="resumo"
              name="resumo"
              rows={4}
              placeholder="Descreva a solução proposta, como ela funciona e por que resolveria o desafio..."
              value={formData.resumo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="propor-campos-duplos">
            <div className="propor-campo">
              <label htmlFor="areaOrigem">Área de origem</label>
              <select
                id="areaOrigem"
                name="areaOrigem"
                value={formData.areaOrigem}
                onChange={handleChange}
              >
                <option value="">Selecionar...</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Atendimento">Atendimento</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Operações">Operações</option>
                <option value="Sustentabilidade">Sustentabilidade</option>
                <option value="Outra">Outra</option>
              </select>
            </div>

            <div className="propor-campo">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="">Selecionar...</option>
                <option value="Eficiência Operacional">
                  Eficiência Operacional
                </option>
                <option value="Experiência do Usuário">
                  Experiência do Usuário
                </option>
                <option value="Automação">Automação</option>
                <option value="Sustentabilidade">Sustentabilidade</option>
                <option value="Inovação Tecnológica">
                  Inovação Tecnológica
                </option>
              </select>
            </div>
          </div>

          <div className="propor-campo">
            <label htmlFor="beneficioEsperado">Benefício esperado</label>
            <textarea
              id="beneficioEsperado"
              name="beneficioEsperado"
              rows={2}
              placeholder="Que resultados esta ideia pode gerar?"
              value={formData.beneficioEsperado}
              onChange={handleChange}
            />
          </div>

          <div className="propor-acoes">
            <button
              type="button"
              className="propor-cancelar"
              onClick={() => window.history.back()}
              disabled={enviando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="propor-enviar"
              disabled={enviando}
            >
              {enviando ? 'Submetendo...' : 'Submeter Ideia'}
            </button>
          </div>
        </form>

        <aside className="propor-dicas">
          <h2>Boas Práticas</h2>

          <p>
            <strong>Seja específico.</strong> Ideias com descrição clara
            têm maior chance de avançar no processo.
          </p>

          <p>
            <strong>Foque no problema.</strong> Descreva como sua ideia
            resolve o desafio, não apenas o que ela faz.
          </p>

          <p>
            <strong>Mencione benefícios.</strong> Informe o impacto
            esperado, quem seria beneficiado e em que escala.
          </p>

          <p>
            <strong>Uma ideia pode relacionar-se a mais de um desafio.</strong>
            O analista fará o match durante a avaliação.
          </p>

          <div className="propor-proximas-etapas">
            <h3>Próximas etapas</h3>
            <ol>
              <li>Sua ideia é submetida</li>
              <li>Analista faz o Match</li>
              <li>Triagem e priorização</li>
              <li>Aprovação → Projeto</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
