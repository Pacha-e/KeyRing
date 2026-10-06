import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import type { NestExpressApplication } from '@nestjs/platform-express'

/**
 * Arranca la API de KeyRing.
 * El prefijo global `api` es el que usan todos los servicios del frontend.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim())
  app.enableCors({
    origin: corsOrigins?.length
      ? corsOrigins
      : ['http://localhost:5173', 'http://localhost:8081', 'http://localhost'],
  })
  app.setGlobalPrefix('api')
  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
}
await bootstrap()
