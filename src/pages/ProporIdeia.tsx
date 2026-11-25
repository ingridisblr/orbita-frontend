import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Ideia } from '../types/ideia';
import type { Desafio } from '../types/desafio';
import { listarDesafios } from '../services/desafioService';
import './ProporIdeia.css';

interface ProporIdeiaProps {
  onSubmit: (
    ideia: Omit<Ideia, 'id' | 'codigo' | 'status' | 'data' | 'usuarioId'>,
  ) => Promise<void> | void;
  desafioIdInicial?: string;
  onVoltar?: () => void;
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

export function ProporIdeia({
  onSubmit,
  desafioIdInicial,
  onVoltar,
}: ProporIdeiaProps) {
  const [formData, setFormData] = useState<IdeiaFormState>({
    ...formInicial,
    desafioId: desafioIdInicial ?? '',
  });
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erroDesafios, setErroDesafios] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarDesafios()
      .then((resultado) => {
        if (!ativo) return;
        const ativos = resultado.filter((desafio) =>
          ['ativo', 'aberto'].includes(desafio.status.trim().toLowerCase()),
        );
        setDesafios(ativos);
        setFormData((atual) => ({
          ...atual,
          desafioId:
            desafioIdInicial &&
            ativos.some((item) => item.id === desafioIdInicial)
              ? desafioIdInicial
              : atual.desafioId,
        }));
      })
      .catch((error: unknown) => {
        if (ativo)
          setErroDesafios(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os desafios.',
          );
      })
      .finally(() => {
        if (ativo) setCarregandoDesafios(false);
      });
    return () => {
      ativo = false;
    };
  }, [desafioIdInicial]);

  const desafioSelecionado = desafios.find(
    (desafio) => desafio.id === formData.desafioId,
  );

  const resumo = [
    {
      campo: 'desafioId',
      rotulo: 'Desafio relacionado',
      valor: desafioSelecionado
        ? `DSF-${desafioSelecionado.id} · ${desafioSelecionado.titulo}`
        : '',
      obrigatorio: true,
    },
    {
      campo: 'titulo',
      rotulo: 'Título da ideia',
      valor: formData.titulo,
      obrigatorio: true,
    },
    {
      campo: 'resumo',
      rotulo: 'Descrição',
      valor: formData.resumo,
      obrigatorio: true,
    },
    {
      campo: 'areaOrigem',
      rotulo: 'Área de origem',
      valor: formData.areaOrigem,
      obrigatorio: false,
    },
    {
      campo: 'categoria',
      rotulo: 'Categoria',
      valor: formData.categoria,
      obrigatorio: false,
    },
    {
      campo: 'beneficioEsperado',
      rotulo: 'Benefício esperado',
      valor: formData.beneficioEsperado,
      obrigatorio: false,
    },
  ].map((item) => ({ ...item, preenchido: Boolean(item.valor.trim()) }));

  const preenchidos = resumo.filter((item) => item.preenchido).length;
  const totalCampos = resumo.length;
  const obrigatoriosCompletos = resumo
    .filter((item) => item.obrigatorio)
    .every((item) => item.preenchido);
  const completo = preenchidos === totalCampos;

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !desafioSelecionado ||
      !formData.titulo.trim() ||
      !formData.resumo.trim()
    ) {
      setErroDesafios(
        'Selecione um desafio aberto e preencha o título e a descrição da ideia.',
      );
      return;
    }

    setErroDesafios('');
    setEnviando(true);
    try {
      await onSubmit({
        titulo: formData.titulo.trim(),
        descricao: formData.resumo.trim(),
        desafioId: desafioSelecionado.id,
        desafio: desafioSelecionado.titulo,
        areaOrigem: formData.areaOrigem,
        categoria: formData.categoria,
        beneficioEsperado: formData.beneficioEsperado.trim(),
      });
      setFormData({ ...formInicial });
    } catch (error) {
      console.error('Erro ao cadastrar ideia:', error);
      setErroDesafios(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar a ideia.',
      );
      setEnviando(false);
    }
  }

  function handleApoioIA() {
    if (!formData.resumo.trim()) {
      setErroDesafios(
        'Escreva uma descrição antes de solicitar o apoio da IA.',
      );
      return;
    }
    setErroDesafios(
      'O apoio de IA ainda precisa ser conectado ao serviço responsável.',
    );
  }

  return (
    <div className="propor-ideia-page">
      <header className="propor-ideia-page__header">
        <h1>Propor Nova Ideia</h1>
        <p>Descreva sua proposta de solução para um desafio aberto</p>
      </header>

      <div className="propor-ideia-page__layout">
        <form
          className="propor-ideia-page__form"
          onSubmit={handleSubmit}
          aria-busy={enviando}
        >
          {erroDesafios && (
            <p
              role="alert"
              className="propor-ideia-page__estado propor-ideia-page__estado--erro"
            >
              {erroDesafios}
            </p>
          )}
          <div className="propor-ideia-page__campo">
            <label htmlFor="desafioId">Desafio relacionado *</label>
            <select
              id="desafioId"
              name="desafioId"
              value={formData.desafioId}
              onChange={handleChange}
              required
              disabled={carregandoDesafios}
            >
              <option value="">
                {carregandoDesafios
                  ? 'Carregando desafios...'
                  : 'Selecionar...'}
              </option>
              {desafios.map((desafio) => (
                <option key={desafio.id} value={desafio.id}>
                  {desafio.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="propor-ideia-page__campo">
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

          <div className="propor-ideia-page__campo">
            <div className="propor-ideia-page__label-linha">
              <label htmlFor="resumo">Descrição *</label>
              <button
                type="button"
                className="propor-ideia-page__ia"
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

          <div className="propor-ideia-page__linha">
            <div className="propor-ideia-page__campo">
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
            <div className="propor-ideia-page__campo">
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

          <div className="propor-ideia-page__campo">
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

          <div className="propor-ideia-page__acoes">
            <button
              type="button"
              className="propor-ideia-page__btn"
              onClick={() => (onVoltar ? onVoltar() : window.history.back())}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="propor-ideia-page__btn propor-ideia-page__btn--primario"
              disabled={enviando || carregandoDesafios || desafios.length === 0}
            >
              {enviando ? 'Submetendo...' : 'Submeter Ideia'}
            </button>
          </div>
        </form>

        <aside
          className="propor-ideia-page__resumo"
          aria-labelledby="propor-ideia-resumo-titulo"
        >
          <div className="propor-ideia-page__resumo-header">
            <h2 id="propor-ideia-resumo-titulo">Prévia da ideia</h2>
            <p>Confira as informações enquanto preenche sua proposta.</p>
          </div>

          <div className="propor-ideia-page__progresso">
            <div className="propor-ideia-page__progresso-texto">
              <span>Preenchimento</span>
              <strong aria-live="polite">
                {preenchidos} de {totalCampos} campos
              </strong>
            </div>
            <progress
              className="propor-ideia-page__barra"
              aria-label="Progresso de preenchimento"
              value={preenchidos}
              max={totalCampos}
            />
          </div>

          <ol className="propor-ideia-page__etapas">
            {resumo.map(
              ({ campo, rotulo, valor, obrigatorio, preenchido }, index) => (
                <li
                  key={campo}
                  className={`propor-ideia-page__etapa ${preenchido ? 'propor-ideia-page__etapa--completa' : ''}`}
                >
                  <span className="propor-ideia-page__ponto" aria-hidden="true">
                    {preenchido ? '✓' : index + 1}
                  </span>
                  <div className="propor-ideia-page__etapa-conteudo">
                    <h3>
                      {rotulo}
                      {!obrigatorio && (
                        <span className="propor-ideia-page__opcional">
                          {' '}
                          · Opcional
                        </span>
                      )}
                    </h3>
                    <p
                      className={
                        preenchido
                          ? 'propor-ideia-page__valor'
                          : 'propor-ideia-page__pendente'
                      }
                    >
                      {preenchido ? valor : 'Aguardando preenchimento'}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>

          {obrigatoriosCompletos && (
            <p className="propor-ideia-page__resumo-completo" role="status">
              <span aria-hidden="true">✓</span>
              {completo
                ? 'Todos os campos foram preenchidos.'
                : 'Os campos obrigatórios foram preenchidos.'}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
