import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
