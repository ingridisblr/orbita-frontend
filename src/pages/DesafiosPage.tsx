import { useState } from 'react'
import { ActionFeedback, Badge, Button, Modal, Select } from '../components/common'
import { DesafioForm } from '../components/desafios/DesafioForm'
import type { DesafioFormValues } from '../components/desafios/DesafioForm'
import { IdeiaForm } from '../components/ideias/IdeiaForm'
import type { IdeiaFormValues } from '../components/ideias/IdeiaForm'
import { useActionRunner } from '../hooks/useActionRunner'
import { useAuth } from '../hooks/useAuth'
import { useOrbita } from '../hooks/useOrbita'
import * as store from '../services/orbitaStore'
import { AREAS, PRIORIDADE_TONE, PRIORIDADES, areaLabel } from '../types/orbita'
import type { Desafio } from '../types/orbita'
import { formatDate } from '../utils/format'
import './Pages.css'

type ModalState =
  | { kind: 'novo' }
  | { kind: 'editar'; desafio: Desafio }
  | { kind: 'ideia'; desafioId: string }
  | { kind: 'excluir'; desafio: Desafio }
  | null

export function DesafiosPage() {
  const { user } = useAuth()
  const { desafios, ideias } = useOrbita()
  const { error, notice, run, flash, clear } = useActionRunner()
  const [modal, setModal] = useState<ModalState>(null)
  const [status, setStatus] = useState('')
  const [area, setArea] = useState('')

  const abertos = desafios.filter((d) => d.status === 'aberto')
  const visiveis = desafios.filter((d) => (!status || d.status === status) && (!area || d.area === area))
  const closeModal = () => setModal(null)

  const handleCreate = (values: DesafioFormValues) => {
    store.createDesafio(values)
    closeModal()
    flash('Desafio cadastrado com sucesso.')
  }

  const handleEdit = (desafio: Desafio, values: DesafioFormValues) => {
    store.updateDesafio(desafio.id, values)
    closeModal()
    flash('Desafio atualizado.')
  }

  const handleIdea = (values: IdeiaFormValues) => {
    store.createIdeia(values)
    closeModal()
    flash('Ideia enviada. Ela aguarda a triagem do Hub de Inovação.')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Desafios</h1>
          <p className="page-lead">Gargalos e problemas que a empresa quer resolver com a ajuda de todos.</p>
        </div>
        <Button onClick={() => setModal({ kind: 'novo' })}>Novo desafio</Button>
      </div>

      <ActionFeedback error={error} notice={notice} onClear={clear} />

      <div className="filters">
        <Select
          label="Situação"
          placeholder="Todas"
          options={[{ value: 'aberto', label: 'Abertos' }, { value: 'encerrado', label: 'Encerrados' }]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Select label="Área" placeholder="Todas" options={AREAS} value={area} onChange={(e) => setArea(e.target.value)} />
      </div>

      {visiveis.length === 0 ? (
        <p className="empty">Nenhum desafio encontrado. Cadastre o primeiro em "Novo desafio".</p>
      ) : (
        <ul className="item-list">
          {visiveis.map((d) => {
            const total = ideias.filter((i) => i.desafioId === d.id).length
            const canManage = user?.role === 'admin' || user?.id === d.autorId
            return (
              <li key={d.id} className="item">
                <div className="item__head">
                  <h2 className="item__title">{d.titulo}</h2>
                  <Badge tone={d.status === 'aberto' ? 'success' : 'neutral'}>{d.status === 'aberto' ? 'Aberto' : 'Encerrado'}</Badge>
                  <Badge tone={PRIORIDADE_TONE[d.prioridade]}>
                    Prioridade {PRIORIDADES.find((p) => p.value === d.prioridade)?.label.toLowerCase()}
                  </Badge>
                  <Badge>{areaLabel(d.area)}</Badge>
                </div>
                <p className="item__meta">
                  Cadastrado por {d.autorNome} em {formatDate(d.criadoEm)} · {total} {total === 1 ? 'ideia vinculada' : 'ideias vinculadas'}
                </p>
                <p>{d.descricao}</p>
                <div className="item__actions">
                  {d.status === 'aberto' && (
                    <Button onClick={() => setModal({ kind: 'ideia', desafioId: d.id })}>Enviar ideia</Button>
                  )}
                  {canManage && (
                    <>
                      <Button variant="secondary" onClick={() => setModal({ kind: 'editar', desafio: d })}>Editar</Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          run(
                            () => store.setDesafioStatus(d.id, d.status === 'aberto' ? 'encerrado' : 'aberto'),
                            d.status === 'aberto' ? 'Desafio encerrado.' : 'Desafio reaberto.',
                          )
                        }
                      >
                        {d.status === 'aberto' ? 'Encerrar' : 'Reabrir'}
                      </Button>
                      <Button variant="danger" onClick={() => setModal({ kind: 'excluir', desafio: d })}>Excluir</Button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal isOpen={modal?.kind === 'novo'} onClose={closeModal} title="Novo desafio">
        {modal?.kind === 'novo' && <DesafioForm submitLabel="Cadastrar" onSubmit={handleCreate} onCancel={closeModal} />}
      </Modal>

      <Modal isOpen={modal?.kind === 'editar'} onClose={closeModal} title="Editar desafio">
        {modal?.kind === 'editar' && (
          <DesafioForm
            initial={{
              titulo: modal.desafio.titulo,
              descricao: modal.desafio.descricao,
              area: modal.desafio.area,
              prioridade: modal.desafio.prioridade,
            }}
            submitLabel="Salvar"
            onSubmit={(values) => handleEdit(modal.desafio, values)}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal isOpen={modal?.kind === 'ideia'} onClose={closeModal} title="Enviar ideia">
        {modal?.kind === 'ideia' && (
          <IdeiaForm desafiosAbertos={abertos} initialDesafioId={modal.desafioId} onSubmit={handleIdea} onCancel={closeModal} />
        )}
      </Modal>

      <Modal isOpen={modal?.kind === 'excluir'} onClose={closeModal} title="Excluir desafio">
        <p>
          Deseja realmente excluir <strong>{modal?.kind === 'excluir' ? modal.desafio.titulo : ''}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="modal__actions">
          <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (modal?.kind === 'excluir') run(() => store.deleteDesafio(modal.desafio.id), 'Desafio excluído.')
              closeModal()
            }}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  )
}
