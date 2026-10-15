import { useSyncExternalStore } from 'react'
import { getState, subscribe } from '../services/orbitaStore'

/** Dados do ÓRBITA; a tela redesenha sozinha quando qualquer ação muda os dados. */
export function useOrbita() {
  return useSyncExternalStore(subscribe, getState)
}
