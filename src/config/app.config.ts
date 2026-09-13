import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  environment: process.env.NODE_ENV ?? 'development',
  imageBaseUrl: process.env.IMAGE_BASE_URL ?? 'http://localhost:3000',
}));