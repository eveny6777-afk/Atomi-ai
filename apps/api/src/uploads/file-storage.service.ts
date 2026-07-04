import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class FileStorageService {
  private uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = this.configService.get('UPLOADS_DIR', './uploads');
    this.ensureUploadsDir();
  }

  /**
   * Ensure uploads directory exists
   */
  private ensureUploadsDir(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Get uploads directory path
   */
  getUploadsDir(): string {
    return this.uploadsDir;
  }

  /**
   * Get project uploads directory
   */
  getProjectDir(projectId: string): string {
    const projectDir = path.join(this.uploadsDir, projectId);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    return projectDir;
  }

  /**
   * Get videos directory for project
   */
  getVideosDir(projectId: string): string {
    const videosDir = path.join(this.getProjectDir(projectId), 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    return videosDir;
  }

  /**
   * Get thumbnails directory for project
   */
  getThumbsDir(projectId: string): string {
    const thumbsDir = path.join(this.getProjectDir(projectId), 'thumbnails');
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }
    return thumbsDir;
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${name}-${timestamp}-${random}${ext}`;
  }

  /**
   * Save file to disk
   */
  async saveFile(buffer: Buffer, destinationPath: string): Promise<void> {
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(destinationPath, buffer);
  }

  /**
   * Delete file
   */
  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Get file size
   */
  getFileSize(filePath: string): number {
    if (fs.existsSync(filePath)) {
      return fs.statSync(filePath).size;
    }
    return 0;
  }
}
