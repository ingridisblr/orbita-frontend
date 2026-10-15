import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Brand } from './Brand'
import './Sidebar.css'

export interface SidebarItem {
  id: string
  label: string
}

interface SidebarProps {
  id: string
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  /** Em telas pequenas o menu abre sobre o conteúdo. */
  isOpen: boolean
  onClose: () => void
  footer?: ReactNode
}

export function Sidebar({ id, items, activeId, onSelect, isOpen, onClose, footer }: SidebarProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      <div className="sidebar-backdrop" data-visible={isOpen} onClick={onClose} aria-hidden="true" />
      <aside id={id} className="sidebar" data-open={isOpen}>
        <div className="sidebar__header">
          <Brand />
          <button type="button" className="sidebar__close" onClick={onClose} aria-label="Fechar menu">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav aria-label="Navegação principal">
          <ul className="sidebar__list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="sidebar__item"
                  aria-current={item.id === activeId ? 'page' : undefined}
                  onClick={() => onSelect(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {footer && <div className="sidebar__footer">{footer}</div>}
      </aside>
    </>
  )
}
