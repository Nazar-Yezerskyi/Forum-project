import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from './followers.service';
import { ActionsService } from 'src/actions/actions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

describe('FollowersService', () => {
  let followersService: FollowersService;
  let actionsService: ActionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    follows: { 
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        { 
          provide: PrismaService, 
          useValue: mockPrismaService 
        },
        {
          provide: ActionsService,
          useValue:{
            addAction: jest.fn()
          }
        }],
    }).compile();

    followersService = module.get<FollowersService>(FollowersService);
    actionsService = module.get<ActionsService>(ActionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(followersService).toBeDefined();
  });

  it('should create follow relationship and add action', async () => {
    const mockFollow = { id: 1, followedById: 1, followingId: 2, addedDate: new Date() };
    const mockAction = {
      id: 1,
      action: 'FOLLOWED',
      userId: 1,
      entityType: 'USER',
      entityId: 1,
      entity: {
        id: 1,
        followedById: 1,
        followingId: 2,
        addedDate: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    mockPrismaService.follows.findFirst.mockResolvedValue(null);
    mockPrismaService.follows.create.mockResolvedValue(mockFollow);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const result = await followersService.followUser(1, 2);

    expect(result.followUser).toEqual(mockFollow);
    expect(result.action).toEqual(mockAction);  
    expect(prismaService.follows.create).toHaveBeenCalledWith({
      data: { followedById: 1, followingId: 2 },
    });
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.FOLLOWED,
      1,
      EntityTypes.USER,
      mockFollow.id,
      mockFollow,
    );
});


it('should delete follow relationship and add action', async () => {
  const mockFollow = { id: 1, followedById: 1, followingId: 2, addedDate: new Date() };
  const mockUnFollow = { id: 1, followedById: 1, followingId: 2 };
  const mockAction = {
    id: 1,
    action: 'DELETE',
    userId: 1,
    entityType: 'USER',
    entityId: 1,
    entity: mockUnFollow,
    timestamp: new Date(),
  };

  mockPrismaService.follows.findFirst.mockResolvedValue(mockFollow);
  mockPrismaService.follows.delete.mockResolvedValue(mockUnFollow);
  jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

  const result = await followersService.unFollowUser(1, 2);

  expect(result.unFollowUser).toEqual(mockUnFollow); 
  expect(result.action).toEqual(mockAction);  
  expect(prismaService.follows.delete).toHaveBeenCalledWith({
    where: { id: mockFollow.id },
  });
  expect(actionsService.addAction).toHaveBeenCalledWith(
    UserActions.DELETE,
    1,
    EntityTypes.USER,
    mockFollow.id,
    mockUnFollow,
  );
});


});
