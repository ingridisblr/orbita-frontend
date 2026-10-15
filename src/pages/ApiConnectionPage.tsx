import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Spinner } from '../components/common'
import { API_URL, describeApiError } from '../services/api'
import { getHealth } from '../services/healthService'
import type { HealthResponse } from '../types/api'
import './ApiConnectionPage.css'

type CheckState =
  | { phase: 'loading' }
  | { phase: 'ok'; data: HealthResponse; httpStatus: number; ms: number; at: string }
  | { phase: 'error'; message: string }

export function ApiConnectionPage() {
  const [state, setState] = useState<CheckState>({ phase: 'loading' })

  const [attempt, setAttempt] = useState(0)

  // A tela nasce em "loading"; o efeito consulta a API a cada nova tentativa.
  useEffect(() => {
    let cancelled = false
    const start = performance.now()
    getHealth()
      .then(({ data, status }) => {
        if (cancelled) return
        setState({
          phase: 'ok',
          data,
          httpStatus: status,
          ms: Math.round(performance.now() - start),
          at: new Date().toLocaleString('pt-BR'),
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ phase: 'error', message: describeApiError(error) })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => {
    setState({ phase: 'loading' })
    setAttempt((n) => n + 1)
  }

  return (
    <>
      <h1>Conexão com a API</h1>
      <p className="api__lead">Teste de comunicação entre o React e o Flask.</p>

      <section className="api__card" aria-labelledby="api-result">
        <h2 id="api-result">Resultado</h2>
        <dl className="api__meta">
          <dt>Rota chamada</dt>
          <dd><code>GET {API_URL ?? '(VITE_API_URL não definida)'}/health</code></dd>
        </dl>

        <div aria-live="polite">
          {state.phase === 'loading' && (
            <p className="api__loading"><Spinner size="sm" label="Consultando a API" /> Consultando a API…</p>
          )}

          {state.phase === 'ok' && (
            <>
              <Alert variant="success" title="Conexão estabelecida">
                O React recebeu a resposta do Flask.
              </Alert>
              <dl className="api__meta">
                <dt>Status HTTP</dt>
                <dd><Badge tone="success">{state.httpStatus}</Badge></dd>
                <dt>Tempo de resposta</dt>
                <dd>{state.ms} ms</dd>
                <dt>Consultado em</dt>
                <dd>{state.at}</dd>
                <dt>Resposta do backend</dt>
                <dd><pre className="api__json">{JSON.stringify(state.data, null, 2)}</pre></dd>
              </dl>
            </>
          )}

          {state.phase === 'error' && (
            <Alert variant="error" title="Falha na conexão">{state.message}</Alert>
          )}
        </div>

        <Button variant="secondary" onClick={retry} loading={state.phase === 'loading'}>
          Testar novamente
        </Button>
      </section>
    </>
  )
}
