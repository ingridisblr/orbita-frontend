import { Select } from '../common/Select';
import type { Desafio } from '../../types/desafio';

interface DesafioSelectorProps {
  desafios: Desafio[];
  value: string;
  onChange: (desafioId: string) => void;
  disabled?: boolean;
}

export function DesafioSelector({
  desafios,
  value,
  onChange,
  disabled,
}: DesafioSelectorProps) {
  return (
    <Select
      label="Desafio"
      placeholder="Selecione um desafio"
      helperText="A IA busca as ideias mais próximas do problema descrito no desafio."
      value={value}
      disabled={disabled}
      onChange={(evento) => onChange(evento.target.value)}
      options={desafios.map((desafio) => ({
        value: desafio.id,
        label: `#${desafio.id} · ${desafio.titulo}`,
      }))}
    />
  );
}
