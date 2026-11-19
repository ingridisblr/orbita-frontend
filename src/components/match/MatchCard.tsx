import { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import type { DecisaoMatch, SugestaoIa } from '../../types/matchIa';
import './MatchCard.css';

interface MatchCardProps {
  sugestao: SugestaoIa;
  revisando?: boolean;
  erroRevisao?: string;
  onRevisar?: (decisao: DecisaoMatch, justificativa?: string) => void | Promise<void>;
}

const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: 'Pendente de revisão',
  VALIDADO: 'Aprovado',
  DESCARTADO: 'Descartado',
};

export function MatchCard({
  sugestao,
  revisando = false,
  erroRevisao,
  onRevisar,
}: MatchCardProps) {
  const [descartando, setDescartando] = useState(false);
  const [motivo, setMotivo] = useState('');

  const pendente = sugestao.status === 'PENDENTE';
  const podeRevisar = pendente && Boolean(onRevisar);

  function confirmarDescarte() {
    if (!motivo.trim()) return;
    onRevisar?.('descartar', motivo.trim());
  }

  return (
    <article className="sugestao-card">
      <header className="sugestao-card__header">
        <h3 className="sugestao-card__title">{sugestao.ideiaTitulo}</h3>
        <Badge variant="primary">{sugestao.scorePercentual}% compatível</Badge>
      </header>

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

      <p className="sugestao-card__justificativa">{sugestao.justificativa}</p>

      <footer className="sugestao-card__footer">
        <Badge variant="outlined">Ideia #{sugestao.ideiaId}</Badge>
        <Badge variant="neutral">
          {ROTULO_STATUS[sugestao.status] ?? sugestao.status}
        </Badge>
      </footer>

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

      {erroRevisao && (
        <p className="sugestao-card__erro" role="alert">
          {erroRevisao}
        </p>
      )}
    </article>
  );
}
