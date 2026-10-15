import { Button } from '../components/common'
import './StatusPage.css'

export function AccessDeniedPage({ onBack }: { onBack: () => void }) {
  return (
    <section className="status-page">
      <p className="status-page__code" aria-hidden="true">403</p>
      <h1>Acesso negado</h1>
      <p>Seu perfil não tem permissão para abrir esta página.</p>
      <Button onClick={onBack}>Ir para a minha página inicial</Button>
    </section>
  )
}
