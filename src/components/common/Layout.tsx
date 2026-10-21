// #region Importações
import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import type { NavigationItemId } from './Sidebar';

import type { User } from '../../types/auth';
import './Layout.css';
// #endregion

// #region Tipos
interface LayoutProps {
  user: User;
  activeItem: NavigationItemId;
  onNavigate: (item: NavigationItemId) => void;
  onSwitchProfile: () => void;
  onLogout: () => void;
  children: ReactNode;
}
// #endregion

// #region Componente
export function Layout({
  user,
  activeItem,
  onNavigate,
  onSwitchProfile,
  onLogout,
  children,
}: LayoutProps) {
  return (
    <div className="app-layout">
      {/* #region Link de acessibilidade */}
      <a className="app-layout__skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      {/* #endregion */}

      {/* #region Menu lateral */}
      <Sidebar
        user={user}
        activeItem={activeItem}
        onNavigate={onNavigate}
        onSwitchProfile={onSwitchProfile}
        onLogout={onLogout}
      />
      {/* #endregion */}

      {/* #region Conteúdo da página */}
      <main
        id="main-content"
        className="app-layout__main"
        tabIndex={-1}
      >
        <div className="app-layout__content">
          {children}
        </div>
      </main>
      {/* #endregion */}
    </div>
  );
}
// #endregion