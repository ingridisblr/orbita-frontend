
import   { useEffect, useState }  from 'react';

// Componentes comuns
import      { Layout }            from './components/common/Layout';
import type { NavigationItemId }  from './components/common/Sidebar';

// Autenticação
import      { Login }              from './pages/Login';

// Páginas do Colaborador
import      { DesafiosAbertos }    from './pages/DesafiosAbertos';
import      { ProporIdeia }        from './pages/ProporIdeia';
import      { MinhasIdeias }       from './pages/MinhasIdeias';

// Páginas do Gestor
import      { MeusDesafios }       from './pages/MeusDesafios';
import      { NovoDesafio }        from './pages/NovoDesafio';
import      { IdeiasRelacionadas } from './pages/IdeiasRelacionadas';

// Serviços e utilitários
import      { definirAoSessaoExpirada }   from './services/api';
import      { login, usuarioApiParaUser } from './services/authService';
import      {
  limparSessao,
  obterToken,
  obterUsuarioSalvo,
  salvarSessao,
}                                         from './services/session';
import      { rotuloStatusIdeia }         from './utils/formatters';

// Tipos
import type { User, UserRole }     from './types/auth';
import type { Ideia }              from './types/ideia';
import type { Desafio }            from './types/desafio';

// Página inicial de cada perfil
const initialPages: Record<UserRole, NavigationItemId> = {
  colaborador: 'desafios-abertos',
  gestor: 'meus-desafios',
  analista: 'painel-avaliacao',
};

// Páginas permitidas para cada perfil
const paginasPorPerfil: Record<UserRole, NavigationItemId[]> = {
  colaborador: [
    'desafios-abertos',
    'propor-ideia',
    'minhas-ideias',
  ],

  gestor: [
    'meus-desafios',
    'novo-desafio',
    'ideias-relacionadas',
    'dashboard',
    'resultados',
  ],

  analista: [
    'ideias-relacionadas',
    'painel-avaliacao',
    'match',
    'triagem',
    'kanban',
    'mvp',
    'dashboard',
    'resultados',
    'auditoria',
  ],
};

// Títulos das páginas
const pageTitles: Record<NavigationItemId, string> = {
  'desafios-abertos': 'Desafios Abertos',
  'propor-ideia': 'Propor Ideia',
  'minhas-ideias': 'Minhas Ideias',
  'meus-desafios': 'Meus Desafios',
  'novo-desafio': 'Novo Desafio',
  'ideias-relacionadas': 'Ideias Relacionadas',
  'painel-avaliacao': 'Painel de Avaliação',
  match: 'Match Ideia × Desafio',
  triagem: 'Triagem / Priorização',
  kanban: 'Projetos / Kanban',
  mvp: 'MVP',
  dashboard: 'Dashboard',
  resultados: 'Resultados',
  auditoria: 'Auditoria',
};

