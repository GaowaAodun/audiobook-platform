import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AudiobooksController } from './audiobooks.controller';
import { AudiobooksService } from './audiobooks.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AudiobooksController],
  providers: [AudiobooksService, RolesGuard],
})
export class AudiobooksModule {}
