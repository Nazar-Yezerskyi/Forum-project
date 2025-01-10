import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RoleService', () => {
  let roleService: RoleService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    roles: {
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
        RoleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    roleService = module.get<RoleService>(RoleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  it('should return all roles', async () => {
    const mockRoles = [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }];
    jest.spyOn(prismaService.roles, 'findMany').mockResolvedValue(mockRoles);

    const roles = await roleService.findAllRoles();
    expect(roles).toEqual(mockRoles);
    expect(prismaService.roles.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return a role by id', async () => {
    const mockRole = { id: 1, name: 'Admin' };
    jest.spyOn(prismaService.roles, 'findUnique').mockResolvedValue(mockRole);

    const role = await roleService.getInfoRole(1);
    expect(role).toEqual(mockRole);
    expect(prismaService.roles.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should create a new role', async () => {
    const mockRole = { id: 1, name: 'Admin' };
    jest.spyOn(prismaService.roles, 'create').mockResolvedValue(mockRole);

    const role = await roleService.createRole('Admin');
    expect(role).toEqual(mockRole);
    expect(prismaService.roles.create).toHaveBeenCalledWith({ data: { name: 'Admin' } });
  });

  it('should update a role by id', async () => {
    const mockRole = { id: 1, name: 'Super Admin' };
    jest.spyOn(prismaService.roles, 'update').mockResolvedValue(mockRole);

    const role = await roleService.updateRole(1, 'Super Admin');
    expect(role).toEqual(mockRole);
    expect(prismaService.roles.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: 'Super Admin',
    });
  });

  
  it('should delete a role by id', async () => {
    const mockRole = { id: 1, name: 'Admin' };
    jest.spyOn(prismaService.roles, 'delete').mockResolvedValue(mockRole);

    const role = await roleService.deleteRole(1);
    expect(role).toEqual(mockRole);
    expect(prismaService.roles.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
  
});
