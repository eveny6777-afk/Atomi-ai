import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from 'src/projects/project.service';
import { FileStorageService } from './file-storage.service';
import { FFmpegService } from './ffmpeg.service';
import { UrlImportService } from './url-import.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectService: ProjectService,
    private readonly fileStorageService: FileStorageService,
    private readonly ffmpegService: FFmpegService,
    private readonly urlImportService: UrlImportService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Create upload job for local file
   */
  async createLocalUploadJob(
    userId: string,
    file: Express.Multer.File,
    projectName?: string
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedMimes.join(', ')}`
      );
    }

    const maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024 * 1024); // 5GB default
    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum of ${maxFileSize / (1024 * 1024 * 1024)}GB`
      );
    }

    // Create upload job
    const uploadJob = await this.prismaService.uploadJob.create({
      data: {
        userId,
        projectName: projectName || file.originalname.replace(/\.[^.]+$/, ''),
        sourceType: 'local',
        status: 'pending',
        totalSize: BigInt(file.size),
      },
    });

    return uploadJob;
  }

  /**
   * Create upload job for URL import
   */
  async createUrlUploadJob(
    userId: string,
    url: string,
    projectName?: string
  ) {
    // Validate URL
    const validation = await this.urlImportService.validateAndDetectSource(url);
    if (!validation.isValid) {
      throw new BadRequestException('Invalid video URL');
    }

    // Create upload job
    const uploadJob = await this.prismaService.uploadJob.create({
      data: {
        userId,
        projectName: projectName || `Import from ${validation.provider}`,
        sourceType: 'url',
        sourceUrl: url,
        sourceProvider: validation.provider || 'generic',
        status: 'pending',
      },
    });

    return uploadJob;
  }

  /**
   * Process local file upload
   */
  async processLocalUpload(
    uploadJobId: string,
    file: Express.Multer.File
  ) {
    const uploadJob = await this.prismaService.uploadJob.findUnique({
      where: { id: uploadJobId },
    });

    if (!uploadJob) {
      throw new BadRequestException('Upload job not found');
    }

    try {
      // Update job status
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'processing', progress: 10 },
      });

      // Create project
      const project = await this.projectService.createProjectFromUpload(
        uploadJob.userId,
        uploadJob.projectName
      );

      // Save file
      const videosDir = this.fileStorageService.getVideosDir(project.id);
      const filename = this.fileStorageService.generateFilename(file.originalname);
      const videoPath = path.join(videosDir, filename);

      await this.fileStorageService.saveFile(file.buffer, videoPath);

      // Update progress
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { 
          status: 'processing', 
          progress: 30,
          uploadedSize: BigInt(file.size),
        },
      });

      // Extract metadata
      const metadata = await this.ffmpegService.getVideoMetadata(videoPath);

      // Generate thumbnail
      const thumbsDir = this.fileStorageService.getThumbsDir(project.id);
      const thumbFilename = `${path.basename(filename, path.extname(filename))}.jpg`;
      const thumbnailPath = path.join(thumbsDir, thumbFilename);

      await this.ffmpegService.generateThumbnail(videoPath, thumbnailPath, 0);

      // Update progress
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'processing', progress: 70 },
      });

      // Create video record
      const video = await this.prismaService.video.create({
        data: {
          projectId: project.id,
          uploadJobId,
          title: file.originalname.replace(/\.[^.]+$/, ''),
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          frameRate: metadata.frameRate,
          bitrate: metadata.bitrate,
          codec: metadata.codec,
          originalPath: videoPath,
          thumbnailPath,
          status: 'ready',
          sourceType: 'local',
          metadata: { uploadedFileName: file.originalname, ...metadata },
        },
      });

      // Update project thumbnail
      await this.projectService.updateProjectThumbnail(
        project.id,
        uploadJob.userId,
        thumbnailPath
      );

      // Update upload job
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'completed', progress: 100 },
      });

      return { uploadJob, project, video };
    } catch (error) {
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Process URL import
   */
  async processUrlImport(uploadJobId: string) {
    const uploadJob = await this.prismaService.uploadJob.findUnique({
      where: { id: uploadJobId },
    });

    if (!uploadJob || !uploadJob.sourceUrl) {
      throw new BadRequestException('Upload job not found or invalid');
    }

    try {
      // Update job status
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'downloading', progress: 5 },
      });

      // Create project
      const project = await this.projectService.createProjectFromUpload(
        uploadJob.userId,
        uploadJob.projectName
      );

      // Download video
      const videosDir = this.fileStorageService.getVideosDir(project.id);
      const downloadResult = await this.urlImportService.downloadVideo(
        uploadJob.sourceUrl,
        videosDir
      );

      // Update progress
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'processing', progress: 40 },
      });

      // Extract metadata
      const metadata = await this.ffmpegService.getVideoMetadata(downloadResult.path);

      // Generate thumbnail
      const thumbsDir = this.fileStorageService.getThumbsDir(project.id);
      const thumbFilename = `${path.basename(downloadResult.path, path.extname(downloadResult.path))}.jpg`;
      const thumbnailPath = path.join(thumbsDir, thumbFilename);

      await this.ffmpegService.generateThumbnail(downloadResult.path, thumbnailPath, 0);

      // Update progress
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'processing', progress: 70 },
      });

      // Create video record
      const video = await this.prismaService.video.create({
        data: {
          projectId: project.id,
          uploadJobId,
          title: downloadResult.title || uploadJob.projectName,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          frameRate: metadata.frameRate,
          bitrate: metadata.bitrate,
          codec: metadata.codec,
          originalPath: downloadResult.path,
          thumbnailPath,
          status: 'ready',
          sourceType: 'url',
          sourceUrl: uploadJob.sourceUrl,
          sourceProvider: uploadJob.sourceProvider,
          metadata: { ...metadata },
        },
      });

      // Update project thumbnail
      await this.projectService.updateProjectThumbnail(
        project.id,
        uploadJob.userId,
        thumbnailPath
      );

      // Update upload job
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: { status: 'completed', progress: 100 },
      });

      return { uploadJob, project, video };
    } catch (error) {
      await this.prismaService.uploadJob.update({
        where: { id: uploadJobId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Get upload job status
   */
  async getUploadJobStatus(uploadJobId: string, userId: string) {
    const uploadJob = await this.prismaService.uploadJob.findUnique({
      where: { id: uploadJobId },
      include: { video: true },
    });

    if (!uploadJob) {
      throw new BadRequestException('Upload job not found');
    }

    if (uploadJob.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return uploadJob;
  }

  /**
   * Get user upload jobs
   */
  async getUserUploadJobs(userId: string, skip = 0, take = 10) {
    const [uploadJobs, total] = await Promise.all([
      this.prismaService.uploadJob.findMany({
        where: { userId },
        include: { video: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prismaService.uploadJob.count({ where: { userId } }),
    ]);

    return {
      uploadJobs,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }
}
