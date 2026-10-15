/** Monta o aria-describedby de um campo a partir da dica e do erro. */
export function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ')
  return ids || undefined
}
