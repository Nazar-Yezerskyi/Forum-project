import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, EntityType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetStatisticsDto } from './dtos/get-statistics.dto';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  async addAction(
    action: Action,
    userId: number,
    entityType: EntityType,
    entityId: number,
    entity: object,
  ) {
    if (!(action in Action)) {
      throw new BadRequestException('Invalid action type');
    }
    if (!(entityType in EntityType)) {
      throw new BadRequestException('Invalid entityType');
    }
    const addedAction = await this.prisma.user_actions.create({
      data: {
        action,
        userId,
        entityType,
        entityId,
        entity,
      },
    });
    return addedAction;
  }

  async getStatistics(dto: GetStatisticsDto) {
    const { userId, startDate, endDate, entityTypes, interval } = dto;

    const entityTypesArray: string[] = entityTypes.split(',').filter(Boolean);

    const entityTypesEnum: EntityType[] = entityTypesArray.map(
      (type) => EntityType[type as keyof typeof EntityType],
    );

    const filteredEntityTypes = entityTypesEnum.filter(type => type !== undefined);

    const userIdInt = userId ? Number(userId) : undefined;

    const where: Prisma.User_actionsWhereInput = {
      action: {
        in: ['Create', 'Update', 'Delete', 'Viewed', 'Followed', 'NewFollower'],
      },
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      entityType: {
        in: filteredEntityTypes,
      },
    };

    if (userIdInt) {
      where.userId = userIdInt;
    }

    const actions = await this.prisma.user_actions.findMany({
      where,
    });

    const aggregatedStats = this.aggregateStatistics(actions, interval);

    const groupedStats: { [key: string]: any } = {};

    filteredEntityTypes.forEach((entityType) => {
      groupedStats[entityType] = {};
      ['Create', 'Update', 'Delete', 'Viewed', 'Followed', 'NewFollower'].forEach((action) => {
        groupedStats[entityType][action] = {};
      });
    });

    actions.forEach((actionData) => {
      const key = this.getIntervalKey(actionData.timestamp, interval);

      if (!groupedStats[actionData.entityType]) {
        groupedStats[actionData.entityType] = {};
      }
      if (!groupedStats[actionData.entityType][key]) {
        groupedStats[actionData.entityType][key] = {};
      }
      if (!groupedStats[actionData.entityType][key][actionData.action]) {
        groupedStats[actionData.entityType][key][actionData.action] = 0;
      }

      groupedStats[actionData.entityType][key][actionData.action]++;
    });

    return groupedStats;
  }

  private aggregateStatistics(actions: any[], interval: string) {
    const aggregatedStats = actions.reduce((acc, action) => {
      const key = this.getIntervalKey(action.timestamp, interval);

      if (!acc[key]) {
        acc[key] = {};
      }

      if (!acc[key][action.action]) {
        acc[key][action.action] = 0;
      }

      acc[key][action.action]++;
      return acc;
    }, {});

    return aggregatedStats;
  }

  private getIntervalKey(timestamp: Date, interval: string): string {
    const date = new Date(timestamp);
    switch (interval) {
      case 'hour':
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}`;
      case 'day':
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      case 'week':
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(((date.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7);
        return `${date.getFullYear()}-W${week}`;
      case 'month':
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      case 'total':
        return 'total';
      default:
        return 'total';
    }
  }
}