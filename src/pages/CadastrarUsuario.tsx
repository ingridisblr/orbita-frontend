import { useState, type FormEvent } from 'react';
import { cadastrarUsuario } from '../services/authService';

import './CadastrarUsuario.css';

type Perfil = 'colaborador' | 'gestor' | 'analista';

export default function CadastrarUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [area, setArea] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('colaborador');

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function limparFormulario() {
    setNome('');
    setEmail('');
    setSenha('');
    setArea('');
    setPerfil('colaborador');
    setMensagem('');
    setErro('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) return;

    setCarregando(true);
    setMensagem('');
    setErro('');

    try {
      await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        area: area.trim(),
        perfil,
      });

      limparFormulario();
      setMensagem('Usuário cadastrado com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o usuário.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro-usuario">
      <div className="cadastro-usuario__cabecalho">
        <h1 className="cadastro-usuario__titulo">Cadastrar Usuário</h1>

        <p className="cadastro-usuario__descricao">
          Adicione um novo usuário à plataforma Órbita.
        </p>
      </div>

      <div className="cadastro-usuario__card">
        <div className="cadastro-usuario__cabecalho">
          <h2 className="cadastro-usuario__subtitulo">
            Informações do usuário
          </h2>

          <p className="cadastro-usuario__descricao">
            Preencha os dados abaixo para cadastrar um novo usuário.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cadastro-usuario__form">
          <div>
            <label htmlFor="nome">Nome completo *</label>
            <input
              id="nome"
              type="text"
              placeholder="Digite o nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="cadastro-usuario__campo"
            />
          </div>

          <div>
            <label htmlFor="email">E-mail *</label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="cadastro-usuario__campo"
            />
          </div>

          <div>
            <label htmlFor="senha">Senha inicial *</label>
            <input
              id="senha"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={8}
              required
              className="cadastro-usuario__campo"
            />
          </div>

          <div>
            <label htmlFor="area">Área</label>
            <input
              id="area"
              type="text"
              placeholder="Ex.: Tecnologia, Administrativo"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="cadastro-usuario__campo"
            />
          </div>

          <div>
            <label htmlFor="perfil">Perfil de acesso *</label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as Perfil)}
              className="cadastro-usuario__campo"
              required
            >
              <option value="colaborador">Colaborador</option>
              <option value="gestor">Gestor Demandante</option>
              <option value="analista">Analista</option>
            </select>
          </div>

          <div className="cadastro-usuario__acoes">
            <button
              type="button"
              disabled={carregando}
              onClick={limparFormulario}
              className="cadastro-usuario__botao"
            >
              Limpar
            </button>

            <button
              type="submit"
              disabled={carregando}
              className="cadastro-usuario__botao cadastro-usuario__botao--primario"
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar usuário'}
            </button>
          </div>

          {mensagem && (
            <p role="status" className="cadastro-usuario__status">
              {mensagem}
            </p>
          )}

          {erro && (
            <p role="alert" className="cadastro-usuario__erro">
              {erro}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
