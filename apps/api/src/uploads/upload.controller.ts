import { Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile, Param, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateUrlUploadDto } from './dto/create-url-upload.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Initiate local file upload
   * POST /uploads/local
   */
  @Post('local')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLocal(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadJob = await this.uploadService.createLocalUploadJob(
      user.id,
      file,
      body.projectName
    );

    // Process upload asynchronously
    this.uploadService.processLocalUpload(uploadJob.id, file).catch(err => {
      console.error('Upload processing error:', err);
    });

    return uploadJob;
  }

  /**
   * Initiate URL import
   * POST /uploads/url
   */
  @Post('url')
  async uploadUrl(
    @CurrentUser() user: User,
    @Body() createUrlUploadDto: CreateUrlUploadDto
  ) {
    const uploadJob = await this.uploadService.createUrlUploadJob(
      user.id,
      createUrlUploadDto.url,
      createUrlUploadDto.projectName
    );

    // Process import asynchronously
    this.uploadService.processUrlImport(uploadJob.id).catch(err => {
      console.error('URL import error:', err);
    });

    return uploadJob;
  }

  /**
   * Get upload job status
   * GET /uploads/:id
   */
  @Get(':id')
  async getUploadStatus(
    @CurrentUser() user: User,
    @Param('id') uploadJobId: string
  ) {
    return this.uploadService.getUploadJobStatus(uploadJobId, user.id);
  }

  /**
   * Get all upload jobs for user
   * GET /uploads
   */
  @Get()
  async getUserUploads(
    @CurrentUser() user: User,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.uploadService.getUserUploadJobs(
      user.id,
      parseInt(skip || '0'),
      parseInt(take || '10')
    );
  }
}
