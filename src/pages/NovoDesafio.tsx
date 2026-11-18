import React, { useState } from 'react';
import { cadastrarDesafio } from '../services/desafioService';
import './NovoDesafio.css';

interface NovoDesafioProps {
  email: string;
  onVoltar: () => void;
}

export const NovoDesafio: React.FC<NovoDesafioProps> = ({ email, onVoltar }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((atual) => ({ ...atual, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setErro(error instanceof Error ? error.message : 'Não foi possível publicar o desafio.');
      setEnviando(false);
    }
  };

  return (
    <div className="novo-desafio-container">
      <button className="link-voltar-gestor" onClick={onVoltar} disabled={enviando}>
        ← Meus Desafios
      </button>

      <div className="novo-desafio-header">
        <h1>Novo Desafio</h1>
        <p>Descreva um problema ou necessidade da sua área</p>
      </div>

      {sucesso && (
        <div role="status" style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
          ✅ Desafio publicado com sucesso! Redirecionando...
        </div>
      )}
      {erro && <div role="alert" style={{ color: '#b91c1c', marginBottom: '1rem' }}>{erro}</div>}

      <div className="novo-desafio-layout">
        <form className="novo-desafio-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título do Desafio</label>
            <input type="text" id="titulo" name="titulo" className="form-control" placeholder="Descreva o problema de forma objetiva" value={formData.titulo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" rows={4} className="form-control" placeholder="Contextualize o problema: quem é afetado, qual o impacto atual, o que já foi tentado..." value={formData.descricao} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="areaResponsavel">Área Demandante</label>
              <input type="text" id="areaResponsavel" name="areaResponsavel" className="form-control" placeholder="Ex: Administrativo" value={formData.areaResponsavel} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="pessoasAfetadas">Pessoas/Setores Afetados</label>
              <input type="text" id="pessoasAfetadas" name="pessoasAfetadas" className="form-control" placeholder="Ex: ~200 servidores" value={formData.pessoasAfetadas} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="impacto">Impacto</label>
              <select id="impacto" name="impacto" className="form-control" value={formData.impacto} onChange={handleChange} required>
                <option value="">Selecionar...</option><option value="Baixo">Baixo</option><option value="Médio">Médio</option><option value="Alto">Alto</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="urgencia">Urgência</label>
              <select id="urgencia" name="urgencia" className="form-control" value={formData.urgencia} onChange={handleChange} required>
                <option value="">Selecionar...</option><option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" name="categoria" className="form-control" value={formData.categoria} onChange={handleChange} required>
                <option value="">Selecionar...</option><option value="Eficiência Operacional">Eficiência Operacional</option><option value="Transformação Digital">Transformação Digital</option><option value="Experiência do Usuário">Experiência do Usuário</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onVoltar} disabled={enviando}>Cancelar</button>
            <button type="submit" className="btn-publicar" disabled={enviando || sucesso}>{enviando ? 'Publicando...' : 'Publicar Desafio'}</button>
          </div>
        </form>

        <div className="como-funciona-box">
          <h3>Como Funciona</h3>
          <ul>
            <li><strong>Após publicar</strong>, o desafio ficará visível para colaboradores que poderão propor ideias de solução.</li>
            <li><strong>O Hub de Inovação</strong> realizará o match entre ideias e desafios, triagem e priorização.</li>
            <li><strong>Você acompanha</strong> o andamento e as ideias relacionadas ao seu desafio.</li>
            <li><strong>A decisão de aprovação</strong> é feita pelo Analista/Hub, não pelo gestor.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
