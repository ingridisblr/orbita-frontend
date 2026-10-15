import { Alert } from './Alert'
import './ActionFeedback.css'

interface ActionFeedbackProps {
  error: string
  notice: string
  onClear: () => void
}

export function ActionFeedback({ error, notice, onClear }: ActionFeedbackProps) {
  return (
    <>
      {error && (
        <div className="feedback">
          <Alert variant="error" title="Ação não realizada" onClose={onClear}>{error}</Alert>
        </div>
      )}
      {notice && (
        <div className="feedback">
          <Alert variant="success" onClose={onClear}>{notice}</Alert>
        </div>
      )}
    </>
  )
}
