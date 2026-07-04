import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  /**
   * Get videos for a project
   * GET /videos/project/:projectId
   */
  @Get('project/:projectId')
  async getProjectVideos(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string
  ) {
    return this.videoService.getProjectVideos(projectId, user.id);
  }

  /**
   * Get video metadata
   * GET /videos/:id
   */
  @Get(':id')
  async getVideo(
    @CurrentUser() user: User,
    @Param('id') videoId: string
  ) {
    return this.videoService.getVideoById(videoId, user.id);
  }

  /**
   * Get video metadata only
   * GET /videos/:id/metadata
   */
  @Get(':id/metadata')
  async getVideoMetadata(
    @CurrentUser() user: User,
    @Param('id') videoId: string
  ) {
    await this.videoService.getVideoById(videoId, user.id); // Authorization check
    return this.videoService.getVideoMetadata(videoId);
  }
}
