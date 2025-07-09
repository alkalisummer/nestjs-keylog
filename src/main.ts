import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

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
  await app.listen(process.env.BASE_PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((error) => console.error(error));
