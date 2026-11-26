import { useState } from 'react';

// Componentes comuns
import { Layout } from './components/common/Layout';
import type { NavigationItemId } from './components/common/Sidebar';

// Autenticação
import { Login } from './pages/Login';
import { getCurrentUser, logout } from './services/authService';

// Páginas do Colaborador
import { DesafiosAbertos } from './pages/DesafiosAbertos';
import { ProporIdeia, type PropostaIdeia } from './pages/ProporIdeia';
import { MinhasIdeias } from './pages/MinhasIdeias';

// Páginas do Gestor
import { MeusDesafios } from './pages/MeusDesafios';
import { NovoDesafio } from './pages/NovoDesafio';
import { IdeiasRelacionadas } from './pages/IdeiasRelacionadas';

// Páginas do Analista
import CadastrarUsuario from './pages/CadastrarUsuario';
import { Match } from './pages/Match';
import { PainelAvaliacaoIntegrado } from './pages/PainelAvaliacaoIntegrado';
import { TriagemIntegrada } from './pages/TriagemIntegrada';
import { KanbanIntegrado } from './pages/KanbanIntegrado';
import { MVP } from './pages/MVP';
import { Dashboard } from './pages/Dashboard';
import { Resultados } from './pages/Resultados';
import { Auditoria } from './pages/Auditoria';

// Tipos
import type { User, UserRole } from './types/auth';
import type { Desafio } from './types/desafio';
import { cadastrarIdeia } from './services/ideiaService';

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
    'cadastrar-usuario',
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
  'cadastrar-usuario': 'Cadastrar Usuário',
  match: 'Match Ideia × Desafio',
  triagem: 'Triagem / Priorização',
  kanban: 'Projetos / Kanban',
  mvp: 'MVP',
  dashboard: 'Dashboard',
  resultados: 'Resultados',
  auditoria: 'Auditoria',
};

export default function App() {
  // Usuário autenticado
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  // Página ativa
  const [activeItem, setActiveItem] = useState<NavigationItemId>(
    () => {
      const usuarioAtual = getCurrentUser();

      return usuarioAtual
        ? initialPages[usuarioAtual.role]
        : 'desafios-abertos';
    }
  );

  const [desafioSelecionadoId, setDesafioSelecionadoId] = useState('');
  const [desafioEmEdicao, setDesafioEmEdicao] = useState<Desafio>();

  // Login realizado com sucesso
  function handleLoginSuccess(usuario: User) {
    setUser(usuario);
    setActiveItem(initialPages[usuario.role]);
  }

  // Encerrar sessão
  function handleLogout() {
    logout();
    setUser(null);
    setActiveItem('desafios-abertos');
    setDesafioSelecionadoId('');
  }

  // A opção de trocar perfil exige um novo login
  function handleSwitchProfile() {
    handleLogout();
  }

  // Navegação conforme o perfil
  function handleNavigate(item: NavigationItemId) {
    if (!user) return;

    const paginasPermitidas = paginasPorPerfil[user.role];

    if (paginasPermitidas.includes(item)) {
      if (item === 'novo-desafio') setDesafioEmEdicao(undefined);
      if (item === 'ideias-relacionadas' || item === 'propor-ideia') setDesafioSelecionadoId('');
      setActiveItem(item);
    }
  }

  // Cadastrar a ideia no backend com o token do usuário autenticado
  async function handleSubmitIdea(
    novaIdeia: PropostaIdeia
  ) {
    if (!user || user.role !== 'colaborador') {
      throw new Error('Apenas colaboradores podem cadastrar ideias.');
    }

    await cadastrarIdeia({
      id_desafio: novaIdeia.desafioId ? Number(novaIdeia.desafioId) : null,
      titulo: novaIdeia.titulo,
      descricao: novaIdeia.descricao,
      area: novaIdeia.areaOrigem,
      categoria: novaIdeia.categoria,
      beneficio_esperado: novaIdeia.beneficioEsperado,
      problema_resolvido: novaIdeia.problemaResolvido,
    });

    setActiveItem('minhas-ideias');
  }

  // Exibe login quando não existe usuário autenticado
  if (!user) {
    return (
      <Login onLoginSuccess={handleLoginSuccess} />
    );
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
      onSwitchProfile={handleSwitchProfile}
      onLogout={handleLogout}
    >
      {/* Páginas do Colaborador */}
      {paginaAtual === 'desafios-abertos' && (
        <DesafiosAbertos onProporIdeia={(id) => {
          handleNavigate('propor-ideia');
          setDesafioSelecionadoId(id);
        }} />
      )}

      {paginaAtual === 'propor-ideia' && (
        <ProporIdeia onSubmit={handleSubmitIdea} desafioIdInicial={desafioSelecionadoId} onVoltar={() => handleNavigate('desafios-abertos')} />
      )}

      {paginaAtual === 'minhas-ideias' && (
        <MinhasIdeias />
      )}

      {/* Páginas do Gestor */}
      {paginaAtual === 'meus-desafios' && (
        <MeusDesafios
          gestorId={user.id}
          onIrParaNovoDesafio={() => handleNavigate('novo-desafio')}
          onEditar={(desafio) => {
            handleNavigate('novo-desafio');
            setDesafioEmEdicao(desafio);
          }}
          onIrParaIdeias={(id) => {
            handleNavigate('ideias-relacionadas');
            setDesafioSelecionadoId(id);
          }}
        />
      )}

      {paginaAtual === 'novo-desafio' && (
        <NovoDesafio
          key={desafioEmEdicao?.id ?? 'novo'}
          desafio={desafioEmEdicao}
          email={user.email}
          onVoltar={() =>
            handleNavigate('meus-desafios')
          }
        />
      )}

      {/* Página compartilhada entre Gestor e Analista */}
      {paginaAtual === 'ideias-relacionadas' && (
        <IdeiasRelacionadas
          key={JSON.stringify([user.id, user.role, desafioSelecionadoId])}
          desafioId={desafioSelecionadoId}
          gestorId={user.role === 'gestor' ? user.id : undefined}
        />
      )}

      {/* Página do Analista */}
      {paginaAtual === 'painel-avaliacao' &&
        user.role === 'analista' && (
          <PainelAvaliacaoIntegrado />
        )}

      {paginaAtual === 'cadastrar-usuario' &&
        user.role === 'analista' && (
          <CadastrarUsuario />
        )}

      {paginaAtual === 'match' &&
        user.role === 'analista' && (
          <Match user={user} />
        )}

      {paginaAtual === 'triagem' && user.role === 'analista' && (
        <TriagemIntegrada />
      )}

      {paginaAtual === 'kanban' && user.role === 'analista' && (
        <KanbanIntegrado />
      )}

      {paginaAtual === 'mvp' && user.role === 'analista' && (
        <MVP />
      )}

      {paginaAtual === 'dashboard' && (
        <Dashboard user={user} />
      )}

      {paginaAtual === 'resultados' && (
        <Resultados />
      )}

      {paginaAtual === 'auditoria' && user.role === 'analista' && (
        <Auditoria />
      )}

      {/* Páginas ainda não implementadas */}
      {![
        'desafios-abertos',
        'propor-ideia',
        'minhas-ideias',
        'meus-desafios',
        'novo-desafio',
        'ideias-relacionadas',
        'painel-avaliacao',
        'cadastrar-usuario',
        'match',
        'triagem',
        'kanban',
        'mvp',
        'dashboard',
        'resultados',
        'auditoria',
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
