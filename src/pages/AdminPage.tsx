import { useState } from 'react'
import { Alert, Badge, Button, Card, Modal } from '../components/common'
import { useAuth } from '../hooks/useAuth'
import { changeRole, listUsers, removeUser } from '../services/authService'
import { ROLE_LABEL } from '../types/auth'
import type { Role, User } from '../types/auth'
import './AdminPage.css'

export function AdminPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>(() => listUsers())
  const [error, setError] = useState('')
  const [toRemove, setToRemove] = useState<User | null>(null)

  const admins = users.filter((u) => u.role === 'admin').length

  // Executa a ação, mostra o erro (se houver) e recarrega a lista.
  const run = (action: () => void) => {
    setError('')
    try {
      action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.')
    }
    setUsers(listUsers())
  }

  const handleRole = (target: User, role: Role) => run(() => changeRole(target.id, role))

  const confirmRemove = () => {
    if (toRemove) run(() => removeUser(toRemove.id))
    setToRemove(null)
  }

  return (
    <>
      <h1>Usuários</h1>
      <p className="admin__lead">Gerencie as pessoas que têm acesso à plataforma.</p>

      {error && (
        <div className="admin__alert">
          <Alert variant="error" title="Ação não realizada" onClose={() => setError('')}>{error}</Alert>
        </div>
      )}

      <div className="admin__stats">
        <Card title="Total de contas"><p className="admin__number">{users.length}</p></Card>
        <Card title="Administradores"><p className="admin__number">{admins}</p></Card>
        <Card title="Usuários"><p className="admin__number">{users.length - admins}</p></Card>
      </div>

      <Card title="Contas cadastradas">
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfil</th>
                <th scope="col">Cadastro</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me?.id
                return (
                  <tr key={u.id}>
                    <td>{u.name}{isMe && ' (você)'}</td>
                    <td>{u.email}</td>
                    <td><Badge tone={u.role === 'admin' ? 'info' : 'neutral'}>{ROLE_LABEL[u.role]}</Badge></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {isMe ? (
                        <span className="admin__muted">—</span>
                      ) : (
                        <div className="admin__actions">
                          <Button
                            variant="secondary"
                            onClick={() => handleRole(u, u.role === 'admin' ? 'usuario' : 'admin')}
                          >
                            {u.role === 'admin' ? 'Tornar usuário' : 'Tornar administrador'}
                          </Button>
                          <Button variant="danger" onClick={() => setToRemove(u)}>Remover</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={toRemove !== null} onClose={() => setToRemove(null)} title="Remover conta">
        <p>
          Deseja realmente remover a conta de <strong>{toRemove?.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="modal__actions">
          <Button variant="secondary" onClick={() => setToRemove(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmRemove}>Remover</Button>
        </div>
      </Modal>
    </>
  )
}
