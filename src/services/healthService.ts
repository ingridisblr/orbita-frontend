import { api } from './api'
import type { HealthResponse } from '../types/api'

export async function getHealth() {
  const response = await api.get<HealthResponse>('/health')
  return { data: response.data, status: response.status }
}
