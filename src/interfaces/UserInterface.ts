import type { UserRole } from './enums'

export interface UserInterface {
  id: string
  fullName: string
  email: string
  password: string
  phone: string
  city: string
  memberSince: string
  role: UserRole
  /** ids de las propiedades del usuario */
  properties: string[]
}
