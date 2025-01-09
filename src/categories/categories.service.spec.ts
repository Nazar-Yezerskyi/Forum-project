import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    categories: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post_categories: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { 
          provide: PrismaService, 
          useValue: mockPrismaService 
        },
      ],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(categoriesService).toBeDefined();
  });

  it('should add a new category', async () => {
    const mockCategory = { id: 1, title: 'categoryTitle', description: 'category description' };
    mockPrismaService.categories.findFirst.mockResolvedValue(null); 
    mockPrismaService.categories.create.mockResolvedValue(mockCategory); 

    const result = await categoriesService.addCategory('categoryTitle', 'category description');

    expect(result).toEqual(mockCategory);
    expect(prismaService.categories.create).toHaveBeenCalledWith({
      data: {
        title: 'categoryTitle',
        description: 'category description',
      },
    });
  });

  it('should throw BadRequestException if category exists', async () => {
    const mockCategory = { id: 1, title: 'categoryTitle', description: 'category description' };
    mockPrismaService.categories.findFirst.mockResolvedValue(mockCategory); 

    await expect(categoriesService.addCategory('categoryTitle', 'category description'))
      .rejects.toThrow(new BadRequestException('Category already exist'));
  });

  it('should update category successfully', async () => {
    const mockCategory = { id: 1, title: 'categoryTitle', description: 'category description' };
    const updatedCategory = { ...mockCategory, description: 'new description' };
    mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory); 
    mockPrismaService.categories.update.mockResolvedValue(updatedCategory); 

    const result = await categoriesService.updateCategory(1, 'categoryTitle', 'new description');

    expect(result).toEqual(updatedCategory);
    expect(prismaService.categories.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'categoryTitle', description: 'new description' },
    });
  });

  it('should throw NotFoundException if category not found', async () => {
    mockPrismaService.categories.findUnique.mockResolvedValue(null); 

    await expect(categoriesService.updateCategory(1, 'categoryTitle', 'new description'))
      .rejects.toThrow(new NotFoundException('Category not found'));
  });

  it('should delete category successfully', async () => {
    const mockCategory = { id: 1, title: 'categoryTitle', description: 'category description' };
    mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
    mockPrismaService.categories.delete.mockResolvedValue(mockCategory); 
    const result = await categoriesService.deleteCategory(1);

    expect(result).toEqual(mockCategory);
    expect(prismaService.categories.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should return posts for a category', async () => {
    const mockCategory = { id: 1, title: 'categoryTitle' };
    const mockPosts = [{ id: 1, postId: 1 }];
    mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory); 
    mockPrismaService.post_categories.findMany.mockResolvedValue(mockPosts);

    const result = await categoriesService.findPostsByCategory(1);

    expect(result).toEqual(mockPosts);
    expect(prismaService.post_categories.findMany).toHaveBeenCalledWith({
      where: { categoryId: 1 },
    });
  });
  
});