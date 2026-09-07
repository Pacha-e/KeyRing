import type { UserInterface } from '../interfaces/UserInterface'

/** Datos para crear o editar un usuario (el id lo genera el repositorio) */
export type CreateUserDTO = Omit<UserInterface, 'id'>
