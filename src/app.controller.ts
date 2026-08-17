import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus(): { message: string } {
    return { message: 'TAG API is running' };
  }
}