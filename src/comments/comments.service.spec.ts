import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { ActionsService } from 'src/actions/actions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let actionsService: ActionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    comments: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { 
          provide: PrismaService, 
          useValue: mockPrismaService 
        },
        {
          provide: ActionsService,
          useValue:{
            addAction: jest.fn()
          }
        }
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    actionsService = module.get<ActionsService>(ActionsService);
    prismaService = module.get<PrismaService>(PrismaService)
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  it('should add comment', async () => {
    const mockComment = { id: 1, postId: 1, userId: 1, content: 'comment' };
    const mockAction = { id: 1, action: 'CREATE', userId: 1, entityType: 'COMMENT', entityId: 1, entity: mockComment, timestamp: new Date() };
  
    mockPrismaService.comments.create.mockResolvedValue(mockComment);
    
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);
  
    const createdComment = await commentsService.createComment(1, 1, 'comment');
    const addedAction = await actionsService.addAction(UserActions.CREATE, 1, EntityTypes.COMMENT, 1, mockComment);
    expect(createdComment.comment).toEqual(mockComment);
    expect(addedAction).toEqual(mockAction);
  
    expect(prismaService.comments.create).toHaveBeenCalledWith({
      data: {
        postId: 1,
        userId: 1,
        content: 'comment',
      },
    });
  
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.CREATE,
      1,
      EntityTypes.COMMENT,
      1,
      mockComment
    );
  });

  it('should update comment',async () => {
    const mockComment = {id: 1,postId: 1, userId:1, content: "comment"};
    const mockupdatedComment = {...mockComment, content: "comment comment"}
    const mockAction = { id: 1, action: 'UPDATE', userId: 1, entityType: 'COMMENT', entityId: 1, entity: mockComment, timestamp: new Date() };
    
    mockPrismaService.comments.findUnique.mockResolvedValue(mockComment)
    mockPrismaService.comments.update.mockResolvedValue(mockupdatedComment)

    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const updatedComment = await commentsService.updateComment(1,1,"comment comment",1)
    const addedAction = await actionsService.addAction(UserActions.UPDATE,1,EntityTypes.COMMENT,1,mockComment)
   
    expect(updatedComment.updatedComment).toEqual(mockupdatedComment);
    expect(addedAction).toEqual(mockAction);
  
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.UPDATE,
      1,
      EntityTypes.COMMENT,
      1,
      mockupdatedComment
    );
  })

  it('should delete comment', async () => {
    const mockComment = {id: 1,postId: 1, userId:1, content: "comment"};
    const mockAction = { id: 1, action: 'DELETE', userId: 1, entityType: 'COMMENT', entityId: 1, entity: mockComment, timestamp: new Date() };

    mockPrismaService.comments.findUnique.mockResolvedValue(mockComment)
    mockPrismaService.comments.delete.mockResolvedValue(mockComment)

    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const result = await commentsService.deleteComment(mockComment.id, mockComment.userId)
    const addedAction = await actionsService.addAction(UserActions.DELETE,1,EntityTypes.COMMENT,1,mockComment)

    expect(result.deletedComment).toEqual(mockComment);
    expect(addedAction).toEqual(mockAction);
  
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.DELETE,
      1,
      EntityTypes.COMMENT,
      1,
      mockComment
    );
  })
});
