import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Badge, Button, Card, Input, Modal, Select, Spinner, Textarea } from '../components/common'
import './ComponentsGuidePage.css'

const AREAS = [
  { value: 'ti', label: 'Tecnologia' },
  { value: 'ops', label: 'Operações' },
  { value: 'neg', label: 'Negócios' },
]

export function ComponentsGuidePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const emailError = submitted && !email.includes('@') ? 'Informe um e-mail válido, como nome@empresa.com.' : undefined

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (!email.includes('@')) return
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1500)
  }

  return (
    <>
      <h1>Guia de componentes</h1>
      <p className="guide__lead">Referência visual dos componentes compartilhados do ÓRBITA.</p>

      <Card title="Botões">
        <div className="guide__row">
          <Button>Salvar ideia</Button>
          <Button variant="secondary">Cancelar</Button>
          <Button variant="ghost">Ver detalhes</Button>
          <Button variant="danger">Descartar</Button>
          <Button disabled>Indisponível</Button>
          <Button loading>Entrando</Button>
        </div>
      </Card>

      <Card title="Campos de formulário">
        <form onSubmit={handleSubmit} noValidate className="guide__form">
          <Input
            label="E-mail corporativo"
            type="email"
            autoComplete="email"
            required
            hint="Use o e-mail cadastrado na empresa."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />
          <Select label="Área" options={AREAS} placeholder="Selecione uma área" required />
          <Textarea label="Descreva a ideia" hint="Explique o problema e a solução proposta." />
          <Button type="submit" loading={loading}>Enviar</Button>
        </form>
      </Card>

      <Card title="Avisos, selos e carregamento">
        <div className="guide__stack">
          <Alert variant="info" title="Sugestão da IA">A compatibilidade aguarda a validação do analista.</Alert>
          <Alert variant="success">Ideia enviada com sucesso.</Alert>
          <Alert variant="warning" title="Sessão expirada">Faça login novamente.</Alert>
          <Alert variant="error" title="Não foi possível entrar">E-mail ou senha incorretos.</Alert>
        </div>
        <div className="guide__row guide__row--spaced">
          <Badge>Rascunho</Badge>
          <Badge tone="info">Pendente</Badge>
          <Badge tone="success">Aprovada</Badge>
          <Badge tone="warning">Em triagem</Badge>
          <Badge tone="danger">Descartada</Badge>
          <Spinner label="Carregando dados" />
        </div>
      </Card>

      <Card title="Cartão e janela de confirmação">
        <p>O cartão agrupa conteúdo relacionado. A janela (modal) pede confirmação antes de uma ação importante.</p>
        <Button onClick={() => setModalOpen(true)}>Abrir janela de confirmação</Button>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirmar ação">
        <p>Deseja realmente prosseguir com o cadastro da demanda?</p>
        <div className="modal__actions">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
        </div>
      </Modal>
    </>
  )
}
