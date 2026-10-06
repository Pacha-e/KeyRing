import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import type { UserRole } from '../../domain/enums.js'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  fullName: string

  @Column({ unique: true })
  email: string

  /**
   * Contraseña en texto plano, como corresponde al alcance del curso.
   * Ninguna respuesta de la API la incluye: el servicio la retira antes
   * de devolver cualquier usuario.
   */
  @Column()
  password: string

  @Column()
  phone: string

  @Column()
  city: string

  /** Fecha ISO 'YYYY-MM-DD' de registro del usuario. */
  @Column()
  memberSince: string

  @Column()
  role: UserRole

  /**
   * Las propiedades del usuario no viajan anidadas: la relación vive en
   * Property.ownerId, que es la única fuente de verdad de la propiedad.
   */
}
