import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity.js'
import type { CreateUserDto, UpdateUserDto } from './dto/create-user.dto.js'
import type { UserRole } from '../domain/enums.js'

/** Usuario devuelto por la API: el modelo sin la contraseña. */
export type SafeUser = Omit<User, 'password'>

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /** Lista todos los usuarios registrados, sin contraseñas. */
  findAll(): Promise<SafeUser[]> {
    return this.stripPasswords(this.usersRepository.find())
  }

  /**
   * Busca un usuario por id.
   * @throws NotFoundException si el id no existe
   */
  async findOne(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`)
    return this.stripPassword(user)
  }

  /**
   * Credenciales de acceso; es el login del alcance del curso.
   * @param email correo registrado
   * @param password contraseña en texto plano
   * @returns el usuario sin contraseña, o null si no coinciden
   */
  async login(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findOneBy({ email })
    if (!user || user.password !== password) return null
    return this.stripPassword(user)
  }

  /** Indica si un correo ya está en uso por otro usuario. */
  async emailTaken(email: string, exceptId?: string): Promise<boolean> {
    const existing = await this.usersRepository.findOneBy({ email })
    return existing !== null && existing.id !== exceptId
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const user = this.usersRepository.create({
      ...createUserDto,
      memberSince: createUserDto.memberSince ?? new Date().toISOString().slice(0, 10),
    })
    return this.stripPassword(await this.usersRepository.save(user))
  }

  async update(id: string, changes: UpdateUserDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`)
    this.usersRepository.merge(user, changes)
    return this.stripPassword(await this.usersRepository.save(user))
  }

  /** Cantidad de administradores: protege al último admin del sistema. */
  countAdmins(): Promise<number> {
    return this.usersRepository.count({ where: { role: 'admin' as UserRole } })
  }

  /**
   * Verifica que un usuario pueda eliminarse sin dejar el sistema roto.
   * @returns null si puede eliminarse, o el motivo del bloqueo
   */
  async blockedFromRemoval(id: string, currentUserId: string): Promise<string | null> {
    if (id === currentUserId) return 'No puedes eliminar tu propio usuario.'
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) return 'El usuario ya no existe.'
    if (user.role === 'admin' && (await this.countAdmins()) <= 1) {
      return 'No puedes eliminar al último administrador del sistema.'
    }
    return null
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id)
  }

  /** Retira la contraseña de un usuario antes de devolverlo. */
  private stripPassword(user: User): SafeUser {
    const { password: _password, ...safe } = user
    return safe
  }

  private async stripPasswords(users: Promise<User[]>): Promise<SafeUser[]> {
    const all = await users
    return all.map((user) => this.stripPassword(user))
  }
}
