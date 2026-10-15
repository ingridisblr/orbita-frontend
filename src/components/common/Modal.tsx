import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

// Usa o elemento nativo <dialog>: o navegador cuida do foco preso dentro do modal,
// do fechamento com Esc e do bloqueio da página ao fundo.
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Clique no fundo escurecido (fora do conteúdo) fecha o modal.
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="modal__header">
        <h2 id={titleId} className="modal__title">{title}</h2>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar janela">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="modal__body">{children}</div>
    </dialog>
  )
}
