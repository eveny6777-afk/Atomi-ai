import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectModule } from 'src/projects/project.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileStorageService } from './file-storage.service';
import { FFmpegService } from './ffmpeg.service';
import { UrlImportService } from './url-import.service';

@Module({
  imports: [ConfigModule, PrismaModule, ProjectModule],
  providers: [UploadService, FileStorageService, FFmpegService, UrlImportService],
  controllers: [UploadController],
  exports: [UploadService, FileStorageService, FFmpegService, UrlImportService],
})
export class UploadModule {}
