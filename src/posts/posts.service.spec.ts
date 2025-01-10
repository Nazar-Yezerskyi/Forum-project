import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { ActionsService } from 'src/actions/actions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

describe('PostsService', () => {
  let postsService: PostsService;
  let actionsService: ActionsService;
  let prismaService: PrismaService;
  let categoriesService: CategoriesService

  const generateMockPost = (id = 1, authorId = 1, title = "title", description = "description", image = "img") => ({
    id,
    authorId,
    title,
    description,
    image,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    archived: false
  });
  
  const generateMockAction = (post, actionType = 'CREATE', userId = 1) => ({
    id: 1,
    action: actionType,
    userId,
    entityType: 'POST',
    entityId: post.id,
    entity: post,
    timestamp: new Date(),
  });

  const mockPrismaService = {
    posts: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { 
          provide: PrismaService, 
          useValue: mockPrismaService 
        },
        {
          provide: ActionsService,
          useValue:{
            addAction: jest.fn()
          }
        },
        {
          provide: CategoriesService,
          useValue:{
            addCategoryToPost: jest.fn(),
            deletePostCategory: jest.fn()
          }
        }
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    actionsService = module.get<ActionsService>(ActionsService)
    prismaService = module.get<PrismaService>(PrismaService)
    categoriesService = module.get<CategoriesService>(CategoriesService)
  });
             
  it('should be defined', () => {
    expect(postsService).toBeDefined();
  });

  it('should create posts', async () => {
    const mockPost = generateMockPost();
    const mockAction = generateMockAction(mockPost, 'Create');  
  
    mockPrismaService.posts.create.mockResolvedValue(mockPost);
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);
  
    const createdPost = await postsService.createPost(mockPost.title, mockPost.description, mockPost.authorId, mockPost.image);
    const addedAction = await actionsService.addAction(UserActions.CREATE, mockPost.authorId, EntityTypes.POST, mockPost.id, mockPost); 
  
    expect(createdPost.post).toEqual(mockPost);
    expect(addedAction).toEqual(mockAction);
  
    expect(prismaService.posts.create).toHaveBeenCalledWith({
      data: {
        authorId: mockPost.authorId,
        title: mockPost.title,
        description: mockPost.description,
        image: mockPost.image,
      },
    });
  
    expect(actionsService.addAction).toHaveBeenCalledWith(UserActions.CREATE, mockPost.authorId, EntityTypes.POST, mockPost.id, mockPost);  
  });
  
  it('should update post', async () => {
    const mockPost = generateMockPost();
    const mockAction = generateMockAction(mockPost, 'UPDATE');
    const mockUpdatedPost = { ...mockPost, description: "description2", image: "img2", updated: new Date().toISOString() };
  
    mockPrismaService.posts.findUnique.mockResolvedValue(mockPost);
    mockPrismaService.posts.update.mockResolvedValue(mockUpdatedPost);
  
    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);
  
    const updatedPost = await postsService.updatePost(1, 1, mockUpdatedPost.title, mockUpdatedPost.description, mockUpdatedPost.image);
    const addedAction = await actionsService.addAction(UserActions.UPDATE, 1, EntityTypes.POST, 1, mockUpdatedPost);
  
    expect(updatedPost.updatedpost).toEqual(mockUpdatedPost); 
    expect(addedAction).toEqual(mockAction);
  
    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.UPDATE,
      1,
      EntityTypes.POST,
      1,
      mockUpdatedPost
    );
  });
  
  it('should delete post', async () => {
    const mockPost = generateMockPost();
    const mockAction = generateMockAction(mockPost, 'DELETE');

    mockPrismaService.posts.findUnique.mockResolvedValue(mockPost);
    mockPrismaService.posts.delete.mockResolvedValue(mockPost);

    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const deletedPost = await postsService.deletePost(mockPost.id, mockPost.authorId);
    const addedAction = await actionsService.addAction(UserActions.DELETE, mockPost.authorId, EntityTypes.POST, mockPost.id, mockPost);

    expect(deletedPost.deletedPost).toEqual(mockPost);
    expect(addedAction).toEqual(mockAction);

    expect(prismaService.posts.delete).toHaveBeenCalledWith({
      where: { id: mockPost.id },
    });

    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.DELETE,
      mockPost.authorId,
      EntityTypes.POST,
      mockPost.id,
      mockPost
    );
  });

  it('should change archived status', async () => {
    const mockPost = generateMockPost();
    const mockAction = generateMockAction(mockPost, 'UPDATE');
    const mockUpdatedPost = { ...mockPost, archived: "true" };

    mockPrismaService.posts.findUnique.mockResolvedValue(mockPost);
    mockPrismaService.posts.update.mockResolvedValue(mockUpdatedPost);

    jest.spyOn(actionsService, 'addAction').mockResolvedValue(mockAction);

    const updatedPost = await postsService.changeArchivedStatus(mockUpdatedPost.id, mockUpdatedPost.archived, mockUpdatedPost.authorId);
    const addedAction = await actionsService.addAction(UserActions.UPDATE, mockUpdatedPost.authorId, EntityTypes.POST, mockUpdatedPost.id, mockUpdatedPost);

    expect(updatedPost.updatedPost).toEqual(mockUpdatedPost);
    expect(addedAction).toEqual(mockAction);

    expect(actionsService.addAction).toHaveBeenCalledWith(
      UserActions.UPDATE,
      mockUpdatedPost.authorId,
      EntityTypes.POST,
      mockUpdatedPost.id,
      mockUpdatedPost
    );
  });

  it('should add a category to the post', async () => {
    const mockPost = generateMockPost();
    const mockCategory = { id: 1, title: 'Category 1', postId: 1, categoryId: 1, assignedAt: new Date() };

    mockPrismaService.posts.findUnique.mockResolvedValue(mockPost);
    jest.spyOn(categoriesService, 'addCategoryToPost').mockResolvedValue(mockCategory);

    const result = await postsService.addCategoryToPost(mockPost.id, mockPost.authorId, 1);

    expect(result).toEqual(mockCategory);
    expect(categoriesService.addCategoryToPost).toHaveBeenCalledWith(mockPost.id, 1);
  });

  it('should delete category from post', async () => {
    const mockPost = generateMockPost();
    const mockCategory = { id: 1, title: 'Category 1', postId: 1, categoryId: 1, assignedAt: new Date() };

    mockPrismaService.posts.findUnique.mockResolvedValue(mockPost);
    jest.spyOn(categoriesService, 'deletePostCategory').mockResolvedValue(mockCategory);

    const result = await postsService.deletePostCategory(mockPost.id, mockPost.authorId, 1);

    expect(result).toEqual(mockCategory);
    expect(categoriesService.deletePostCategory).toHaveBeenCalledWith(mockPost.id, 1);
  });

});
