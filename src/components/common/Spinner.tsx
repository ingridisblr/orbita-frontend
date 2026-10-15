import './Spinner.css'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function Spinner({ size = 'md', label = 'Carregando' }: SpinnerProps) {
  return (
    <output className={`spinner spinner--${size}`}>
      <span className="spinner__ring" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </output>
  )
}
