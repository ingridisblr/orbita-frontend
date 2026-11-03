
import      { useEffect, useState } from 'react';

import      { Alert }              from '../components/common/Alert';
import      { atualizarIdeia, criarIdeia } from '../services/ideiaService';
import      { desafioEstaAberto, listarDesafios } from '../services/desafioService';
import type { Desafio }            from '../types/desafio';
import type { Ideia }              from '../types/ideia';
import      { descreverErro }      from '../utils/formatters';
import                                  './ProporIdeia.css';

interface ProporIdeiaProps {
  // Desafio já escolhido em "Desafios Abertos"
  desafioIdInicial?: number | null;
  // Quando informada, a tela edita essa ideia em vez de cadastrar
  ideia?: Ideia;
  onSucesso: (ideia: Ideia) => void;
  onCancelar: () => void;
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

const areas = [
  'Administrativo',
  'Atendimento',
  'Tecnologia',
  'Operações',
  'Sustentabilidade',
  'Outra',
];

const categorias = [
  'Eficiência Operacional',
  'Experiência do Usuário',
  'Automação',
  'Sustentabilidade',
  'Inovação Tecnológica',
];

// Mantém na lista um valor já salvo que não esteja entre as opções,
// para que editar a ideia não apague esse campo sem querer.
function comValorAtual(opcoes: string[], atual: string): string[] {
  return atual && !opcoes.includes(atual) ? [atual, ...opcoes] : opcoes;
}

function formDaIdeia(ideia: Ideia): IdeiaFormState {
  return {
    desafioId: String(ideia.id_desafio),
    titulo: ideia.titulo,
    resumo: ideia.descricao,
    areaOrigem: ideia.area ?? '',
    categoria: ideia.categoria ?? '',
    beneficioEsperado: ideia.beneficio_esperado ?? '',
  };
}

export function ProporIdeia({
  desafioIdInicial,
  ideia,
  onSucesso,
  onCancelar,
}: ProporIdeiaProps) {
  const editando = Boolean(ideia);

  const [formData, setFormData] = useState<IdeiaFormState>(() =>
    ideia
      ? formDaIdeia(ideia)
      : {
          ...formInicial,
          desafioId: desafioIdInicial ? String(desafioIdInicial) : '',
        }
  );

  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;

    listarDesafios()
      .then((lista) => {
        if (ativo) setDesafios(lista);
      })
      .catch((error) => {
        if (ativo) setErro(descreverErro(error));
      })
      .finally(() => {
        if (ativo) setCarregandoDesafios(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  // Desafios abertos; na edição, o desafio atual da ideia continua na lista
  const desafiosDisponiveis = desafios.filter(
    (desafio) =>
      desafioEstaAberto(desafio) ||
      String(desafio.id_desafio) === formData.desafioId ||
      desafio.id_desafio === ideia?.id_desafio
  );

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !formData.desafioId ||
      !formData.titulo.trim() ||
      !formData.resumo.trim()
    ) {
      setErro('Preencha o desafio, o título e a descrição.');
      return;
    }

    setErro(null);
    setEnviando(true);

    const payload = {
      id_desafio: Number(formData.desafioId),
      titulo: formData.titulo.trim(),
      descricao: formData.resumo.trim(),
      area: formData.areaOrigem || null,
      categoria: formData.categoria || null,
      beneficio_esperado: formData.beneficioEsperado.trim() || null,
    };

    try {
      const ideiaSalva = ideia
        ? await atualizarIdeia(ideia.id_ideia, payload)
        : await criarIdeia(payload);

      onSucesso(ideiaSalva);
    } catch (error) {
      setErro(descreverErro(error));
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
        onClick={onCancelar}
      >
        {editando ? '← Minhas Ideias' : '← Desafios Abertos'}
      </button>

      <header className="propor-page-header">
        <h1>{editando ? 'Editar Ideia' : 'Propor Nova Ideia'}</h1>
        <p>
          {editando
            ? `Atualize os dados da ideia ${ideia?.codigo ?? ''}`.trim()
            : 'Descreva sua proposta de solução para um desafio aberto'}
        </p>
      </header>

      <div className="propor-layout">
        <form className="propor-form-card" onSubmit={handleSubmit}>
          {erro && <Alert variant="error">{erro}</Alert>}

          <div className="propor-campo">
            <label htmlFor="desafioId">Desafio relacionado *</label>
            <select
              id="desafioId"
              name="desafioId"
              value={formData.desafioId}
              onChange={handleChange}
              required
            >
              <option value="">
                {carregandoDesafios ? 'Carregando...' : 'Selecionar...'}
              </option>
              {desafiosDisponiveis.map((desafio) => (
                <option key={desafio.id_desafio} value={desafio.id_desafio}>
                  {desafio.titulo}
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
                {comValorAtual(areas, formData.areaOrigem).map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
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
                {comValorAtual(categorias, formData.categoria).map(
                  (categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  )
                )}
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
              onClick={onCancelar}
              disabled={enviando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="propor-enviar"
              disabled={enviando}
            >
              {enviando
                ? editando
                  ? 'Salvando...'
                  : 'Submetendo...'
                : editando
                  ? 'Salvar alterações'
                  : 'Submeter Ideia'}
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
