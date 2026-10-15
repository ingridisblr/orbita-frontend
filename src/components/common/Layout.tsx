import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Sidebar } from './Sidebar'
import type { SidebarItem } from './Sidebar'
import './Layout.css'

interface LayoutProps {
  menuItems: SidebarItem[]
  activeId: string
  onNavigate: (id: string) => void
  userName: string
  profileLabel: string
  onLogout: () => void
  children: ReactNode
}

const MENU_ID = 'menu-principal'

export function Layout({ menuItems, activeId, onNavigate, userName, profileLabel, onLogout, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  const closeMenu = () => {
    setMenuOpen(false)
    toggleRef.current?.focus()
  }

  const handleSelect = (id: string) => {
    onNavigate(id)
    setMenuOpen(false)
    mainRef.current?.focus()
  }

  return (
    <div className="layout">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Sidebar
        id={MENU_ID}
        items={menuItems}
        activeId={activeId}
        onSelect={handleSelect}
        isOpen={menuOpen}
        onClose={closeMenu}
      />
      <div className="layout__body">
        <header className="layout__header">
          <button
            ref={toggleRef}
            type="button"
            className="layout__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="visually-hidden">Menu</span>
          </button>
          <div className="layout__user">
            <span className="layout__user-name">{userName}</span>
            <Badge tone="info">{profileLabel}</Badge>
          </div>
          <Button variant="secondary" onClick={onLogout}>Sair</Button>
        </header>
        <main id="conteudo" className="layout__main" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
