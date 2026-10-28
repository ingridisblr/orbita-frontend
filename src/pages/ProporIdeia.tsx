import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Ideia } from '../types/ideia';
import type { Desafio } from '../types/desafio';
import { listarDesafios } from '../services/desafioService';
import './ProporIdeia.css';

interface ProporIdeiaProps {
  onSubmit: (ideia: Omit<Ideia, 'id' | 'codigo' | 'status' | 'data' | 'usuarioId'>) => Promise<void> | void;
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
  desafioId: '', titulo: '', resumo: '', areaOrigem: '', categoria: '', beneficioEsperado: '',
};

export function ProporIdeia({ onSubmit, desafioIdInicial, onVoltar }: ProporIdeiaProps) {
  const [formData, setFormData] = useState<IdeiaFormState>({ ...formInicial, desafioId: desafioIdInicial ?? '' });
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erroDesafios, setErroDesafios] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarDesafios()
      .then((resultado) => {
        if (!ativo) return;
        const ativos = resultado.filter((desafio) => desafio.status.trim().toLowerCase() === 'ativo');
        setDesafios(ativos);
        setFormData((atual) => ({ ...atual, desafioId: desafioIdInicial && ativos.some((item) => item.id === desafioIdInicial) ? desafioIdInicial : atual.desafioId }));
      })
      .catch((error: unknown) => {
        if (ativo) setErroDesafios(error instanceof Error ? error.message : 'Não foi possível carregar os desafios.');
      })
      .finally(() => { if (ativo) setCarregandoDesafios(false); });
    return () => { ativo = false; };
  }, [desafioIdInicial]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const desafioSelecionado = desafios.find((desafio) => desafio.id === formData.desafioId);
    if (!desafioSelecionado || !formData.titulo.trim() || !formData.resumo.trim()) {
      setErroDesafios('Selecione um desafio ativo e preencha o título e a descrição da ideia.');
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
      setErroDesafios(error instanceof Error ? error.message : 'Não foi possível cadastrar a ideia.');
      setEnviando(false);
    }
  }

  function handleApoioIA() {
    if (!formData.resumo.trim()) {
      setErroDesafios('Escreva uma descrição antes de solicitar o apoio da IA.');
      return;
    }
    setErroDesafios('O apoio de IA ainda precisa ser conectado ao serviço responsável.');
  }

  return (
    <main className="propor-page">
      <button type="button" className="propor-voltar" onClick={() => onVoltar ? onVoltar() : window.history.back()}>← Desafios Abertos</button>
      <header className="propor-page-header"><h1>Propor Nova Ideia</h1><p>Descreva sua proposta de solução para um desafio aberto</p></header>

      <div className="propor-layout">
        <form className="propor-form-card" onSubmit={handleSubmit}>
          {erroDesafios && <p role="alert" style={{ color: '#b91c1c' }}>{erroDesafios}</p>}
          <div className="propor-campo">
            <label htmlFor="desafioId">Desafio relacionado *</label>
            <select id="desafioId" name="desafioId" value={formData.desafioId} onChange={handleChange} required disabled={carregandoDesafios}>
              <option value="">{carregandoDesafios ? 'Carregando desafios...' : 'Selecionar...'}</option>
              {desafios.map((desafio) => <option key={desafio.id} value={desafio.id}>{desafio.titulo}</option>)}
            </select>
          </div>

          <div className="propor-campo">
            <label htmlFor="titulo">Título da ideia *</label>
            <input id="titulo" name="titulo" type="text" placeholder="Nome claro e objetivo para a sua proposta" value={formData.titulo} onChange={handleChange} required />
          </div>

          <div className="propor-campo">
            <div className="propor-label-linha"><label htmlFor="resumo">Descrição *</label><button type="button" className="propor-ia-button" onClick={handleApoioIA}>✦ Apoio da IA para refinamento</button></div>
            <textarea id="resumo" name="resumo" rows={4} placeholder="Descreva a solução proposta, como ela funciona e por que resolveria o desafio..." value={formData.resumo} onChange={handleChange} required />
          </div>

          <div className="propor-campos-duplos">
            <div className="propor-campo">
              <label htmlFor="areaOrigem">Área de origem</label>
              <select id="areaOrigem" name="areaOrigem" value={formData.areaOrigem} onChange={handleChange}>
                <option value="">Selecionar...</option><option value="Administrativo">Administrativo</option><option value="Atendimento">Atendimento</option><option value="Tecnologia">Tecnologia</option><option value="Operações">Operações</option><option value="Sustentabilidade">Sustentabilidade</option><option value="Outra">Outra</option>
              </select>
            </div>
            <div className="propor-campo">
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}>
                <option value="">Selecionar...</option><option value="Eficiência Operacional">Eficiência Operacional</option><option value="Experiência do Usuário">Experiência do Usuário</option><option value="Automação">Automação</option><option value="Sustentabilidade">Sustentabilidade</option><option value="Inovação Tecnológica">Inovação Tecnológica</option>
              </select>
            </div>
          </div>

          <div className="propor-campo">
            <label htmlFor="beneficioEsperado">Benefício esperado</label>
            <textarea id="beneficioEsperado" name="beneficioEsperado" rows={2} placeholder="Que resultados esta ideia pode gerar?" value={formData.beneficioEsperado} onChange={handleChange} />
          </div>

          <div className="propor-acoes">
            <button type="button" className="propor-cancelar" onClick={() => onVoltar ? onVoltar() : window.history.back()} disabled={enviando}>Cancelar</button>
            <button type="submit" className="propor-enviar" disabled={enviando || carregandoDesafios || desafios.length === 0}>{enviando ? 'Submetendo...' : 'Submeter Ideia'}</button>
          </div>
        </form>

        <aside className="propor-dicas">
          <h2>Boas Práticas</h2>
          <p><strong>Seja específico.</strong> Ideias com descrição clara têm maior chance de avançar no processo.</p>
          <p><strong>Foque no problema.</strong> Descreva como sua ideia resolve o desafio, não apenas o que ela faz.</p>
          <p><strong>Mencione benefícios.</strong> Informe o impacto esperado, quem seria beneficiado e em que escala.</p>
          <p><strong>Uma ideia pode relacionar-se a mais de um desafio.</strong> O analista fará o match durante a avaliação.</p>
          <div className="propor-proximas-etapas"><h3>Próximas etapas</h3><ol><li>Sua ideia é submetida</li><li>Analista faz o Match</li><li>Triagem e priorização</li><li>Aprovação → Projeto</li></ol></div>
        </aside>
      </div>
    </main>
  );
}
