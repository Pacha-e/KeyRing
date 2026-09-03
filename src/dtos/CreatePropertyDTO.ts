import type { PropertyInterface } from '../interfaces/PropertyInterface'

/** Datos para crear una propiedad (el id lo genera el repositorio) */
export type CreatePropertyDTO = Omit<PropertyInterface, 'id'>