export default function App() {
  // Estado da aplicação
  const [user, setUser] = useState<User | null>(() =>
    obterToken() ? obterUsuarioSalvo() : null
  );

  const [activeItem, setActiveItem] =
    useState<NavigationItemId>('desafios-abertos');

  // Desafio escolhido em "Meus Desafios" para edição
  const [desafioEmEdicao, setDesafioEmEdicao] =
    useState<Desafio | null>(null);

  // Desafio escolhido em "Desafios Abertos" para propor uma ideia
  const [desafioSelecionado, setDesafioSelecionado] =
    useState<number | null>(null);

  // Mensagens de sucesso e de sessão
  const [avisoIdeias, setAvisoIdeias] = useState<string | null>(null);
  const [avisoLogin, setAvisoLogin] = useState<string | null>(null);

  // Token recusado pela API: volta para o login
  useEffect(() => {
    definirAoSessaoExpirada(() => {
      limparSessao();
      setUser(null);
      setDesafioEmEdicao(null);
      setAvisoLogin('Sua sessão expirou. Entre novamente.');
    });

    return () => definirAoSessaoExpirada(null);
  }, []);

  // Login na API
  async function handleLogin(email: string, senha: string) {
    const resposta = await login(email, senha);
    const usuario = usuarioApiParaUser(resposta.usuario);

    salvarSessao(resposta.access_token, usuario);

    setAvisoLogin(null);
    setUser(usuario);
    setActiveItem(initialPages[usuario.role]);
  }

  // Sair
  function handleLogout() {
    limparSessao();

    setUser(null);
    setDesafioEmEdicao(null);
    setDesafioSelecionado(null);
    setAvisoIdeias(null);
    setAvisoLogin(null);
    setActiveItem('desafios-abertos');
  }

  // Navegação com verificação de perfil
  function handleNavigate(item: NavigationItemId) {
    if (!user) return;

    const paginasPermitidas = paginasPorPerfil[user.role];

    if (paginasPermitidas.includes(item)) {
      setDesafioEmEdicao(null);
      setDesafioSelecionado(null);
      setAvisoIdeias(null);
      setActiveItem(item);
    }
  }

  // "Editar" em Meus Desafios: abre o formulário em modo edição
  function handleEditarDesafio(desafio: Desafio) {
    setDesafioEmEdicao(desafio);
    setActiveItem('novo-desafio');
  }

  // "Propor Ideia" em um desafio: abre o formulário já com o desafio
  function handleProporIdeia(idDesafio: number) {
    setDesafioSelecionado(idDesafio);
    setActiveItem('propor-ideia');
  }

  // Ideia cadastrada na API: abre a listagem com a confirmação
  function handleIdeiaCadastrada(ideia: Ideia) {
    setDesafioSelecionado(null);
    setAvisoIdeias(
      `Ideia ${ideia.codigo ?? `#${ideia.id_ideia}`} cadastrada. ` +
        `Status: ${rotuloStatusIdeia(ideia.status)}.`
    );
    setActiveItem('minhas-ideias');
  }

  // Tela de login
  if (!user) {
    return <Login onLogin={handleLogin} aviso={avisoLogin} />;
  }

  // Garante que a página atual pertence ao perfil
  const paginasPermitidas = paginasPorPerfil[user.role];

  const paginaAtual = paginasPermitidas.includes(activeItem)
    ? activeItem
    : initialPages[user.role];

  // Área principal da aplicação
  return (
    <Layout
      user={user}
      activeItem={paginaAtual}
      onNavigate={handleNavigate}
      onSwitchProfile={handleLogout}
      onLogout={handleLogout}
    >
      {/* Páginas do Colaborador */}
      {paginaAtual === 'desafios-abertos' && (
        <DesafiosAbertos onProporIdeia={handleProporIdeia} />
      )}

      {paginaAtual === 'propor-ideia' && (
        <ProporIdeia
          desafioIdInicial={desafioSelecionado}
          onSucesso={handleIdeiaCadastrada}
          onCancelar={() => handleNavigate('desafios-abertos')}
        />
      )}

      {paginaAtual === 'minhas-ideias' && (
        <MinhasIdeias
          user={user}
          avisoInicial={avisoIdeias}
        />
      )}

      {/* Páginas do Gestor */}
      {paginaAtual === 'meus-desafios' && (
        <MeusDesafios
          user={user}
          onIrParaNovoDesafio={() =>
            handleNavigate('novo-desafio')
          }
          onEditar={handleEditarDesafio}
          onIrParaIdeias={() =>
            handleNavigate('ideias-relacionadas')
          }
        />
      )}

      {paginaAtual === 'novo-desafio' && (
        <NovoDesafio
          user={user}
          desafio={desafioEmEdicao ?? undefined}
          onVoltar={() =>
            handleNavigate('meus-desafios')
          }
        />
      )}

      {/* Página compartilhada entre Gestor e Analista */}
      {paginaAtual === 'ideias-relacionadas' && (
        <IdeiasRelacionadas />
      )}

      {/* Fallback para módulos ainda não implementados */}
      {![
        'desafios-abertos',
        'propor-ideia',
        'minhas-ideias',
        'meus-desafios',
        'novo-desafio',
        'ideias-relacionadas',
      ].includes(paginaAtual) && (
        <main style={{ padding: '24px' }}>
          <h1>{pageTitles[paginaAtual]}</h1>

          <p>
            O conteúdo deste módulo será implementado
            nas próximas etapas do ÓRBITA.
          </p>
        </main>
      )}
    </Layout>
  );
}
