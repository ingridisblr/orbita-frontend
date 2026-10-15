export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
