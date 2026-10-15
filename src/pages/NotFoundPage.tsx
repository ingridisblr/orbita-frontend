import { Button } from '../components/common'
import './StatusPage.css'

export function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <section className="status-page">
      <p className="status-page__code" aria-hidden="true">404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço que você abriu não existe ou foi movido.</p>
      <Button onClick={onBack}>Voltar ao início</Button>
    </section>
  )
}
