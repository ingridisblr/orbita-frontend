import type { ReactNode } from 'react'
import { useId } from 'react'
import './Card.css'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  const titleId = useId()
  return (
    <section className={`card ${className ?? ''}`.trim()} aria-labelledby={title ? titleId : undefined}>
      {title && <h2 id={titleId} className="card__title">{title}</h2>}
      {children}
    </section>
  )
}
