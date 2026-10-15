import { useState } from 'react'
import { Layout } from './components/common'
import type { SidebarItem } from './components/common'
import { useAuth } from './hooks/useAuth'
import { ROLE_LABEL } from './types/auth'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { AdminPage } from './pages/AdminPage'
import { ApiConnectionPage } from './pages/ApiConnectionPage'
import { AuditoriaPage } from './pages/AuditoriaPage'
import { ComponentsGuidePage } from './pages/ComponentsGuidePage'
import { DashboardPage } from './pages/DashboardPage'
import { DesafiosPage } from './pages/DesafiosPage'
import { IdeiasPage } from './pages/IdeiasPage'
import { KanbanPage } from './pages/KanbanPage'
import { LoginPage } from './pages/LoginPage'
import { MatchesPage } from './pages/MatchesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { TriagemPage } from './pages/TriagemPage'
import { UserHomePage } from './pages/UserHomePage'

const USER_MENU: SidebarItem[] = [
  { id: 'inicio', label: 'Minha área' },
  { id: 'desafios', label: 'Desafios' },
  { id: 'ideias', label: 'Minhas ideias' },
]

const ADMIN_MENU: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'desafios', label: 'Desafios' },
  { id: 'ideias', label: 'Ideias' },
  { id: 'matches', label: 'Matches da IA' },
  { id: 'triagem', label: 'Triagem' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'auditoria', label: 'Auditoria' },
  { id: 'usuarios', label: 'Usuários' },
  { id: 'api', label: 'Conexão com a API' },
  { id: 'guia', label: 'Guia de componentes' },
]

// Páginas que só o administrador (Hub de Inovação) pode abrir. Ficam protegidas mesmo fora do menu.
const ADMIN_ONLY = ['dashboard', 'matches', 'triagem', 'kanban', 'auditoria', 'usuarios', 'api', 'guia']

function App() {
  const { user, logout } = useAuth()
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login')
  // null = página inicial do perfil (dashboard para admin, "Minha área" para usuário).
  const [activeId, setActiveId] = useState<string | null>(null)

  if (!user) {
    return authScreen === 'login' ? (
      <LoginPage onGoRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterPage onGoLogin={() => setAuthScreen('login')} />
    )
  }

  const isAdmin = user.role === 'admin'
  const currentId = activeId ?? (isAdmin ? 'dashboard' : 'inicio')
  const goHome = () => setActiveId(null)
  const handleLogout = () => {
    logout()
    setActiveId(null)
    setAuthScreen('login')
  }

  const renderPage = () => {
    if (ADMIN_ONLY.includes(currentId) && !isAdmin) return <AccessDeniedPage onBack={goHome} />
    switch (currentId) {
      case 'inicio': return <UserHomePage onNavigate={setActiveId} />
      case 'desafios': return <DesafiosPage />
      case 'ideias': return <IdeiasPage />
      case 'dashboard': return <DashboardPage />
      case 'matches': return <MatchesPage />
      case 'triagem': return <TriagemPage />
      case 'kanban': return <KanbanPage />
      case 'auditoria': return <AuditoriaPage />
      case 'usuarios': return <AdminPage />
      case 'api': return <ApiConnectionPage />
      case 'guia': return <ComponentsGuidePage />
      default: return <NotFoundPage onBack={goHome} />
    }
  }

  return (
    <Layout
      menuItems={isAdmin ? ADMIN_MENU : USER_MENU}
      activeId={currentId}
      onNavigate={setActiveId}
      userName={user.name}
      profileLabel={ROLE_LABEL[user.role]}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  )
}

export default App
