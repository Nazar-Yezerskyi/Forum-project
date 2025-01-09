import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionsService } from 'src/actions/actions.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

describe('LikesService', () => {
  let likesService: LikesService;
  let prismaService: PrismaService;
  let actionsService: ActionsService;

  const mockPrismaService = {
    post_likes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    comment_likes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    }
  };

  const createMockLike = (entityType: string) => {
    const mockLike: any = {
      id: 1, 
      userId: 1, 
      createdAt: new Date()}
    if (entityType === 'post') {
      mockLike.postId = 1;
    } else {
      mockLike.commentsId = 1;  
    }
    return mockLike
  };

  const createMockAction = (entityType: string, entityId: number, actionType: UserActions) => ({
    id: 1,
    action: actionType,
    userId: 1,
    entityType: entityType === 'post' ? 'POST_LIKE' : 'COMMENT_LIKE',
    entityId: entityId,
    entity: {
      id: 1,
      userId: 1,
      [entityType === 'post' ? 'postId' : 'commentId']: entityId,
      createdAt: new Date().toISOString(),
    },
    timestamp: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: ActionsService,
          useValue: {
            addAction: jest.fn(),
          }
        }
      ],
    }).compile();

    likesService = module.get<LikesService>(LikesService);
    prismaService = module.get<PrismaService>(PrismaService);
    actionsService = module.get<ActionsService>(ActionsService);
  });

  it('should be defined', () => {
    expect(likesService).toBeDefined();
  });

  it('should add a like to a post', async () => {
    const mockLike = createMockLike('post');  
    const mockAction = createMockAction('post', 1, UserActions.CREATE);
    
    jest.spyOn(prismaService.post_likes, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.post_likes, 'create').mockResolvedValue(mockLike);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);
  
    const result = await likesService.addLike('post', 1, 1);
  
    expect(result).toEqual({ likePost: mockLike, action: mockAction });
    expect(prismaService.post_likes.create).toHaveBeenCalledWith({
      data: { userId: 1, postId: 1 },
    });
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.CREATE,
      1,
      EntityTypes.POST_LIKE,
      1,
      mockLike
    );
  });

  it('should add a like to a comment', async () => {
    const mockLike = createMockLike('comment');
    const mockAction = createMockAction('comment', 1, UserActions.CREATE);
    
    jest.spyOn(prismaService.comment_likes, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.comment_likes, 'create').mockResolvedValue(mockLike);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const result = await likesService.addLike('comment', 1, 1);

    expect(result).toEqual({ addLike: mockLike, action: mockAction });
    expect(prismaService.comment_likes.create).toHaveBeenCalledWith({
      data: { userId: 1, commentsId: 1 },
    });

    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.CREATE,
      1,
      EntityTypes.COMMENT_LIKE,
      1,
      mockLike
    );
  });

  it('should delete a like from a post', async () => {
    const mockLike = createMockLike('post');
    const mockAction = createMockAction('post', 1, UserActions.DELETE);
    
    jest.spyOn(prismaService.post_likes, 'findUnique').mockResolvedValue(mockLike);
    jest.spyOn(prismaService.post_likes, 'delete').mockResolvedValue(mockLike);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const result = await likesService.deleteLike('delete-post', 1, 1);

    expect(result).toEqual({ deletedLike: mockLike, action: mockAction });
    expect(prismaService.post_likes.delete).toHaveBeenCalledWith({ where: { id: 1 } });

    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.DELETE,
      1,
      EntityTypes.POST_LIKE,
      1,
      mockLike
    );
  });

  it('should delete a like from a comment', async () => {
    const mockLike = createMockLike('comment');
    const mockAction = createMockAction('comment', 1, UserActions.DELETE);
    
    jest.spyOn(prismaService.comment_likes, 'findUnique').mockResolvedValue(mockLike);
    jest.spyOn(prismaService.comment_likes, 'delete').mockResolvedValue(mockLike);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const result = await likesService.deleteLike('delete-comment', 1, 1);

    expect(result).toEqual({ deletedLike: mockLike, action: mockAction });
    expect(prismaService.comment_likes.delete).toHaveBeenCalledWith({ where: { id: 1 } });

    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.DELETE,
      1,
      EntityTypes.COMMENT_LIKE,
      1,
      mockLike
    );
  });

});
