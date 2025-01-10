import { Test, TestingModule } from '@nestjs/testing';
import { ActionsService } from './actions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

describe('ActionsService', () => {
  let actionsService: ActionsService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: PrismaService,
          useValue: {
            user_actions: {
              create: jest.fn().mockResolvedValue({
                action: UserActions.CREATE,
                userId: 1,
                entityType: EntityTypes.USER,
                entityId: 1,
                entity: {},
                timestamp: new Date(),
              }),
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    actionsService = module.get<ActionsService>(ActionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(actionsService).toBeDefined();
  });
  it('should add a new action correctly', async () => {
    const mockEntity = { some: 'entityData' };
    const resultAction = {
      action: UserActions.CREATE,
      userId: 1,
      entityType: EntityTypes.USER,
      entityId: 1,
      entity: mockEntity,  
      timestamp: expect.any(Date),
    };
  
    prismaService.user_actions.create = jest.fn().mockResolvedValue(resultAction);
  
    const result = await actionsService.addAction(
      UserActions.CREATE,
      1,
      EntityTypes.USER,
      1,
      mockEntity,
    );
  
    expect(result).toEqual(resultAction);
  });
});
