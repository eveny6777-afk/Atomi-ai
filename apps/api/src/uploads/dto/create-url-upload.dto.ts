import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateUrlUploadDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  projectName?: string;
}
