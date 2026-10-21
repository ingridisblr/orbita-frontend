
import { useState } from 'react';
import type { User } from '../../types/auth';
import logoOrbita from '../../assets/logo-orbita-sidebar.png';
import './Sidebar.css';



export type NavigationItemId =
  | 'desafios-abertos'
  | 'propor-ideia'
  | 'minhas-ideias'
  | 'meus-desafios'
  | 'novo-desafio'
  | 'ideias-relacionadas'
  | 'painel-avaliacao'
  | 'match'
  | 'triagem'
  | 'kanban'
  | 'mvp'
  | 'dashboard'
  | 'resultados'
  | 'auditoria'
  | 'cadastrar-usuario';

interface NavigationItem {
  id: NavigationItemId;
  label: string;
  icon: string;
}

interface SidebarProps {
  user: User;
  activeItem: NavigationItemId;
  onNavigate: (item: NavigationItemId) => void;
  onSwitchProfile: () => void;
  onLogout: () => void;
}
// #endregion

// #region Menus por perfil
const menus: Record<User['role'], NavigationItem[]> = {
  colaborador: [
    { id: 'desafios-abertos', label: 'Desafios Abertos', icon: '◈' },
    { id: 'propor-ideia',     label: 'Propor Ideia',     icon: '◎' },
    { id: 'minhas-ideias',    label: 'Minhas Ideias',    icon: '◐' },
  ],
  gestor: [
    { id: 'meus-desafios',      label: 'Meus Desafios',      icon: '◈' },
    { id: 'novo-desafio',       label: 'Novo Desafio',       icon: '+' },
    { id: 'ideias-relacionadas', label: 'Ideias Relacionadas', icon: '◎' },
  ],
  analista: [
    { id: 'painel-avaliacao', label: 'Painel de Avaliação',    icon: '◧' },
    { id: 'match',            label: 'Match',                 icon: '⇄' },
    { id: 'triagem',          label: 'Triagem / Priorização',  icon: '▦' },
    { id: 'kanban',           label: 'Projetos / Kanban',      icon: '▤' },
    { id: 'mvp',              label: 'MVP',                   icon: '◎' },
    { id: 'dashboard',        label: 'Dashboard',             icon: '▣' },
    { id: 'resultados',       label: 'Resultados',            icon: '◐' },
    { id: 'auditoria',        label: 'Auditoria',             icon: '⬡' },
    { id: 'cadastrar-usuario', label: 'Cadastrar Usuário', icon: '+' },
  ],
};

const roleNames: Record<User['role'], string> = {
  colaborador: 'Colaborador',
  gestor:      'Gestor Demandante',
  analista:    'Analista',
};
// #endregion

// #region Componente
export function Sidebar({
  user,
  activeItem,
  onNavigate,
  onSwitchProfile,
  onLogout,
}: SidebarProps) {
  // #region Estado
  const [menuExpanded, setMenuExpanded] = useState(false);
  // #endregion

  // #region Eventos
    function handleNavigate(item: NavigationItemId) {
    onNavigate(item);
    setMenuExpanded(false);
  }
  // #endregion

   // #region Renderização
  return (
    <aside className="sidebar">
      {/* #region Identidade */}
      <header className="sidebar__brand">
        <img
          src={logoOrbita}
          alt="Órbita"
          className="sidebar__logo"
        />

        <p className="sidebar__brand-caption">
          GESTÃO DE INOVAÇÃO
        </p>
      </header>
      {/* #endregion */}

      {/* #region Menu móvel */}
      <button
        type="button"
        className="sidebar__toggle"
        aria-expanded={menuExpanded}
        aria-controls="sidebar-navigation"
        onClick={() => setMenuExpanded(!menuExpanded)}
      >
        Menu
        <span aria-hidden="true">
          {menuExpanded ? '−' : '+'}
        </span>
      </button>
      {/* #endregion */}

      {/* #region Navegação */}
      <nav
        id="sidebar-navigation"
        className={
          menuExpanded
            ? 'sidebar__navigation sidebar__navigation--expanded'
            : 'sidebar__navigation'
        }
        aria-label="Menu principal"
      >
        {menus[user.role].map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activeItem === item.id
                ? 'sidebar__link sidebar__link--active'
                : 'sidebar__link'
            }
            aria-current={activeItem === item.id ? 'page' : undefined}
            onClick={() => handleNavigate(item.id)}
          >
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {/* #endregion */}

      {/* #region Usuário e sessão */}
      <footer className="sidebar__footer">
        <div className="sidebar__user">
          <p className="sidebar__user-name">{user.name}</p>

          <p className="sidebar__user-description">
            {roleNames[user.role]} · {user.area}
          </p>
        </div>

        <button
          type="button"
          className="sidebar__session-action"
          onClick={onSwitchProfile}
        >
          <span aria-hidden="true">⇄ </span>
          Trocar perfil
        </button>

        <button
          type="button"
          className="sidebar__session-action"
          onClick={onLogout}
        >
          Sair
        </button>
      </footer>
      {/* #endregion */}
    </aside>
  );
  // #endregion
}
// #endregion