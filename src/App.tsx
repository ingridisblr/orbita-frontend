// #region Importações
import { useState } from 'react';

import { Layout } from './components/common/Layout';
import type { NavigationItemId } from './components/common/Sidebar';

import { Login } from './pages/Login';
import { SelecionarPerfil } from './pages/SelecionarPerfil';

import type { User, UserRole } from './types/auth';
import { DesafiosAbertos } from './pages/DesafiosAbertos';
import { ProporIdeia } from './pages/ProporIdeia';
import { MinhasIdeias } from './pages/MinhasIdeias';

// #endregion

// #region Usuários de demonstração
const demoUsers: Record<UserRole, User> = {
  colaborador: {
    id:    'demo-colaborador',
    name:  'Pedro Alves',
    email: 'pedro.alves@example.com',
    role:  'colaborador',
    area:  'Administrativo',
  },
  gestor: {
    id:    'demo-gestor',
    name:  'Maria Souza',
    email: 'maria.souza@example.com',
    role:  'gestor',
    area:  'Administrativa',
  },
  analista: {
    id:    'demo-analista',
    name:  'Ana Lima',
    email: 'ana.lima@example.com',
    role:  'analista',
    area:  'Hub de Inovação',
  },
};
// #endregion

// #region Navegação
const initialPages: Record<UserRole, NavigationItemId> = {
  colaborador: 'desafios-abertos',
  gestor:       'meus-desafios',
  analista:    'painel-avaliacao',
};

const pageTitles: Record<NavigationItemId, string> = {
  'desafios-abertos':    'Desafios Abertos',
  'propor-ideia':        'Propor Ideia',
  'minhas-ideias':       'Minhas Ideias',
  'meus-desafios':       'Meus Desafios',
  'novo-desafio':        'Novo Desafio',
  'ideias-relacionadas': 'Ideias Relacionadas',
  'painel-avaliacao':    'Painel de Avaliação',
  match:                'Match Ideia × Desafio',
  triagem:              'Triagem / Priorização',
  kanban:               'Projetos / Kanban',
  mvp:                  'MVP',
  dashboard:            'Dashboard',
  resultados:           'Resultados',
  auditoria:            'Auditoria',
};
// #endregion

// #region Componente
export default function App() {
  // #region Estado
  const [enteredDemo, setEnteredDemo] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeItem, setActiveItem] =
    useState<NavigationItemId>('desafios-abertos');
  // #endregion

  // #region Eventos
  function handleSelectProfile(role: UserRole) {
    setUser(demoUsers[role]);
    setActiveItem(initialPages[role]);
  }

  function handleSwitchProfile() {
    setUser(null);
  }

  function handleLogout() {
    setUser(null);
    setEnteredDemo(false);
    setActiveItem('desafios-abertos');
  }
  // #endregion

  // #region Login
  if (!enteredDemo) {
    return (
      <Login onEnterDemo={() => setEnteredDemo(true)} />
    );
  }
  // #endregion

  // #region Seleção de perfil
  if (!user) {
    return (
      <SelecionarPerfil
        onSelectProfile={handleSelectProfile}
        onBack={handleLogout}
      />
    );
  }
  // #endregion

  // #region Área da aplicação
  return (
    <Layout
      user={user}
      activeItem={activeItem}
      onNavigate={setActiveItem}
      onSwitchProfile={handleSwitchProfile}
      onLogout={handleLogout}
    >
      {/* Renderização dinâmica das páginas do Colaborador */}
      {activeItem === 'desafios-abertos' && <DesafiosAbertos />}
      {activeItem === 'propor-ideia' && <ProporIdeia />}
      {activeItem === 'minhas-ideias' && <MinhasIdeias />}

      {/* Fallback apenas para páginas do menu que ainda não foram implementadas */}
      {activeItem !== 'desafios-abertos' && activeItem !== 'propor-ideia' && activeItem !== 'minhas-ideias' && (
        <div>
          <h1>{pageTitles[activeItem]}</h1>
          <p>O conteúdo desta página será implementado nas próximas etapas.</p>
        </div>
      )}
    </Layout>
  );
  // #endregion
}