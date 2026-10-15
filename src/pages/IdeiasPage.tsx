import { useState } from 'react'
import { ActionFeedback, Badge, Button, Modal, Select } from '../components/common'
import { IdeiaForm } from '../components/ideias/IdeiaForm'
import type { IdeiaFormValues } from '../components/ideias/IdeiaForm'
import { useActionRunner } from '../hooks/useActionRunner'
import { useAuth } from '../hooks/useAuth'
import { useOrbita } from '../hooks/useOrbita'
import * as store from '../services/orbitaStore'
import { IDEIA_STATUS_LABEL, IDEIA_STATUS_TONE, KANBAN_COLUNAS } from '../types/orbita'
import type { Ideia } from '../types/orbita'
import { formatDate } from '../utils/format'
import './Pages.css'

export function IdeiasPage() {
  const { user } = useAuth()
  const { ideias, desafios, projetos } = useOrbita()
  const { error, notice, run, flash, clear } = useActionRunner()
  const [novaOpen, setNovaOpen] = useState(false)
  const [remover, setRemover] = useState<Ideia | null>(null)
  const [status, setStatus] = useState('')

  const isAdmin = user?.role === 'admin'
  const visiveis = ideias.filter((i) => (isAdmin || i.autorId === user?.id) && (!status || i.status === status))

  const handleCreate = (values: IdeiaFormValues) => {
    store.createIdeia(values)
    setNovaOpen(false)
    flash('Ideia enviada. Ela aguarda a triagem do Hub de Inovação.')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isAdmin ? 'Ideias' : 'Minhas ideias'}</h1>
          <p className="page-lead">
            {isAdmin ? 'Todas as ideias enviadas à plataforma.' : 'Envie propostas de solução e acompanhe o andamento de cada uma.'}
          </p>
        </div>
        <Button onClick={() => setNovaOpen(true)}>Nova ideia</Button>
      </div>

      <ActionFeedback error={error} notice={notice} onClear={clear} />

      <div className="filters">
        <Select
          label="Situação"
          placeholder="Todas"
          options={(Object.keys(IDEIA_STATUS_LABEL) as (keyof typeof IDEIA_STATUS_LABEL)[]).map((value) => ({
            value,
            label: IDEIA_STATUS_LABEL[value],
          }))}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="empty">Nenhuma ideia por aqui ainda. Use "Nova ideia" para enviar a primeira.</p>
      ) : (
        <ul className="item-list">
          {visiveis.map((i) => {
            const desafio = desafios.find((d) => d.id === i.desafioId)
            const projeto = projetos.find((p) => p.ideiaId === i.id)
            const canRemove = isAdmin || (i.autorId === user?.id && i.status === 'enviada')
            return (
              <li key={i.id} className="item">
                <div className="item__head">
                  <h2 className="item__title">{i.titulo}</h2>
                  <Badge tone={IDEIA_STATUS_TONE[i.status]}>{IDEIA_STATUS_LABEL[i.status]}</Badge>
                  {projeto && <Badge tone="info">Kanban: {KANBAN_COLUNAS.find((c) => c.id === projeto.coluna)?.label}</Badge>}
                </div>
                <p className="item__meta">
                  {isAdmin && `${i.autorNome} · `}Enviada em {formatDate(i.criadoEm)} ·{' '}
                  {desafio ? `Desafio: ${desafio.titulo}` : 'Sem desafio vinculado'}
                </p>
                <p>{i.descricao}</p>
                {i.triagem && (
                  <p className="item__note">
                    <strong>Triagem: nota {i.triagem.notaFinal} de 5</strong> por {i.triagem.analistaNome}.
                    {i.triagem.parecer && ` Parecer: ${i.triagem.parecer}`}
                  </p>
                )}
                {canRemove && (
                  <div className="item__actions">
                    <Button variant="danger" onClick={() => setRemover(i)}>{isAdmin ? 'Excluir' : 'Retirar ideia'}</Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Modal isOpen={novaOpen} onClose={() => setNovaOpen(false)} title="Nova ideia">
        {novaOpen && (
          <IdeiaForm
            desafiosAbertos={desafios.filter((d) => d.status === 'aberto')}
            onSubmit={handleCreate}
            onCancel={() => setNovaOpen(false)}
          />
        )}
      </Modal>

      <Modal isOpen={remover !== null} onClose={() => setRemover(null)} title="Retirar ideia">
        <p>
          Deseja realmente remover <strong>{remover?.titulo}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="modal__actions">
          <Button variant="secondary" onClick={() => setRemover(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (remover) run(() => store.deleteIdeia(remover.id), 'Ideia removida.')
              setRemover(null)
            }}
          >
            Remover
          </Button>
        </div>
      </Modal>
    </>
  )
}
