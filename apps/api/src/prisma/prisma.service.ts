import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PrismaClient,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
