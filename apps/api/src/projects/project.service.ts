import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a new project
   */
  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto
  ) {
    return this.prismaService.project.create({
      data: {
        userId,
        name: createProjectDto.name,
        description: createProjectDto.description,
      },
      include: {
        videos: true,
      },
    });
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string, skip = 0, take = 10) {
    const [projects, total] = await Promise.all([
      this.prismaService.project.findMany({
        where: {
          userId,
          status: 'active',
        },
        include: {
          videos: {
            select: {
              id: true,
              title: true,
              thumbnailPath: true,
              duration: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaService.project.count({
        where: {
          userId,
          status: 'active',
        },
      }),
    ]);

    return {
      projects,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  /**
   * Get a single project
   */
  async getProjectById(projectId: string, userId: string) {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: {
        videos: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    updateProjectDto: UpdateProjectDto
  ) {
    const project = await this.getProjectById(projectId, userId);

    return this.prismaService.project.update({
      where: { id: projectId },
      data: {
        name: updateProjectDto.name || project.name,
        description: updateProjectDto.description || project.description,
      },
      include: {
        videos: true,
      },
    });
  }

  /**
   * Delete project (soft delete by changing status)
   */
  async deleteProject(projectId: string, userId: string) {
    const project = await this.getProjectById(projectId, userId);

    return this.prismaService.project.update({
      where: { id: projectId },
      data: { status: 'deleted' },
    });
  }

  /**
   * Update project thumbnail
   */
  async updateProjectThumbnail(projectId: string, userId: string, thumbnailPath: string) {
    const project = await this.getProjectById(projectId, userId);

    return this.prismaService.project.update({
      where: { id: projectId },
      data: { thumbnail: thumbnailPath },
    });
  }

  /**
   * Create project from upload job
   */
  async createProjectFromUpload(userId: string, projectName: string) {
    return this.prismaService.project.create({
      data: {
        userId,
        name: projectName,
        description: `Auto-created from video upload`,
      },
    });
  }
}
