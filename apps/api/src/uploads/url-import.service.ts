import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as axios from 'axios';
import * as childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

interface ValidateUrlResult {
  isValid: boolean;
  provider: string | null;
  metadata?: {
    title?: string;
    creator?: string;
    duration?: number;
    thumbnail?: string;
  };
}

@Injectable()
export class UrlImportService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate and detect video URL source
   */
  async validateAndDetectSource(url: string): Promise<ValidateUrlResult> {
    // YouTube
    if (this.isYouTubeUrl(url)) {
      return { isValid: true, provider: 'youtube' };
    }

    // Facebook
    if (this.isFacebookUrl(url)) {
      return { isValid: true, provider: 'facebook' };
    }

    // Twitch
    if (this.isTwitchUrl(url)) {
      return { isValid: true, provider: 'twitch' };
    }

    // Instagram
    if (this.isInstagramUrl(url)) {
      return { isValid: true, provider: 'instagram' };
    }

    // Generic video URL
    if (this.isValidVideoUrl(url)) {
      return { isValid: true, provider: 'generic' };
    }

    throw new BadRequestException(
      'Invalid video URL. Supported: YouTube, Facebook, Twitch, Instagram, or direct video URLs'
    );
  }

  /**
   * Check if URL is YouTube
   */
  private isYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/i;
    return youtubeRegex.test(url);
  }

  /**
   * Check if URL is Facebook
   */
  private isFacebookUrl(url: string): boolean {
    const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i;
    return facebookRegex.test(url);
  }

  /**
   * Check if URL is Twitch
   */
  private isTwitchUrl(url: string): boolean {
    const twitchRegex = /^(https?:\/\/)?(www\.)?(twitch\.tv|clips\.twitch\.tv)\/.+/i;
    return twitchRegex.test(url);
  }

  /**
   * Check if URL is Instagram
   */
  private isInstagramUrl(url: string): boolean {
    const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com)\/(p|reel)\/.+/i;
    return instagramRegex.test(url);
  }

  /**
   * Check if URL is valid video URL
   */
  private isValidVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.toLowerCase();
      const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m3u8'];
      return videoExtensions.some(ext => path.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractYouTubeId(url: string): string | null {
    const patterns = [
      /youtu\.be\/([\w-]{11})/,
      /youtube\.com\/watch\?v=([\w-]{11})/,
      /youtube\.com\/embed\/([\w-]{11})/,
      /youtube-nocookie\.com\/embed\/([\w-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Download video using yt-dlp
   */
  async downloadVideo(
    url: string,
    outputPath: string,
    onProgress?: (progress: { percent: number; speed: string; eta: string }) => void
  ): Promise<{ path: string; title: string }> {
    try {
      const ytDlpPath = this.configService.get('YTDLP_PATH', 'yt-dlp');

      const command = `"${ytDlpPath}" -f best[ext=mp4] -o "${outputPath}/%(title)s.%(ext)s" "${url}" --no-warnings --quiet`;

      const { stdout, stderr } = await exec(command, { maxBuffer: 10 * 1024 * 1024 });

      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(stderr);
      }

      // Extract the downloaded filename from output
      const files = require('fs').readdirSync(outputPath);
      const videoFile = files.find((f: string) => {
        const videoExts = ['.mp4', '.webm', '.avi', '.mov', '.mkv'];
        return videoExts.some(ext => f.endsWith(ext));
      });

      if (!videoFile) {
        throw new Error('Failed to find downloaded video');
      }

      return {
        path: `${outputPath}/${videoFile}`,
        title: videoFile.replace(/\.[^.]+$/, ''),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to download video: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get video metadata from URL (if available)
   */
  async getVideoMetadataFromUrl(url: string): Promise<{ title?: string; duration?: number; thumbnail?: string }> {
    try {
      if (this.isYouTubeUrl(url)) {
        return await this.getYouTubeMetadata(url);
      }
      // Add other providers as needed
    } catch (error) {
      console.error('Failed to get metadata from URL:', error);
    }

    return {};
  }

  /**
   * Get YouTube video metadata
   */
  private async getYouTubeMetadata(url: string): Promise<{ title?: string; thumbnail?: string }> {
    try {
      const videoId = this.extractYouTubeId(url);
      if (!videoId) {
        return {};
      }

      // Get thumbnail URL from YouTube
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      return {
        title: `YouTube Video ${videoId}`,
        thumbnail,
      };
    } catch {
      return {};
    }
  }
}
