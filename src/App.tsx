
import { useState } from 'react';

// Componentes comuns
import { Layout } from './components/common/Layout';
import type { NavigationItemId } from './components/common/Sidebar';

// Autenticação
import { Login } from './pages/Login';
import { getCurrentUser, logout } from './services/authService';

// Páginas do Colaborador
import { DesafiosAbertos } from './pages/DesafiosAbertos';
import { ProporIdeia } from './pages/ProporIdeia';
import { MinhasIdeias } from './pages/MinhasIdeias';

// Páginas do Gestor
import { MeusDesafios } from './pages/MeusDesafios';
import { NovoDesafio } from './pages/NovoDesafio';
import { IdeiasRelacionadas } from './pages/IdeiasRelacionadas';

// Página do Analista
import CadastrarUsuario from './pages/CadastrarUsuario';

// Tipos
import type { User, UserRole } from './types/auth';
import type { Ideia } from './types/ideia';

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

  // Estado compartilhado das ideias
  const [ideias, setIdeias] = useState<Ideia[]>([]);

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
    setIdeias([]);
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
      setActiveItem(item);
    }
  }

  // Cadastrar uma ideia enviada pelo formulário
  function handleSubmitIdea(
    novaIdeia: Omit<
      Ideia,
      'id' | 'status' | 'data' | 'usuarioId'
    >
  ) {
    if (!user || user.role !== 'colaborador') {
      return;
    }

    const ideiaCompleta: Ideia = {
      ...novaIdeia,
      id: crypto.randomUUID(),
      status: 'Submetida',
      data: new Date().toLocaleDateString('pt-BR'),
      usuarioId: user.id,
    };

    setIdeias((ideiasAnteriores) => [
      ...ideiasAnteriores,
      ideiaCompleta,
    ]);

    // Após o cadastro, abre a listagem
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

  // Exibe somente as ideias do usuário atual
  const minhasIdeias = ideias.filter(
    (ideia) => ideia.usuarioId === user.id
  );

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
        <DesafiosAbertos />
      )}

      {paginaAtual === 'propor-ideia' && (
        <ProporIdeia onSubmit={handleSubmitIdea} />
      )}

      {paginaAtual === 'minhas-ideias' && (
        <MinhasIdeias ideias={minhasIdeias} />
      )}

      {/* Páginas do Gestor */}
      {paginaAtual === 'meus-desafios' && (
        <MeusDesafios
          onIrParaNovoDesafio={() =>
            handleNavigate('novo-desafio')
          }
        />
      )}

      {paginaAtual === 'novo-desafio' && (
        <NovoDesafio
          onVoltar={() =>
            handleNavigate('meus-desafios')
          }
        />
      )}

      {/* Página compartilhada entre Gestor e Analista */}
      {paginaAtual === 'ideias-relacionadas' && (
        <IdeiasRelacionadas />
      )}

      {/* Página do Analista */}
      {paginaAtual === 'cadastrar-usuario' &&
        user.role === 'analista' && (
          <CadastrarUsuario />
        )}

      {/* Páginas ainda não implementadas */}
      {![
        'desafios-abertos',
        'propor-ideia',
        'minhas-ideias',
        'meus-desafios',
        'novo-desafio',
        'ideias-relacionadas',
        'cadastrar-usuario',
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
