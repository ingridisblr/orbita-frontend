import { useState } from 'react'

/** Executa uma ação, guarda a mensagem de erro ou de sucesso para mostrar na tela. */
export function useActionRunner() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const run = (action: () => void, success?: string): boolean => {
    setError('')
    setNotice('')
    try {
      action()
      if (success) setNotice(success)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.')
      return false
    }
  }

  const clear = () => {
    setError('')
    setNotice('')
  }

  return { error, notice, run, flash: setNotice, clear }
}
