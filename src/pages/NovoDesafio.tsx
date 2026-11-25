import { useState, type ChangeEvent, type FormEvent, type FC } from 'react';
import { cadastrarDesafio } from '../services/desafioService';
import './NovoDesafio.css';

interface NovoDesafioProps {
  email: string;
  onVoltar: () => void;
}

const camposResumo = [
  { campo: 'titulo', rotulo: 'Título do desafio' },
  { campo: 'descricao', rotulo: 'Descrição' },
  { campo: 'areaResponsavel', rotulo: 'Área demandante' },
  { campo: 'pessoasAfetadas', rotulo: 'Pessoas/setores afetados' },
  { campo: 'impacto', rotulo: 'Impacto' },
  { campo: 'urgencia', rotulo: 'Urgência' },
  { campo: 'categoria', rotulo: 'Categoria' },
] as const;

export const NovoDesafio: FC<NovoDesafioProps> = ({ email, onVoltar }) => {
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    areaResponsavel: '',
    pessoasAfetadas: '',
    impacto: '',
    urgencia: '',
    categoria: '',
  });

  const resumo = camposResumo.map(({ campo, rotulo }) => ({
    campo,
    rotulo,
    valor: formData[campo],
    preenchido: Boolean(formData[campo].trim()),
  }));

  const preenchidos = resumo.filter((item) => item.preenchido).length;
  const totalCampos = resumo.length;
  const completo = preenchidos === totalCampos;

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((atual) => ({ ...atual, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnviando(true);
    setErro('');

    try {
      await cadastrarDesafio({
        email: email.trim().toLowerCase(),
        titulo: formData.titulo.trim(),
        descricao_problema: formData.descricao.trim(),
        area_demandante: formData.areaResponsavel.trim(),
        quem_afeta: formData.pessoasAfetadas.trim(),
        impacto: formData.impacto,
        urgencia: formData.urgencia,
        categoria: formData.categoria,
        status: 'aberto',
      });
      setSucesso(true);
      window.setTimeout(onVoltar, 1200);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível publicar o desafio.',
      );
      setEnviando(false);
    }
  };

  return (
    <div className="novo-desafio-page">
      <header className="novo-desafio-page__header">
        <h1>Novo Desafio</h1>
        <p>Descreva um problema ou necessidade da sua área.</p>
      </header>

      {sucesso && (
        <p
          className="novo-desafio-page__estado novo-desafio-page__estado--sucesso"
          role="status"
        >
          Desafio publicado com sucesso! Redirecionando...
        </p>
      )}
      {erro && (
        <p
          className="novo-desafio-page__estado novo-desafio-page__estado--erro"
          role="alert"
        >
          {erro}
        </p>
      )}

      <div className="novo-desafio-page__layout">
        <form
          className="novo-desafio-page__form"
          onSubmit={handleSubmit}
          aria-busy={enviando}
        >
          <div className="novo-desafio-page__campo">
            <label htmlFor="titulo">Título do desafio</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              placeholder="Descreva o problema de forma objetiva"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="novo-desafio-page__campo">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={5}
              placeholder="Contextualize o problema: quem é afetado, qual o impacto atual, o que já foi tentado..."
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="novo-desafio-page__linha">
            <div className="novo-desafio-page__campo">
              <label htmlFor="areaResponsavel">Área demandante</label>
              <input
                type="text"
                id="areaResponsavel"
                name="areaResponsavel"
                placeholder="Ex.: Administrativo"
                value={formData.areaResponsavel}
                onChange={handleChange}
                required
              />
            </div>

            <div className="novo-desafio-page__campo">
              <label htmlFor="pessoasAfetadas">Pessoas/setores afetados</label>
              <input
                type="text"
                id="pessoasAfetadas"
                name="pessoasAfetadas"
                placeholder="Ex.: ~200 servidores"
                value={formData.pessoasAfetadas}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="novo-desafio-page__linha novo-desafio-page__linha--tres">
            <div className="novo-desafio-page__campo">
              <label htmlFor="impacto">Impacto</label>
              <select
                id="impacto"
                name="impacto"
                value={formData.impacto}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>

            <div className="novo-desafio-page__campo">
              <label htmlFor="urgencia">Urgência</label>
              <select
                id="urgencia"
                name="urgencia"
                value={formData.urgencia}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="novo-desafio-page__campo">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                <option value="Eficiência Operacional">
                  Eficiência Operacional
                </option>
                <option value="Transformação Digital">
                  Transformação Digital
                </option>
                <option value="Experiência do Usuário">
                  Experiência do Usuário
                </option>
              </select>
            </div>
          </div>

          <div className="novo-desafio-page__acoes">
            <button
              type="button"
              className="novo-desafio-page__btn"
              onClick={onVoltar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="novo-desafio-page__btn novo-desafio-page__btn--primario"
              disabled={enviando || sucesso}
            >
              {enviando ? 'Publicando...' : 'Publicar Desafio'}
            </button>
          </div>
        </form>

        <aside
          className="novo-desafio-page__resumo"
          aria-labelledby="novo-desafio-resumo-titulo"
        >
          <div className="novo-desafio-page__resumo-header">
            <h2 id="novo-desafio-resumo-titulo">Prévia do desafio</h2>
            <p>Confira as informações enquanto preenche o formulário.</p>
          </div>

          <div className="novo-desafio-page__progresso">
            <div className="novo-desafio-page__progresso-texto">
              <span>Preenchimento</span>
              <strong aria-live="polite">
                {preenchidos} de {totalCampos} campos
              </strong>
            </div>
            <progress
              className="novo-desafio-page__barra"
              aria-label="Progresso de preenchimento"
              value={preenchidos}
              max={totalCampos}
            />
          </div>

          <ol className="novo-desafio-page__etapas">
            {resumo.map(({ campo, rotulo, valor, preenchido }, index) => (
              <li
                key={campo}
                className={`novo-desafio-page__etapa ${preenchido ? 'novo-desafio-page__etapa--completa' : ''}`}
              >
                <span className="novo-desafio-page__ponto" aria-hidden="true">
                  {preenchido ? '✓' : index + 1}
                </span>
                <div className="novo-desafio-page__etapa-conteudo">
                  <h3>{rotulo}</h3>
                  <p
                    className={
                      preenchido
                        ? 'novo-desafio-page__valor'
                        : 'novo-desafio-page__pendente'
                    }
                  >
                    {preenchido ? valor : 'Aguardando preenchimento'}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {completo && (
            <p className="novo-desafio-page__resumo-completo" role="status">
              <span aria-hidden="true">✓</span> Todos os campos foram
              preenchidos.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};
