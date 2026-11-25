
/* #region Importações */
import { useState } from 'react';

import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';

import type { DecisaoMatch, SugestaoIa } from '../../types/matchIa';

import './MatchCard.css';
/* #endregion */

/* #region Tipos */
interface MatchCardProps {
  sugestao: SugestaoIa;
  revisando?: boolean;
  erroRevisao?: string;
  onRevisar?: (
    decisao: DecisaoMatch,
    justificativa?: string
  ) => void | Promise<void>;
}
/* #endregion */

/* #region Constantes */
const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: 'Pendente de revisão',
  VALIDADO: 'Aprovado',
  DESCARTADO: 'Descartado',
};
/* #endregion */

/* #region Componente */
export function MatchCard({
  sugestao,
  revisando = false,
  erroRevisao,
  onRevisar,
}: MatchCardProps) {

  /* #region Estados */
  const [descartando, setDescartando] = useState(false);
  const [motivo, setMotivo] = useState('');
  /* #endregion */

  /* #region Validações */
  const pendente = sugestao.status === 'PENDENTE';
  const podeRevisar = pendente && Boolean(onRevisar);
  /* #endregion */

  /* #region Eventos */
  function confirmarDescarte() {
    if (!motivo.trim()) return;

    onRevisar?.('descartar', motivo.trim());
  }
  /* #endregion */

  /* #region Renderização */
  return (
    <article className="sugestao-card">

      {/* #region Cabeçalho */}
      <header className="sugestao-card__header">
        <div className="sugestao-card__identidade">
          <span className="sugestao-card__label">
            IDEIA PROPOSTA
          </span>

          <h3 className="sugestao-card__title">
            {sugestao.ideiaTitulo}
          </h3>
        </div>

        <div className="sugestao-card__score">
          <strong>{sugestao.scorePercentual}%</strong>
          <span>compatível</span>
        </div>
      </header>
      {/* #endregion */}

      {/* #region Barra de compatibilidade */}
      <div
        className="sugestao-card__bar"
        role="img"
        aria-label={`Compatibilidade de ${sugestao.scorePercentual}%`}
      >
        <div
          className="sugestao-card__bar-fill"
          style={{ width: `${sugestao.scorePercentual}%` }}
        />
      </div>
      {/* #endregion */}

      {/* #region Justificativa */}
      <p className="sugestao-card__justificativa">
        {sugestao.justificativa}
      </p>
      {/* #endregion */}

      {/* #region Identificação e status */}
      <footer className="sugestao-card__footer">
        <span className="sugestao-card__codigo">
          {sugestao.ideiaId}
        </span>

        <Badge variant="neutral">
          {ROTULO_STATUS[sugestao.status] ?? sugestao.status}
        </Badge>
      </footer>
      {/* #endregion */}

      {/* #region Ações de revisão */}
      {podeRevisar && !descartando && (
        <div className="sugestao-card__acoes">
          <Button
            isLoading={revisando}
            loadingText="Salvando..."
            onClick={() => onRevisar?.('validar')}
          >
            Aprovar
          </Button>

          <Button
            variant="secondary"
            disabled={revisando}
            onClick={() => setDescartando(true)}
          >
            Descartar
          </Button>
        </div>
      )}
      {/* #endregion */}

      {/* #region Formulário de descarte */}
      {podeRevisar && descartando && (
        <div className="sugestao-card__descarte">
          <Textarea
            label="Motivo do descarte"
            rows={3}
            value={motivo}
            maxLength={5000}
            onChange={(evento) => setMotivo(evento.target.value)}
          />

          <div className="sugestao-card__acoes">
            <Button
              isLoading={revisando}
              loadingText="Salvando..."
              disabled={!motivo.trim()}
              onClick={confirmarDescarte}
            >
              Confirmar descarte
            </Button>

            <Button
              variant="ghost"
              disabled={revisando}
              onClick={() => setDescartando(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {/* #endregion */}

      {/* #region Mensagem de erro */}
      {erroRevisao && (
        <p className="sugestao-card__erro" role="alert">
          {erroRevisao}
        </p>
      )}
      {/* #endregion */}

    </article>
  );
  /* #endregion */
}
/* #endregion */
