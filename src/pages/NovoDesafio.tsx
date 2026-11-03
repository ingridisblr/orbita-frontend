import React, { useEffect, useRef, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { atualizarDesafio, criarDesafio } from '../services/desafioService';
import type { User } from '../types/auth';
import type { Desafio, DesafioPayload } from '../types/desafio';
import { descreverErro } from '../utils/formatters';
import { podeCadastrarDesafio, podeEditarDesafio } from '../utils/permissions';
import './NovoDesafio.css';

interface NovoDesafioProps {
  user: User;
  desafio?: Desafio; // quando informado, o formulário entra em modo edição
  onVoltar: () => void;
}

const IMPACTOS = ['Baixo', 'Médio', 'Alto'];
const URGENCIAS = ['Baixa', 'Média', 'Alta'];
const CATEGORIAS = ['Eficiência Operacional', 'Transformação Digital', 'Experiência do Usuário'];

interface FormData {
  titulo: string;
  descricao: string;
  areaResponsavel: string;
  pessoasAfetadas: string;
  impacto: string;
  urgencia: string;
  categoria: string;
}

function formularioInicial(desafio?: Desafio): FormData {
  return {
    titulo: desafio?.titulo ?? '',
    descricao: desafio?.descricao_problema ?? '',
    areaResponsavel: desafio?.area_demandante ?? '',
    pessoasAfetadas: desafio?.quem_afeta ?? '',
    impacto: desafio?.impacto ?? '',
    urgencia: desafio?.urgencia ?? '',
    categoria: desafio?.categoria ?? '',
  };
}

// Mantém um valor já salvo que não esteja na lista, para não apagá-lo ao editar
function comOpcaoSalva(opcoes: string[], valor: string): string[] {
  return valor && !opcoes.includes(valor) ? [...opcoes, valor] : opcoes;
}

export const NovoDesafio: React.FC<NovoDesafioProps> = ({ user, desafio, onVoltar }) => {
  const modoEdicao = Boolean(desafio);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => formularioInicial(desafio));
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const semPermissao = modoEdicao && desafio
    ? !podeEditarDesafio(user, desafio)
    : !podeCadastrarDesafio(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando || semPermissao) return;

    setErro('');
    setEnviando(true);

    const payload: DesafioPayload = {
      titulo: formData.titulo.trim(),
      descricao_problema: formData.descricao.trim(),
      area_demandante: formData.areaResponsavel.trim(),
      quem_afeta: formData.pessoasAfetadas.trim() || null,
      impacto: formData.impacto || null,
      urgencia: formData.urgencia || null,
      categoria: formData.categoria || null,
    };

    try {
      if (desafio) {
        await atualizarDesafio(desafio.id_desafio, payload);
        setSucesso('Desafio atualizado com sucesso! Redirecionando...');
      } else {
        await criarDesafio(user.email, { ...payload, status: 'aberto' });
        setSucesso('Desafio publicado com sucesso! Redirecionando...');
      }

      temporizador.current = window.setTimeout(onVoltar, 1500);
    } catch (e) {
      setErro(descreverErro(e));
      setEnviando(false);
    }
  };

  return (
    <div className="novo-desafio-container">
      <button className="link-voltar-gestor" onClick={onVoltar}>
        ← Meus Desafios
      </button>

      <div className="novo-desafio-header">
        <h1>{modoEdicao ? 'Editar Desafio' : 'Novo Desafio'}</h1>
        <p>
          {modoEdicao
            ? 'Atualize as informações do desafio'
            : 'Descreva um problema ou necessidade da sua área'}
        </p>
      </div>

      {sucesso && (
        <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
          ✅ {sucesso}
        </div>
      )}

      {erro && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert variant="error">{erro}</Alert>
        </div>
      )}

      {semPermissao && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert variant="error">
            Você não tem permissão para {modoEdicao ? 'editar este desafio' : 'cadastrar desafios'}.
          </Alert>
        </div>
      )}

      <div className="novo-desafio-layout">
        <form className="novo-desafio-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título do Desafio</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              className="form-control"
              placeholder="Descreva o problema de forma objetiva"
              value={formData.titulo}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              className="form-control"
              placeholder="Contextualize o problema: quem é afetado, qual o impacto atual, o que já foi tentado..."
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="areaResponsavel">Área Responsável</label>
              <input
                type="text"
                id="areaResponsavel"
                name="areaResponsavel"
                className="form-control"
                placeholder="Ex: Administrativo"
                value={formData.areaResponsavel}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pessoasAfetadas">Pessoas/Setores Afetados</label>
              <input
                type="text"
                id="pessoasAfetadas"
                name="pessoasAfetadas"
                className="form-control"
                placeholder="Ex: ~200 servidores"
                value={formData.pessoasAfetadas}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="impacto">Impacto</label>
              <select
                id="impacto"
                name="impacto"
                className="form-control"
                value={formData.impacto}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                {comOpcaoSalva(IMPACTOS, formData.impacto).map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="urgencia">Urgência</label>
              <select
                id="urgencia"
                name="urgencia"
                className="form-control"
                value={formData.urgencia}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                {comOpcaoSalva(URGENCIAS, formData.urgencia).map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                className="form-control"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecionar...</option>
                {comOpcaoSalva(CATEGORIAS, formData.categoria).map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="responsavelArea">Responsável pela Área</label>
            <input
              type="text"
              id="responsavelArea"
              name="responsavelArea"
              className="form-control"
              value={user.name}
              readOnly
              disabled
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onVoltar}>
              Cancelar
            </button>
            <button type="submit" className="btn-publicar" disabled={enviando || semPermissao}>
              {enviando
                ? modoEdicao ? 'Salvando...' : 'Publicando...'
                : modoEdicao ? 'Salvar alterações' : 'Publicar Desafio'}
            </button>
          </div>
        </form>

        <div className="como-funciona-box">
          <h3>Como Funciona</h3>
          <ul>
            <li>
              <strong>Após publicar</strong>, o desafio ficará visível para colaboradores que poderão propor ideias de solução.
            </li>
            <li>
              <strong>O Hub de Inovação</strong> realizará o match entre ideias e desafios, triagem e priorização.
            </li>
            <li>
              <strong>Você acompanha</strong> o andamento e as ideias relacionadas ao seu desafio.
            </li>
            <li>
              <strong>A decisão de aprovação</strong> é feita pelo Analista/Hub, não pelo gestor.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
