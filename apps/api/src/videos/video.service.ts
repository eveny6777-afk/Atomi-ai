import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Get videos for a project
   */
  async getProjectVideos(projectId: string, userId: string) {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return this.prismaService.video.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single video
   */
  async getVideoById(videoId: string, userId: string) {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        project: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const project = await this.prismaService.project.findUnique({
      where: { id: video.projectId },
    });

    if (project?.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return video;
  }

  /**
   * Update video status
   */
  async updateVideoStatus(videoId: string, status: string) {
    return this.prismaService.video.update({
      where: { id: videoId },
      data: { status },
    });
  }

  /**
   * Get video with metadata
   */
  async getVideoMetadata(videoId: string) {
    return this.prismaService.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        duration: true,
        width: true,
        height: true,
        frameRate: true,
        bitrate: true,
        codec: true,
        metadata: true,
      },
    });
  }
}
