import { Button, Card } from '../components/common'
import { useAuth } from '../hooks/useAuth'
import { useOrbita } from '../hooks/useOrbita'
import { ROLE_LABEL } from '../types/auth'
import './UserHomePage.css'

export function UserHomePage({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { user } = useAuth()
  const { desafios, ideias } = useOrbita()
  if (!user) return null

  const minhasIdeias = ideias.filter((i) => i.autorId === user.id)
  const resumo = [
    { label: 'Desafios abertos', value: desafios.filter((d) => d.status === 'aberto').length },
    { label: 'Minhas ideias', value: minhasIdeias.length },
    { label: 'Ideias aprovadas', value: minhasIdeias.filter((i) => i.status === 'aprovada').length },
  ]

  return (
    <>
      <h1>Olá, {user.name.split(' ')[0]}!</h1>
      <p className="user-home__lead">Esta é a sua área na plataforma ÓRBITA.</p>

      <div className="user-home__summary">
        {resumo.map((r) => (
          <Card key={r.label}>
            <p className="user-home__label">{r.label}</p>
            <p className="user-home__number">{r.value}</p>
          </Card>
        ))}
      </div>

      <Card title="Por onde começar">
        <p>Veja os problemas que a empresa quer resolver e proponha uma solução, ou cadastre um desafio da sua área.</p>
        <div className="user-home__actions">
          <Button onClick={() => onNavigate('desafios')}>Ver desafios</Button>
          <Button variant="secondary" onClick={() => onNavigate('ideias')}>Minhas ideias</Button>
        </div>
      </Card>

      <Card title="Meus dados">
        <dl className="user-home__data">
          <dt>Nome</dt>
          <dd>{user.name}</dd>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>Perfil</dt>
          <dd>{ROLE_LABEL[user.role]}</dd>
          <dt>Membro desde</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</dd>
        </dl>
      </Card>
    </>
  )
}
