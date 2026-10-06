import { Controller, Get } from '@nestjs/common'

@Controller()
export class HomeController {
  /** Ping de la API: confirma que el backend está arriba. */
  @Get()
  index(): string {
    return 'API KeyRing is running'
  }
}
