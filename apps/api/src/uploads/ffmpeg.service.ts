import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  codec: string;
}

@Injectable()
export class FFmpegService {
  constructor(private readonly configService: ConfigService) {
    // Configure ffmpeg path if needed
    const ffmpegPath = this.configService.get('FFMPEG_PATH');
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  /**
   * Extract video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new BadRequestException(`Failed to read video metadata: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new BadRequestException('No video stream found'));
          return;
        }

        resolve({
          duration: Math.round(metadata.format.duration || 0),
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          frameRate: this.parseFrameRate(videoStream.r_frame_rate || '30'),
          bitrate: Math.round((metadata.format.bit_rate || 0) / 1000), // Convert to kbps
          codec: videoStream.codec_name || 'unknown',
        });
      });
    });
  }

  /**
   * Parse frame rate from string (e.g., "30/1" -> 30)
   */
  private parseFrameRate(frameRateStr: string): number {
    if (!frameRateStr) return 30;
    const parts = frameRateStr.split('/');
    if (parts.length === 2) {
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(frameRateStr) || 30;
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timestamp: number = 0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x180',
        })
        .on('end', () => resolve())
        .on('error', (err) => {
          reject(new BadRequestException(`Failed to generate thumbnail: ${err.message}`));
        });
    });
  }

  /**
   * Extract audio from video for transcription
   */
  async extractAudio(
    videoPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(outputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('end', () => resolve())
        .on('error', (err) => {
          reject(new BadRequestException(`Failed to extract audio: ${err.message}`));
        })
        .run();
    });
  }
}
