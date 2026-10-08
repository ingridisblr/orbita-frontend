// #region Importações
import      { Button }                from '../components/common/Button';
import type { DemoProfile, UserRole } from '../types/auth';
import './SelecionarPerfil.css';
// #endregion

// #region Tipos
interface SelecionarPerfilProps {
  onSelectProfile: (role: UserRole) => void;
  onBack: () => void;
}
// #endregion

// #region Perfis de demonstração
const profiles: DemoProfile[] = [
  {
    role:        'colaborador',
    title:       'Colaborador',
    subtitle:    'Proponente de ideias',
    description:
      'Servidor que identifica oportunidades e propõe soluções para desafios abertos.',
    permissions: [
      'Visualizar desafios abertos',
      'Consultar detalhes de desafios',
      'Cadastrar novas ideias',
      'Editar suas próprias ideias',
      'Acompanhar status das suas ideias',
    ],
    restrictions: [],
  },
  {
    role:        'gestor',
    title:       'Gestor Demandante',
    subtitle:    'Responsável pela área',
    description:
      'Gestor que cadastra desafios da sua área e acompanha o progresso das soluções propostas.',
    permissions: [
      'Cadastrar e editar desafios da sua área',
      'Acompanhar seus desafios',
      'Visualizar ideias relacionadas',
      'Consultar status do processo',
    ],
      restrictions: [],
  },
  {
    role:        'analista',
    title:       'Analista / Hub',
    subtitle:    'Equipe de inovação',
    description:
      'Analista do hub de inovação responsável pela avaliação, match, priorização e gestão do portfólio.',
    permissions: [
      'Realizar match ideia × desafio',
      'Triagem e priorização com critérios',
      'Aprovar, devolver ou rejeitar',
      'Criar e acompanhar projetos (Kanban)',
      'MVP, Dashboard, Resultados e Auditoria',
    ],
    restrictions: [],
  },
];
// #endregion

// #region Componente
export function SelecionarPerfil({
  onSelectProfile,
  onBack,
}: SelecionarPerfilProps) {
  return (
    <main className="profile-page">
      {/* #region Cabeçalho */}
      <header className="profile-page__header">

        <h1>Selecionar perfil de simulação</h1>

        <p>
          Esta seleção é exclusiva para demonstração do protótipo.
          Em produção, o perfil é definido automaticamente pelo
          sistema de autenticação.
        </p>
      </header>
      {/* #endregion */}

      {/* #region Cartões */}
      <div className="profile-page__grid">
        {profiles.map((profile) => (
          <article
            key={profile.role}
            className="profile-card"
            aria-labelledby={`profile-title-${profile.role}`}
          >
            <header className="profile-card__header">
              <h2 id={`profile-title-${profile.role}`}>
                {profile.title}
              </h2>

              <p className="profile-card__subtitle">
                {profile.subtitle}
              </p>
            </header>

            <p className="profile-card__description">
              {profile.description}
            </p>

            <ul
              className="profile-card__permissions"
              aria-label="Permissões"
            >
              {profile.permissions.map((permission) => (
                <li key={permission}>
                  <span aria-hidden="true">✓</span>
                  <span>{permission}</span>
                </li>
              ))}
            </ul>

            {profile.restrictions.length > 0 && (
              <ul
                className="profile-card__restrictions"
                aria-label="Ações não permitidas"
              >
                {profile.restrictions.map((restriction) => (
                  <li key={restriction}>
                    <span aria-hidden="true">×</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="profile-card__footer">
              <Button
                variant="primary"
                className="profile-card__enter"
                onClick={() => onSelectProfile(profile.role)}
              >
                Entrar como {profile.title}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
      {/* #endregion */}

      {/* #region Rodapé */}
      <footer className="profile-page__footer">
        <Button variant="ghost" onClick={onBack}>
          Voltar ao login
        </Button>
      </footer>
      {/* #endregion */}
    </main>
  );
}
// #endregion