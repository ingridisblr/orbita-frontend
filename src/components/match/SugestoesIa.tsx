import { useMemo, useState } from 'react';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { useMatchIA } from '../../hooks/useMatchIA';
import type { Desafio } from '../../types/desafio';
import { DesafioSelector } from './DesafioSelector';
import { MatchCard } from './MatchCard';
import './SugestoesIa.css';

interface SugestoesIaProps {
  desafios: Desafio[];
  // Chamado depois de gerar ou revisar, para a tela recarregar os vínculos.
  onAtualizado?: () => void;
}

export function SugestoesIa({ desafios, onAtualizado }: SugestoesIaProps) {
  const [desafioId, setDesafioId] = useState('');
  const {
    resultado,
    carregando,
    erro,
    revisando,
    errosRevisao,
    sugerir,
    revisar,
    limpar,
  } = useMatchIA();

  const desafiosDisponiveis = useMemo(
    () =>
      desafios.filter((d) => d.status.trim().toLowerCase() !== 'arquivado'),
    [desafios]
  );

  function handleSelecionar(id: string) {
    setDesafioId(id);
    limpar();
  }

  async function handleSugerir() {
    await sugerir(desafioId);
    onAtualizado?.();
  }

  return (
    <section
      className="match-card sugestoes-ia"
      aria-labelledby="sugestoes-ia-titulo"
    >
      <h2 id="sugestoes-ia-titulo">Sugestões da IA</h2>
      <p className="sugestoes-ia__texto">
        A IA sugere as ideias mais compatíveis com um desafio. Toda sugestão
        fica pendente até você aprovar ou descartar.
      </p>

      <div className="sugestoes-ia__form">
        <DesafioSelector
          desafios={desafiosDisponiveis}
          value={desafioId}
          onChange={handleSelecionar}
          disabled={carregando}
        />
        <Button
          isLoading={carregando}
          loadingText="Consultando a IA..."
          disabled={!desafioId}
          onClick={handleSugerir}
        >
          Sugerir ideias com IA
        </Button>
      </div>

      {erro && (
        <Alert variant="error" title="Não foi possível obter sugestões">
          {erro} O vínculo manual continua disponível.
        </Alert>
      )}

      {resultado && (
        <div aria-live="polite">
          {resultado.sugestoes.length === 0 ? (
            <p>Nenhuma ideia candidata foi encontrada para este desafio.</p>
          ) : (
            <>
              <p className="sugestoes-ia__meta">
                {resultado.sugestoes.length} sugestões · confiança média{' '}
                {resultado.confianca}%
                {resultado.modelo && ` · modelo ${resultado.modelo}`}
                {resultado.geradoEm && ` · ${resultado.geradoEm}`}
              </p>
              <div className="sugestoes-ia__lista">
                {resultado.sugestoes.map((sugestao) => (
                  <MatchCard
                    key={sugestao.id}
                    sugestao={sugestao}
                    revisando={revisando === sugestao.matchId}
                    erroRevisao={errosRevisao[sugestao.matchId]}
                    onRevisar={async (decisao, justificativa) => {
                      await revisar(sugestao.matchId, decisao, justificativa);
                      onAtualizado?.();
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
