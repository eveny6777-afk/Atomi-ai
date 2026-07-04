import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Create a new project
   * POST /projects
   */
  @Post()
  async createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto
  ) {
    return this.projectService.createProject(user.id, createProjectDto);
  }

  /**
   * Get all projects for user
   * GET /projects
   */
  @Get()
  async getUserProjects(
    @CurrentUser() user: User,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.projectService.getUserProjects(
      user.id,
      parseInt(skip || '0'),
      parseInt(take || '10')
    );
  }

  /**
   * Get single project
   * GET /projects/:id
   */
  @Get(':id')
  async getProject(
    @CurrentUser() user: User,
    @Param('id') projectId: string
  ) {
    return this.projectService.getProjectById(projectId, user.id);
  }

  /**
   * Update project
   * PUT /projects/:id
   */
  @Put(':id')
  async updateProject(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    return this.projectService.updateProject(projectId, user.id, updateProjectDto);
  }

  /**
   * Delete project
   * DELETE /projects/:id
   */
  @Delete(':id')
  async deleteProject(
    @CurrentUser() user: User,
    @Param('id') projectId: string
  ) {
    return this.projectService.deleteProject(projectId, user.id);
  }
}
