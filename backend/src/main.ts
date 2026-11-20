import './load-env';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const trustProxyHops = process.env.TRUST_PROXY_HOPS;

  if (trustProxyHops !== undefined) {
    const hops = Number(trustProxyHops);

    if (!Number.isInteger(hops) || hops < 0) {
      throw new Error(
        'TRUST_PROXY_HOPS deve ser um número inteiro não negativo.',
      );
    }

    app.set('trust proxy', hops);
  }

  app.enableCors();
  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
