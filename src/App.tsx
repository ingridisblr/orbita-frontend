
import   { useState }             from 'react';

// Componentes comuns
import      { Layout }            from './components/common/Layout';
import type { NavigationItemId }  from './components/common/Sidebar';

<<<<<<< Updated upstream
// Autenticação
import      { Login }              from './pages/Login';
import      { SelecionarPerfil }   from './pages/SelecionarPerfil';
=======
import type { User, UserRole } from './types/auth';
import { DesafiosAbertos } from './pages/DesafiosAbertos';
import { ProporIdeia } from './pages/ProporIdeia';
import { MinhasIdeias } from './pages/MinhasIdeias';
import { MeusDesafios } from './pages/MeusDesafios';
import { NovoDesafio } from './pages/NovoDesafio';
import { IdeiasRelacionadas } from './pages/IdeiasRelacionadas';
import CadastrarUsuario from './pages/CadastrarUsuario';
>>>>>>> Stashed changes

// Páginas do Colaborador
import      { DesafiosAbertos }    from './pages/DesafiosAbertos';
import      { ProporIdeia }        from './pages/ProporIdeia';
import      { MinhasIdeias }       from './pages/MinhasIdeias';

// Páginas do Gestor
import      { MeusDesafios }       from './pages/MeusDesafios';
import      { NovoDesafio }        from './pages/NovoDesafio';
import      { IdeiasRelacionadas } from './pages/IdeiasRelacionadas';

// Tipos
import type { User, UserRole }     from './types/auth';
import type { Ideia }              from './types/ideia';

// Usuários de demonstração
const demoUsers: Record<UserRole, User> = {
  colaborador: {
    id: 'demo-colaborador',
    name: 'Pedro Alves',
    email: 'pedro.alves@example.com',
    role: 'colaborador',
    area: 'Administrativo',
  },

  gestor: {
    id: 'demo-gestor',
    name: 'Maria Souza',
    email: 'maria.souza@example.com',
    role: 'gestor',
    area: 'Administrativa',
  },

  analista: {
    id: 'demo-analista',
    name: 'Ana Lima',
    email: 'ana.lima@example.com',
    role: 'analista',
    area: 'Hub de Inovação',
  },
};

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
<<<<<<< Updated upstream
  'painel-avaliacao': 'Painel de Avaliação',
  match: 'Match Ideia × Desafio',
  triagem: 'Triagem / Priorização',
  kanban: 'Projetos / Kanban',
  mvp: 'MVP',
  dashboard: 'Dashboard',
  resultados: 'Resultados',
  auditoria: 'Auditoria',
=======
  'painel-avaliacao':    'Painel de Avaliação',
  'cadastrar-usuario':   'Cadastrar Usuário',
  match:                'Match Ideia × Desafio',
  triagem:              'Triagem / Priorização',
  kanban:               'Projetos / Kanban',
  mvp:                  'MVP',
  dashboard:            'Dashboard',
  resultados:           'Resultados',
  auditoria:            'Auditoria',
>>>>>>> Stashed changes
};

export default function App() {
  // Estado da aplicação
  const [enteredDemo, setEnteredDemo] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const [activeItem, setActiveItem] =
    useState<NavigationItemId>('desafios-abertos');

  // Estado compartilhado das ideias
  const [ideias, setIdeias] = useState<Ideia[]>([]);

  // Selecionar perfil de demonstração
  function handleSelectProfile(role: UserRole) {
    const usuarioSelecionado = demoUsers[role];

    setUser(usuarioSelecionado);
    setActiveItem(initialPages[role]);
  }

  // Voltar à seleção de perfil
  function handleSwitchProfile() {
    setUser(null);
    setActiveItem('desafios-abertos');
  }

  // Sair da demonstração
  function handleLogout() {
    setUser(null);
    setEnteredDemo(false);
    setActiveItem('desafios-abertos');
  }

  // Navegação com verificação de perfil
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

  // Tela de entrada
  if (!enteredDemo) {
    return (
      <Login
        onEnterDemo={() => setEnteredDemo(true)}
      />
    );
  }

  // Seleção de perfil
  if (!user) {
    return (
      <SelecionarPerfil
        onSelectProfile={handleSelectProfile}
        onBack={handleLogout}
      />
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
        <ProporIdeia
          onSubmit={handleSubmitIdea}
        />
      )}

      {paginaAtual === 'minhas-ideias' && (
        <MinhasIdeias
          ideias={minhasIdeias}
        />
      )}

      {/* Páginas do Gestor */}
      {paginaAtual === 'meus-desafios' && (
        <MeusDesafios
          onIrParaNovoDesafio={() =>
            handleNavigate('novo-desafio')
          }
        />
      )}

<<<<<<< Updated upstream
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
=======
      {/* Páginas do Analista */}
      {activeItem === 'cadastrar-usuario' && user.role === 'analista' && (<CadastrarUsuario />)}

      {/* Fallback para páginas ainda não implementadas */}
      {activeItem !== 'desafios-abertos' && 
       activeItem !== 'propor-ideia' && 
       activeItem !== 'minhas-ideias' && 
       activeItem !== 'meus-desafios' && 
       activeItem !== 'novo-desafio' &&
       activeItem !== 'ideias-relacionadas' && 
       activeItem !== 'cadastrar-usuario' && (
        <div>
          <h1>{pageTitles[activeItem]}</h1>
          <p>O conteúdo desta página será implementado nas próximas etapas.</p>
        </div>
>>>>>>> Stashed changes
      )}
    </Layout>
  );
}
