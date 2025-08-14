import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import cookie from '@fastify/cookie';
import cors, { type FastifyCorsOptions } from '@fastify/cors';

// Suppress deprecation warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('DEP0190')) {
    return; // Ignore DEP0190 warnings
  }
  console.warn(warning.name, warning.message);
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.register(cookie);
  const allowedOrigins: string[] = (process.env.CORS_ORIGIN?.split(',') ?? []).map((v) => v.trim()).filter(Boolean);
  const corsOptions: FastifyCorsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  };

  await app.register(cors, corsOptions);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  await app.listen(process.env.BASE_PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((error) => console.error(error));
