// Cliente HTTP compartido por todos los servicios.
//
// La URL base sale de la configuración (VITE_API_BASE_URL), nunca hardcodeada
// dentro de cada servicio: al desplegar, la IP de la API cambia en un solo
// archivo de entorno y no en cuatro.
import axios from 'axios'
import { API_BASE_URL } from '../config/app.config'

export const http = axios.create({ baseURL: API_BASE_URL })

/** Extrae el mensaje de error del backend, o uno genérico en español. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    const message = data?.message
    if (typeof message === 'string' && message) return message
  }
  return 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
}
