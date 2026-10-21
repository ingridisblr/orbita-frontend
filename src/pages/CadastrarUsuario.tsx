
import { useState, type FormEvent, type CSSProperties } from 'react';
import { cadastrarUsuario } from '../services/authService';

type Perfil = 'colaborador' | 'gestor' | 'analista';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #D6DDE8',
  borderRadius: '10px',
  backgroundColor: '#FFFFFF',
  color: '#172B4D',
  fontSize: '14px',
  outlineColor: '#2457A7',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#253858',
  fontSize: '14px',
  fontWeight: 600,
};

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
          : 'Não foi possível cadastrar o usuário.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '760px',
        margin: '24px auto',
        padding: '0 20px',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ marginBottom: '26px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#142D58',
            margin: '0 0 10px',
          }}
        >
          Cadastrar Usuário
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#66758C',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Adicione um novo usuário à plataforma Órbita.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5EAF2',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 4px 20px rgba(20, 45, 88, 0.05)',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#142D58',
              margin: '0 0 6px',
            }}
          >
            Informações do usuário
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#78869B',
              margin: 0,
            }}
          >
            Preencha os dados abaixo para cadastrar um novo usuário.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          <div>
            <label htmlFor="nome" style={labelStyle}>
              Nome completo *
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Digite o nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="senha" style={labelStyle}>
              Senha inicial *
            </label>
            <input
              id="senha"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={8}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="area" style={labelStyle}>
              Área
            </label>
            <input
              id="area"
              type="text"
              placeholder="Ex.: Tecnologia, Administrativo"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="perfil" style={labelStyle}>
              Perfil de acesso *
            </label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) =>
                setPerfil(e.target.value as Perfil)
              }
              style={inputStyle}
              required
            >
              <option value="colaborador">Colaborador</option>
              <option value="gestor">Gestor Demandante</option>
              <option value="analista">Analista</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
              marginTop: '10px',
              paddingTop: '22px',
              borderTop: '1px solid #EDF0F5',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              disabled={carregando}
              onClick={limparFormulario}
              style={{
                padding: '11px 20px',
                backgroundColor: '#FFFFFF',
                color: '#42526E',
                border: '1px solid #D6DDE8',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Limpar
            </button>

            <button
              type="submit"
              disabled={carregando}
              style={{
                padding: '12px 22px',
                backgroundColor: '#F9D928',
                color: '#17356D',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: carregando ? 'not-allowed' : 'pointer',
                opacity: carregando ? 0.65 : 1,
              }}
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar usuário'}
            </button>
          </div>

          {mensagem && (
            <p
              role="status"
              style={{
                fontSize: '13px',
                color: '#287D46',
                margin: 0,
              }}
            >
              {mensagem}
            </p>
          )}

          {erro && (
            <p
              role="alert"
              style={{
                fontSize: '13px',
                color: '#C62828',
                margin: 0,
              }}
            >
              {erro}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
