import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpCode, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

  constructor(private readonly authService: AuthService) {}

  /**
   * Register endpoint
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(201)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.register(registerDto);

    // Set HTTP-only cookie for refresh token
    response.cookie(this.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * Login endpoint
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(loginDto);

    // Set HTTP-only cookie for refresh token
    response.cookie(this.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * Logout endpoint
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies[this.REFRESH_TOKEN_COOKIE_NAME];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    response.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME);

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(200)
  async refreshAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies[this.REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Update refresh token cookie
    response.cookie(this.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
}
